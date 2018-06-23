const URes = require("./URes");

const send = Symbol.for("send");


class UResLambda extends URes {

	constructor({ e, callback, log, req }) {
		super();

		this.log = log;
		this.req = req;
		this[send] = (ret) => {
			if (Buffer.isBuffer(ret)) callback({
				statusCode: this.statusCode,
				body: ret.toString(),
				headers: this.headers
			});

			switch (typeof ret) {
				case "string": {
					callback({ statusCode: this.statusCode, body: ret, headers: this.headers });
					break;
				}
				case "object": {
					callback({ statusCode: this.statusCode, body: JSON.stringify(ret), headers: this.headers });
					break;
				}
				default: {
					callback({ statusCode: this.statusCode, headers: this.headers });
					break;
				}
			}

		};
	}

}

module.exports = UResLambda;