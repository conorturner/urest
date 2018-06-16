class JsonBodyParser {

	static middleware() {
		return (req, res, next) => {
			const tryParse = (body) => {
				try {
					return JSON.parse(body);
				}
				catch (e) {
					return body;
				}
			};

			if (req.headers["content-type"] && req.headers["content-type"] !== "application/json") return next();
			if (req.body) {
				req.body = tryParse(req.body);
				return next();
			}
			if (!req.on) return next();

			let body = [];
			req
				.on("data", (chunk) => body.push(chunk))
				.on("end", () => {
					req.body = tryParse(Buffer.concat(body));
					next();
				});
		};
	}

}

module.exports = JsonBodyParser;