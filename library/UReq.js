class UReq {
	static native(req) {
		if (req.on) req.on('error', (err) => req.log.error(err));
		return req;
	}

	static lambda(e, self) {
		const { headers, path, httpMethod, body, queryStringParameters } = e;

		let parsedBody;
		try {
			parsedBody = body ? JSON.parse(body) : undefined;
		}
		catch (e) {
			console.log(e);
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
		if(req) return UReq.native(req);
	}


}

module.exports = UReq;