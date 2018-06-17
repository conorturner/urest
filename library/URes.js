const EventEmitter = require("events");
const { UInternalServerError } = require("./UErrors");

const send = Symbol();

class URes extends EventEmitter {

	constructor({ req, res, callback }) {
		super();
		this.zeroTime = process.hrtime();
		this.statusCode = 200;
		this.hasRunIntercept = false;
		this.req = req;
		this.res = res;
		this.responseData = undefined;
		this.headers = {};

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

	runInterceptors() {
		if (!this.intercept || this.intercept.length === 0) return false; // tell caller we didn't run
		this.hasRunIntercept = true;

		const { req } = this;
		const res = this;

		const runIntercept = (next, i) => {
			const intercept = this.intercept[i];

			try {
				if (intercept) intercept(req, res, next);
				else this.send(this.responseData); // send it, intercepts may have transformed it
			}
			catch (e) {
				URes.returnError(new UInternalServerError(e), req, res);
			}
		};

		let i = 0;
		const next = (err) => {
			if (err) return URes.returnError(err, req, res);
			i++;
			runIntercept(next, i);
		};

		runIntercept(next, i);

		return true; // tell caller we had something to run
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
				res.writeHead(ret, this.headers);
				res.end(); // TODO: have it send some json here
			}
			else {
				res.writeHead(this.statusCode, Object.assign(this.headers, { "Content-Type": "application/json" }));
				res.end(JSON.stringify(ret));
			}

		};
	}

	send(...args) {
		if (typeof args[0] === "number") {
			this.statusCode = args[0];
			args[0] = args[1];
		}

		const [data] = args;
		this.responseData = data;

		if (this.hasRunIntercept || !this.runInterceptors()) {
			this.emit("response", this);
			this[send](this.responseData);
		}

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
