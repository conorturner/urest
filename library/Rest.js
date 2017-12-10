"use strict";

const Router = require("./Router");

class Rest extends Router {
	constructor({name} = {}) {
		super();
		this.name = name;
		this.onErrorFunctor = (err) => console.error(err);
	}

	query(req, res) {

		const {method: reqMethod, path: reqPath} = req;

		const matched = this.routes
			.filter(({method}) => method === reqMethod.toLowerCase())
			.map(({handlers, regex, tokens}) => ({handlers, tokens, match: regex.exec(reqPath)}))
			.filter(({match}) => match !== null)[0];

		if (!matched) return res.status(404).end(); //TODO: make this customizable

		const handlers = this.middleware.concat(matched.handlers);
		req.params = this.getParams(matched.match, matched.tokens);

		this.runHandlers(req, res, handlers);
	}

	getParams (match, tokens) {
		return tokens
			.filter(token => typeof token === "object")
			.map(({param}) => param)
			.reduce((acc, param, index) => {
			acc[param] = match[index +1];
			return acc;
		}, {});
	}

	runHandlers (req, res, handlers) {
		const runHandler = (next, i) => {
			const handler = handlers[i];
			if(handler) handler(req, res, next);
		};

		let i = 0;
		const next = (err) => {
			if(err) return this.onErrorFunctor(err);
			i++;
			runHandler(next, i);
		};

		runHandler(next, i);
	}

	onError(functor){
		this.onErrorFunctor = functor;
	}

}

module.exports = Rest;