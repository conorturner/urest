const EventEmitter = require("events");

const send = Symbol();

class URes extends EventEmitter {

	constructor({ req, res, callback }) {
		super();
		this.zero = process.hrtime();
		this.statusCode = 200;
		this.req = req;
		this.res = res;

		if (res) this.initNative({ req, res });
		if (callback) this.initLambda({ req, callback });
	}

	setIntercept(intercept) {
		this.intercept = intercept;
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
		this.emit("res", this.res);
		if (this.intercept && this.intercept.length > 0) {
			console.log(this.intercept);
			// console.log(this.intercept.length)
		}

		this[send](...args);
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