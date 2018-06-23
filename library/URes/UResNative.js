const URes = require("./URes");

const send = Symbol.for("send");


class UResNative extends URes {

	constructor({ req, res, log }) {
		super({});

		this.req = req;
		this.log = log;
		this[send] = (ret) => {

			if (typeof ret === "string" || Buffer.isBuffer(ret)) {
				res.writeHead(this.statusCode, this.headers);
				res.end(ret);
			}
			else {
				res.writeHead(this.statusCode, Object.assign(this.headers, { "Content-Type": "application/json" }));
				res.end(JSON.stringify(ret));
			}
		};
	}

}

module.exports = UResNative;