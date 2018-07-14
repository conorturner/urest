const url = require("url");
const querystring = require("querystring");

class UReq {
	static native(req, log) { // this is actually native and gcloud
		req.log = log;
		if (req.on) req.on("error", (err) => log.error(err));
		const parsed = url.parse(req.url);

		req.headers = req.headers || {};
		if (req.path === undefined) req.path = parsed.pathname;
		req.query = typeof req.query === "object" ? req.query : querystring.parse(parsed.query);

		return req;
	}

	static lambda(e, self, log) {
		self.log = log;
		const { headers, path, httpMethod, body, queryStringParameters } = e;
		Object.assign(self, {
			headers,
			path,
			method: httpMethod,
			body,
			query: queryStringParameters === null ? {} : queryStringParameters
		});
	}

	constructor({ e, req, log }) {
		if (e) UReq.lambda(e, this, log);
		if (req) return UReq.native(req, log);
	}


}

module.exports = UReq;