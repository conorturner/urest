class URes {
	static native (res) {
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

	static lambda (e, callback) {
		const res = {
			statusCode: 200,
			send: (ret) => {
				if (typeof ret === "number") callback({statusCode: ret});
				else callback({statusCode: res.statusCode, body: JSON.stringify(ret)});
			},
			status: (code) => {
				res.statusCode = code;
				return res;
			}
		};

		return res;
	}
}

module.exports = URes;