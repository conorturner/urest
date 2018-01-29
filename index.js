"use strict";

const uuidv4 = require("uuid/v4");
const UErrors = require("./library/UErrors")({uuidv4});
const Rest = require("./library/Rest");
const Router = require("./library/Router");

module.exports = {
	UErrors,
	Rest,
	Router,
	getEnv (runningDir){
		let environment, secrets;

		try {
			environment = require(runningDir + "/environment.json");
		}
		catch (e) {
			environment = {};
		}

		try {
			secrets = require(runningDir + "/secrets.json");
		}
		catch (e) {
			secrets = {};
		}

		return Object.assign({}, process.env, secrets, environment);
	}
};