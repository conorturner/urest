"use strict";

const restifyErrors = require("restify-errors");

module.exports = ({uuidv4}) => {
	return Object.keys(restifyErrors).reduce((acc, key) => {
		acc[key] = restifyErrors[key];
		acc[`U${key}`] = function (details) {
			const uuid = uuidv4();
			const error = new restifyErrors[key](details);
			return Object.assign(error, {uuid, message: `${uuid} ` + (error.message || "")});
		};

		return acc;
	}, {});

};
