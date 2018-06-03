class UReq {
	static native (req) {
		if(req.on) req.on('error', (err) => req.log.error(err));
		return req;
	}

	static lambda (e) {
		const {headers, path, httpMethod, body} = e;

		let parsedBody;
		try {
			parsedBody = body ? JSON.parse(body) : undefined;
		}
		catch (e) {
			console.log(e);
		}

		return {headers, path, method: httpMethod, body: parsedBody};
	}
}

module.exports = UReq;