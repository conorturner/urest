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

		let parsedBody;
		try {
			parsedBody = body ? JSON.parse(body) : undefined;
		}
		catch (e) {
		}

		Object.assign(self, {
			headers,
			path,
			method: httpMethod,
			body: parsedBody,
			query: queryStringParameters === null ? {} : queryStringParameters
		});
	}

	constructor({ e, req }) {
		if (e) UReq.lambda(e, this);
		if (req) return UReq.native(req);
	}


}

module.exports = UReq;