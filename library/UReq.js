const url = require("url");
const querystring = require("querystring");

class UReq {
	static native(req, log) { // this is actually native and gcloud
		req.log = log;
		if (req.on) req.on("error", (err) => log.error(err));
		const parsed = url.parse(req.url);

		req.headers = req.headers || {};

		if (req.path === undefined) req.path = parsed.pathname;
		if (req.path.length > 1  && req.path.endsWith("/")) req.path = req.path.slice(0, -1); // strip trailing / from paths such as this/example/

		req.query = typeof req.query === "object" ? req.query : querystring.parse(parsed.query);

		return req;
	}

	static lambda(e, self, log) {
		self.log = log;
		const { headers, path, httpMethod, body, queryStringParameters } = e;

		Object.assign(self, {
			headers: headers || {},
			path: path.length > 1  && path.endsWith("/") ? path.slice(0, -1) : path, // strip trailing / from paths such as this/example/
			method: httpMethod,
			body,
			query: queryStringParameters === null ? {} : queryStringParameters
		});
	}

	constructor({ e, req, log }) {
		// TODO: this is terrible
		if (e) UReq.lambda(e, this, log);
		if (req) return UReq.native(req, log);
	}
}

module.exports = UReq;
