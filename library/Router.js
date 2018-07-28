const fs = require("fs");
const pathLib = require("path");

const addRoute = Symbol("addRoute");
const parseRoute = Symbol("parseRoute");

class Router {

	constructor() {
		this.routes = [];
		this.middleware = [];
		this.intercept = [];
	}

	use(path, router) {
		if (path.constructor && path.constructor.name === "Router") {
			router = path;
			path = "/";
		}
		if (!(path && router)) throw new Error("Provide both path and router");

		router.routes.forEach(route => {
			route.handlers = router.middleware.concat(route.handlers);
			route.intercept = router.intercept.concat(route.intercept);

			const base = Object.assign({}, route, { path: path + route.path });
			this.routes.push(Object.assign(base, Router[parseRoute](path + route.path)));
		});
	}

	pre(middleware) {
		this.middleware.push(middleware);
	}

	int(intercept) {
		this.intercept.push(intercept);
	}

	get(...args) {
		this[addRoute]("get", args);
	}

	put(...args) {
		this[addRoute]("put", args);
	}

	post(...args) {
		this[addRoute]("post", args);
	}

	delete(...args) {
		this[addRoute]("delete", args);
	}

	route(path) {
		const self = this;
		const proxyRouter = {};

		const proxyMethod = (method) => function (...args) { // this is mad but good
			self[addRoute](method, [path, ...args]);
			return proxyRouter;
		};

		Object.assign(proxyRouter, {
			get: proxyMethod("get"),
			put: proxyMethod("put"),
			post: proxyMethod("post"),
			delete: proxyMethod("delete")
		});

		return proxyRouter;
	}

	serve(path, localPath, options = {}) {
		const { notFound, index } = options;

		this[addRoute]("get", pathLib.join(path, "/:pathFilename"), (req, res) => {
			const { pathFilename } = req.params;
			const resultantPath = pathLib.join(localPath, pathFilename);

			fs.lstat(resultantPath, (err, stats) => {
				if (err) return console.log(err); //Handle error

				console.log(`Is file: ${stats.isFile()}`);
				console.log(`Is directory: ${stats.isDirectory()}`);
			});
		});
	}

	[addRoute](method, args) {
		if (typeof args[0] !== "string") throw new Error("first arg must be string");
		const [path, ...handlers] = args;

		const { tokens, regex } = Router[parseRoute](path);

		this.routes.push({ regex, tokens, method, path, handlers, intercept: [] });
	}

	static [parseRoute](path) {
		const tokens = path
			.split("/")
			.filter(token => token !== "")
			.map(token => {
				if (token.startsWith(":")) return { param: token.substr(1) }; // a defined param
				else if (token === "*") return { wildcard: true, param: "*" }; // match anything
				else return token;
			});

		const regexTokens = tokens.map(token => {
			if (typeof token === "string") return token;
			else if (token.wildcard) return "(.+)";
			else return "([^\\/]+)";
		});

		const regexString = "^\\/" + regexTokens.join("\\/");
		const endDelimiter = tokens.length > 0 && tokens[tokens.length - 1].wildcard ? "" : "$"; // if last token is wildcard do not end delimit.
		const regex = new RegExp(regexString + endDelimiter);

		return { regex, tokens };
	}

}

module.exports = Router;
