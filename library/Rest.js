"use strict";

const Router = require("./Router");

class Rest extends Router {
	constructor({name} = {}) {
		super();
		this.name = name;
	}

	query(req, res) {

		const {method: reqMethod, path: reqPath} = req;

		const matched = this.routes
			.filter(({method}) => method === reqMethod.toLowerCase())
			.map(({handlers, regex}) => ({handlers, match: regex.exec(reqPath)}))
			.filter(({match}) => match !== null)[0];

		if (!matched) return res.status(404).end(); //TODO: make this customizable

		const handlers = this.middleware.concat(matched.handlers);

		this.runHandlers(req, res, handlers);
	}

	runHandlers (req, res, handlers) {
		const runHandler = (next, i) => {
			const handler = handlers[i];
			if(handler) handler(req, res, next);
		};

		let i = 0;
		const next = (err) => {
			i++;
			runHandler(next, i);
		};

		runHandler(next, i);
	}

}

module.exports = Rest;