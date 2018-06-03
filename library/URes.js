class URes {
	static native(res) {
		res.statusCode = 200;
		res.send = (ret) => {
			if (typeof ret === "number") {
				res.writeHead(ret);
				res.end(); // TODO: have it send some json here
			}
			else {
				res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(ret));
			}
		};

		res.status = (code) => {
			res.statusCode = code;
			return res;
		};

		return res;
	}

	static lambda(e, callback) {
		const res = {
			statusCode: 200,
			send: (ret) => {

				switch (typeof ret) {
					case "number": {
						callback({ statusCode: ret });
						break;
					}
					case "string": {
						callback({ statusCode: res.statusCode, body: JSON.stringify({ message: ret }) });
						break;
					}
					case "object": {
						callback({ statusCode: res.statusCode, body: JSON.stringify(ret) });
						break;
					}
					default: {
						callback({ statusCode: res.statusCode });
						break;
					}
				}

			},
			status: (code) => {
				res.statusCode = code;
				return res;
			},
			sendStatus: (statusCode) => callback({ statusCode })
		};

		return res;
	}
}

module.exports = URes;