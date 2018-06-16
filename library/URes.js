const EventEmitter = require("events");
const { UInternalServerError } = require("./UErrors");

const send = Symbol();

class URes extends EventEmitter {

	constructor({ req, res, callback }) {
		super();
		this.zeroTime = process.hrtime();
		this.statusCode = 200;
		this.hasRunIntercept = false;
		this.headersSent = false;
		this.req = req;
		this.res = res;

		if (res) this.initNative({ req, res });
		if (callback) this.initLambda({ req, callback });
	}

	static returnError(err, req, res) {

		req.log.error(err);

		const body = {
			code: err.code,
			eid: err.eid
		};

		res.status(err.statusCode).send(body);
	}

	setIntercept(intercept) {
		this.intercept = intercept;
	}

	runInterceptors(data) {
		if (!this.intercept || this.intercept.length === 0) return Promise.resolve(data);
		this.hasRunIntercept = true;

		const { req } = this;
		const res = this;

		return this.intercept.reduce((promise, intercept) => promise.then(data => {
			if (this.headersSent) return data; // don't run intercept if previous error, or if headers sent

			return intercept(req, res, data)
				.catch(err => URes.returnError(new UInternalServerError(err), req, res));

		}), Promise.resolve(data));
	}

	initLambda({ e, callback }) {
		this[send] = (ret) => {

			switch (typeof ret) {
				case "number": {
					callback({ statusCode: ret });
					break;
				}
				case "string": {
					callback({ statusCode: this.statusCode, body: JSON.stringify({ message: ret }) });
					break;
				}
				case "object": {
					callback({ statusCode: this.statusCode, body: JSON.stringify(ret) });
					break;
				}
				default: {
					callback({ statusCode: this.statusCode });
					break;
				}
			}

		};
	}

	initNative({ req, res }) {
		this[send] = (ret) => {

			if (typeof ret === "number") {
				res.writeHead(ret);
				res.end(); // TODO: have it send some json here
			}
			else {
				res.writeHead(this.statusCode, { "Content-Type": "application/json" });
				res.end(JSON.stringify(ret));
			}

		};
	}

	send(...args) {
		const sendFunctor = (data) => { // finally do the send
			if (this.headersSent) return;

			this.headersSent = true;
			this.emit("res", this.res);
			this[send](data);
		};

		if (typeof args[0] === "number") {
			this.statusCode = args[0];
			args[0] = args[1];
		}

		const [data] = args;

		if (this.hasRunIntercept) sendFunctor(data);
		else this.runInterceptors(data).then(sendFunctor);

		return this;
	}

	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}

	sendStatus(statusCode) {
		this.statusCode = statusCode;
		this.send();
	}

}

module.exports = URes;
