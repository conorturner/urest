const Router = require("./Router");
const Log = require("./Log");
const UReq = require("./UReq");
const URes = require("./URes/URes");
const UResLambda = require("./URes/UResLambda");
const UResNative = require("./URes/UResNative");
const UResGCF = require("./URes/UResGCF");
const { UInternalServerError } = require("./UErrors");

const defaultName = process.env.FUNCTION_NAME || process.env.AWS_LAMBDA_FUNCTION_NAME;

const logRequest = Symbol("logRequest");
const logResponse = Symbol("logResponse");
const handleCors = Symbol("handleCors");

class Rest extends Router {
	constructor({ name = defaultName, log, logRequests } = {}) {
		super();
		this.name = name;
		this.log = log;
		this.logRequests = logRequests;
	}

	[logRequest](req) {
		req.log.info({ event: "Request", method: req.method, path: req.path || req.url, body: req.body });
	}

	[logResponse](req, res) {
		//TODO: some clever stuff to handle other body types than json here
		const diff = process.hrtime(res.zeroTime);
		const duration = (diff[0] * 1e9 + diff[1]) / 1e6;
		req.log.info({ event: "Response", status: res.statusCode, body: res.body, duration });
	}

	[handleCors](req, res) {
		const origin = req.headers.origin;
		if (this.corsConfig.includes(origin)) {
			res.headers["Access-Control-Allow-Origin"] = origin;
			res.headers["Access-Control-Allow-Methods"] = "*";
			res.headers["Access-Control-Allow-Headers"] = "*";
			res.send(204);
		}
		else res.send(404);
	}

	query(req, res, log) {
		if (this.log) req.log = this.log;
		else req.log = log;

		if (this.logRequests) {
			this[logRequest](req);
			res.on("response", () => this[logResponse](req, res));
		}

		const reqUrl = req.url;
		const { method: reqMethod, path: reqPath = reqUrl } = req;

		const matched = this.routes
			.filter(({ method }) => method === reqMethod.toLowerCase())
			.map(route => Object.assign(route, { match: route.regex.exec(reqPath) }))
			.filter(({ match }) => match !== null)[0];

		if (!matched) {
			if (reqMethod.toLowerCase() === "options" && this.corsConfig) return this[handleCors](req, res);
			return res.status(404).send(); //TODO: make this customizable
		}

		const handlers = this.middleware.concat(matched.handlers);
		const intercept = this.intercept.concat(matched.intercept);

		req.params = this.getParams(matched.match, matched.tokens);
		res.setIntercept(intercept);

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

			try {
				if (handler) handler(req, res, next);
			}
			catch (e) {
				URes.returnError(new UInternalServerError(e), req, res);
			}
		};

		let i = 0;
		const next = (err) => {
			if (err) return URes.returnError(err, req, res);
			i++;
			runHandler(next, i);
		};

		runHandler(next, i);
	}

	cors(corsConfig) {
		this.corsConfig = corsConfig;
	}

	gcf() {
		return {
			urest: (req, res) => {
				const log = new Log({ headers: req.headers });
				const ureq = new UReq({ req, res });
				const ures = new UResGCF({ req, res, log });

				this.query(ureq, ures, new Log({ headers: req.headers }));
			}
		};
	}

	lambda(e) {
		return new Promise(callback => {
			const log = new Log({ headers: e.headers });
			const req = new UReq({ e, log });
			const res = new UResLambda({ e, callback, log, req });

			this.query(req, res, new Log({ headers: req.headers }));
		});
	}

	native() {
		const http = require("http");

		const server = http.createServer((req, res) => {
			const log = new Log({ headers: req.headers });
			const ureq = new UReq({ req, res });
			const ures = new UResNative({ req, res, log });

			this.query(ureq, ures, log);
		});

		server.on("clientError", (err, socket) => socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"));
		return server;
	}
}

module.exports = Rest;