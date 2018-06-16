const {
	NODE_ENV = "develop",
	FUNCTION_NAME,
	SERVICE_NAME = FUNCTION_NAME
} = process.env;

const crypto = require("crypto");

const parse = Symbol();
const parseError = Symbol();
const write = Symbol();
const log = Symbol();

class Log {
	constructor({ headers = {}, level, service = SERVICE_NAME } = {}) {
		this.city = headers["x-appengine-city"];
		this.country = headers["x-appengine-country"] || headers["CloudFront-Viewer-Country"];
		this.request_id = crypto.randomBytes(20).toString("hex");
		this.user_ip = headers["x-appengine-user-ip"];
		this.stream = process.stdout;
		this.level = level;
		this.service = service;
	}

	[log](data, level) {
		if (level < this.level) return;
		this[write](this[parse](data, level));
	}

	[parse](data, level) {
		const base = Object.assign({ level }, this.getBase());

		if (typeof data === "string") data = { message: data }; // make it an object so we can assign it
		if (level > Log.Level.INFO && !(data instanceof Error)) data = this[parseError](data);
		if (data instanceof Error) data = this[parseError](data);

		return JSON.stringify(Object.assign(base, data, { stack: data.stack }));
	}

	[parseError](error) {
		if (!error.stack) Error.captureStackTrace(error);
		return { stack: error.stack, message: error.message };
	}

	[write](string) {
		this.stream.write(string);
	}

	fatal(data) {
		this[log](data, Log.Level.FATAL);
	}

	error(data) {
		this[log](data, Log.Level.ERROR);
	}

	warn(data) {
		this[log](data, Log.Level.WARN);
	}

	info(data) {
		this[log](data, Log.Level.INFO);
	}

	debug(data) {
		this[log](data, Log.Level.DEBUG);
	}

	trace(data) {
		this[log](data, Log.Level.TRACE);
	}

	getBase() {
		return {
			request_id: this.request_id,
			service: this.service,
			environment: NODE_ENV,
			city: this.city,
			country: this.country,
			user_ip: this.user_ip
		};
	}
}

Log.Level = {
	ALL: 0,
	TRACE: 100,
	DEBUG: 200,
	INFO: 300,
	WARN: 400,
	ERROR: 500,
	FATAL: 600
};

module.exports = Log;
