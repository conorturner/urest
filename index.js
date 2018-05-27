"use strict";

const uuidv4 = require("uuid/v4");
const UErrors = require("./library/UErrors")({uuidv4});
const Rest = require("./library/Rest");
const Router = require("./library/Router");

module.exports = {
	UErrors,
	Rest,
	Router
};