const URes = require("./URes");

const send = Symbol.for("send");


class UResGCF extends URes {

	constructor({ req, res, log }) {
		super({});

		this.req = req;
		this.log = log;
		this[send] = (ret) => {
			Object.keys(this.headers).forEach(key => res.set(key, this.headers[key]));
			if (typeof ret === "number") res.status(ret).send(); // TODO: have it send some json here
			else if (Buffer.isBuffer(ret)) res.status(this.statusCode).send(ret);
			else {
				res.set("Content-Type", "application/json");
				res.status(this.statusCode).send(ret);
			}
		};
	}

}

module.exports = UResGCF;