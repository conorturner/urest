const EventEmitter = require('events');

class URes extends EventEmitter { //TODO: make this an event emitter

	constructor({ res, e, callback }) {
		super();
		this.zero = process.hrtime();
		this.statusCode = 200;

		if (res) this.initNative({ res });
		if (e) this.initLambda({ e, callback });
	}

	initLambda({ e, callback }) {
		this.platform = {
			send: (ret) => {

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

			}
		};
	}

	initNative({ res }) {
		this.platform = {
			send: (ret) => {

				if (typeof ret === "number") {
					res.writeHead(ret);
					res.end(); // TODO: have it send some json here
				}
				else {
					res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify(ret));
				}

			}
		};
	}

	send() {
		this.platform.send(...arguments);
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