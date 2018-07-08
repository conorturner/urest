const EventEmitter = require("events");
const { UInternalServerError } = require("../UErrors");

const send = Symbol.for("send");

class URes extends EventEmitter {

	constructor() {
		super();
		this.zeroTime = process.hrtime();
		this.statusCode = 200;
		this.hasRunIntercept = false;
		this.responseData = undefined;
		this.headers = {};
	}

	static returnError(err, req, res) {
		res.log.error(err);

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
