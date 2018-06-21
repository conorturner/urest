const URes = require("./URes");

const send = Symbol.for("send");


class UResLambda extends URes {

	constructor({ e, callback, log, req }) {
		super();

		this.log = log;
		this.req = req;
		this[send] = (ret) => {
			if (Buffer.isBuffer(ret)) callback({ statusCode: this.statusCode, body: ret.toString() });

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

}

module.exports = UResLambda;