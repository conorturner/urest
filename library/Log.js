"use strict";

const {
	NODE_ENV = "develop",
	FUNCTION_NAME,
	SERVICE_NAME = FUNCTION_NAME
} = process.env;

const uuidv4 = require("uuid/v4");

class Log {
	constructor(headers) {
		this.city = headers["x-appengine-city"];
		this.country = headers["x-appengine-country"];
		this.request_id = uuidv4();
		this.user_ip = headers["x-appengine-user-ip"];
	}

	fatal(fatal) {
		console.error(this.sanitise({fatal}, true)); // probs wanna log this as json too for searching
	}

	error(error) {
		console.error(this.sanitise({error}, true)); // probs wanna log this as json too for searching
	}

	warn(warn) {
		console.log(this.sanitise({warn}));
	}

	info(info) {
		console.log(this.sanitise({info}));
	}

	debug(debug) {
		console.log(this.sanitise({debug}));
	}

	sanitise(obj, reportError) {
		return Object.keys(obj).map(key => {
			const base = Object.assign({level: key}, this.getBase());

			if (reportError) {
				if (!(obj[key] instanceof Error)) obj[key] = new Error(obj[key]);
				obj[key].level = key;
				return Object.assign(obj[key], base);
			}
			else {
				if (typeof obj[key] !== "object") obj[key] = {[key]: obj[key]}; // make it an object so we can assign it
				return JSON.stringify(Object.assign(base, obj[key]));

			}
		})[0];
	}

	getBase() {
		return {
			request_id: this.request_id,
			service: SERVICE_NAME,
			environment: NODE_ENV,
			city: this.city,
			country: this.country,
			user_ip: this.user_ip
		};
	}
}


module.exports = Log;

