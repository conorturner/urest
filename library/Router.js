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
			this.routes.push(Object.assign(base, Router.parseRoute(path + route.path)));
		});
	}

	pre(middleware) {
		this.middleware.push(middleware);
	}

	incpt(intercept) {
		this.intercept.push(intercept);
	}

	get(...args) {
		this._addRoute("get", args);
	}

	put(...args) {
		this._addRoute("put", args);
	}

	post(...args) {
		this._addRoute("post", args);
	}

	delete(...args) {
		this._addRoute("delete", args);
	}

	route(path) {
		const self = this;
		const miniRouter = {};

		const proxyMethod = (method) => function (...args) {
			self._addRoute(method, [path, ...args]);
			return miniRouter;
		};

		Object.assign(miniRouter, {
			get: proxyMethod("get"),
			put: proxyMethod("put"),
			post: proxyMethod("post"),
			delete: proxyMethod("delete")
		});

		return miniRouter;
	}

	_addRoute(method, args) {
		if (typeof args[0] !== "string") throw new Error("first arg must be string");
		const [path, ...handlers] = args;

		const { tokens, regex } = Router.parseRoute(path);

		this.routes.push({ regex, tokens, method, path, handlers, intercept: [] });
	}

	static parseRoute(path) {
		const tokens = path
			.split("/")
			.filter(token => token !== "")
			.map(token => token.startsWith(":") ? { param: token.substr(1) } : token);


		const regexString = "^\\/" + tokens.map(token => typeof token === "object" ? "([^\\/]+)" : token).join("\\/");
		const regex = new RegExp(regexString + "$");

		return { regex, tokens };
	}

}

module.exports = Router;
