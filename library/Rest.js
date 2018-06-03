"use strict";

const Router = require("./Router");
const Log = require("./Log");
const UReq = require("./UReq");
const URes = require("./URes");

const defaultName = process.env.FUNCTION_NAME || process.env.AWS_LAMBDA_FUNCTION_NAME;

class Rest extends Router {
	constructor({ name = defaultName } = {}) {
		super();
		this.name = name;
	}

	query(req, res) {
		const log = new Log(req.headers);
		log.info({ event: "Request", method: req.method, path: req.path || req.url });
		req.log = log;
		res.log = log;

		const reqUrl = req.url;
		const { method: reqMethod, path: reqPath = reqUrl } = req;

		const matched = this.routes
			.filter(({ method }) => method === reqMethod.toLowerCase())
			.map(({ handlers, regex, tokens }) => ({ handlers, tokens, match: regex.exec(reqPath) }))
			.filter(({ match }) => match !== null)[0];

		if (!matched) return res.status(404).send(); //TODO: make this customizable

		const handlers = this.middleware.concat(matched.handlers);
		req.params = this.getParams(matched.match, matched.tokens);

		this.runHandlers(req, res, handlers);
	}

	getParams(match, tokens) {
		return tokens
			.filter(token => typeof token === "object")
			.map(({ param }) => param)
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

	gcf() {
		return { urest: (req, res) => this.query(req, res) };
	}

	lambda (e) {
		return new Promise(callback => {
			const req = UReq.lambda(e);
			const res = URes.lambda(e, callback);

			this.query(req, res);
		});
	}

	native () {
		const http = require('http');
		const server = http.createServer((req, res) => this.query(UReq.native(req), URes.native(res)));
		server.on('clientError', (err, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));
		return server;
	}
}

module.exports = Rest;