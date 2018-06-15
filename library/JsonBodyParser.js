class JsonBodyParser {

	static middleware() {
		return (req, res, next) => {
			const tryParse = (body) => {
				try {
					return JSON.parse(body);
				}
				catch (e) {
				}
			};

			if (req.headers["content-type"] !== "application/json") return next();

			if (req.body) {
				req.body = tryParse(req.body);
				next();
			}
			else {
				let body = [];
				req
					.on("data", (chunk) => body.push(chunk))
					.on("end", () => {
						req.body = tryParse(Buffer.concat(body));
						next();
					});
			}

		};
	}

}

module.exports = JsonBodyParser;