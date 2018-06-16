const url = require("url");
const querystring = require("querystring");

class UReq {
	static native(req) {
		if (req.on) req.on("error", (err) => req.log.error(err));
		const parsed = url.parse(req.url);

		req.path = parsed.pathname;
		req.query = querystring.parse(parsed.query);

		return req;
	}

	static lambda(e, self) {
		const { headers, path, httpMethod, body, queryStringParameters } = e;

		Object.assign(self, {
			headers,
			path,
			method: httpMethod,
			body,
			query: queryStringParameters === null ? {} : queryStringParameters
		});
	}

	constructor({ e, req }) {
		if (e) UReq.lambda(e, this);
		if (req) return UReq.native(req);
	}


}

module.exports = UReq;