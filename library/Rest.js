"use strict";

const Router = require("./Router");
const uuidv4 = require("uuid/v4");
const Log = require("./Log");

class Rest extends Router {
	constructor({name = process.env.FUNCTION_NAME} = {}) {
		super();
		this.name = name;
	}

	urest(req, res) {
		const log = new Log(req.headers);
		log.info({event: "Request", method: req.method, path: req.path || req.url});
		req.log = log;

		const reqUrl = req.url;
		const {method: reqMethod, path: reqPath = reqUrl} = req;

		const matched = this.routes
			.filter(({method}) => method === reqMethod.toLowerCase())
			.map(({handlers, regex, tokens}) => ({handlers, tokens, match: regex.exec(reqPath)}))
			.filter(({match}) => match !== null)[0];

		if (!matched) return res.status(404).end(); //TODO: make this customizable

		const handlers = this.middleware.concat(matched.handlers);
		req.params = this.getParams(matched.match, matched.tokens);

		this.runHandlers(req, res, handlers);
	}

	getParams(match, tokens) {
		return tokens
			.filter(token => typeof token === "object")
			.map(({param}) => param)
			.reduce((acc, param, index) => {
				acc[param] = match[index + 1];
				return acc;
			}, {});
	}

	runHandlers(req, res, handlers) { // This is special, lol
		const runHandler = (next, i) => {
			const handler = handlers[i];
			if (handler) handler(req, res, next);
		};

		let i = 0;
		const next = (err) => {
			if (err) return Rest.onError(err, req, res);
			i++;
			runHandler(next, i);
		};

		runHandler(next, i);
	}

	static onError(err, req, res) {
		req.log.error(err);

		const body = {
			code: err.code,
			eid: err.uuid
		};

		res.status(err.statusCode).send(body);
	}

	getEnv (){

	}
}

module.exports = Rest;