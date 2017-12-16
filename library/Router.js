"use strict";

class Router {

	constructor() {
		this.routes = [];
		this.middleware = [];
	}

	use (path, router) {
		if(!(path && router)) throw new Error("Provide both path and router");

		router.routes.forEach(route => {
			route.handlers = router.middleware.concat(route.handlers);
			this.routes.push(Object.assign({}, route, {path: path + route.path}, Router.parseRoute(path + route.path)))
		});
	}

	pre (middleware) {
		this.middleware.push(middleware);
	}

	get (){
		this._addRoute("get", arguments);
	}

	put (){
		this._addRoute("put", arguments);
	}

	post (){
		this._addRoute("post", arguments);
	}

	delete (){
		this._addRoute("delete", arguments);
	}

	_addRoute (method, args) {
		if(typeof args[0] !== "string") throw new Error("first arg must be string");
		const [path, ...handlers] = args;

		const {tokens, regex} = Router.parseRoute(path);

		this.routes.push({regex, tokens, method, path, handlers});
	}

	static parseRoute (path) {
		const tokens = path
			.split("/")
			.filter(token => token !== "")
			.map(token => token.startsWith(":") ? {param: token.substr(1)} : token);


		const regexString = "\\/" + tokens.map(token => typeof token === "object" ? "([^\\/]+)" : token).join("\\/");
		const regex = new RegExp(regexString);

		return {regex, tokens};
	}

}

module.exports = Router;
