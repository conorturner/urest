"use strict";

const Router = require("./Router");
const Log = require("./Log");

class Rest extends Router {
	constructor({ name = process.env.FUNCTION_NAME } = {}) {
		super();
		this.name = name;
	}

	query(req, res) {
		const log = new Log(req.headers);
		log.info({ event: "Request", method: req.method, path: req.path || req.url });
		req.log = log;
		res.log = log;
		res = Rest.addHelperMethods(res);

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

	static addHelperMethods(res) {
		if (!res.send) {
			res.send = (ret) => {
				if (typeof ret === "number") {
					res.writeHead(ret);
					res.end(); // TODO: have it send some json here
				}
				else {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify(ret));
				}
			};
		}

		if (!res.status) {
			res.status = (code) => ({
				send: (data) => {
					if(data) {
						res.writeHead(code, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify(data));
					}
					else {
						res.writeHead(code);
						res.end();
					}
				}
			});
		}

		return res;
	}

	export() {
		return { urest: (req, res) => this.query(req, res) };
	}

	native () {
		const http = require('http');

		const server = http.createServer((req, res) => this.query(req, res));

		server.on('clientError', (err, socket) => {
			socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
		});

		return server;
	}
}

module.exports = Rest;