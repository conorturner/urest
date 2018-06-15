class JsonBodyParser {

	static middleware(req, res, next) {

		let body = [];

		req
			.on("data", (chunk) => body.push(chunk))
			.on("end", () => {
				try {
					req.body = JSON.parse(Buffer.concat(body).toString());
				}
				catch (e) {
				}

				next();
			});

	}

}

module.exports = JsonBodyParser;