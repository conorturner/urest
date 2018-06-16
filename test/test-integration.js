const { expect } = require("chai");

const { Rest, Router, UErrors, JsonBodyParser } = require("../index");
const { UInternalServerError } = UErrors;
const request = require("request-promise-native");
const nullLog = () => null;
const app = new Rest({ log: { info: nullLog, error: nullLog } });
// const app = new Rest();

app.incpt((req, res, data, next) => {
	if (req.headers["break-on-header"] === "true") throw new Error("Broke on header");
	else next();
});
app.incpt((req, res, data, next) => {
	if (req.headers["append-to-body"] === "true") data.appended = ":)";
	next();
});
app.pre(JsonBodyParser.middleware());
app.get("/broke", (req, res) => res.status(500).send({ error: "oh no" }));
app.get("/broke2", (req, res) => res.sendStatus(500));
app.get("/ubroke", (req, res, next) => next(new UInternalServerError(":(")));
app.get("/very-broke", (req, res, next) => {
	throw new Error("Very broken");
});
app.get("/", (req, res) => res.send({}));
app.get("/query", (req, res) => res.send(req.query));
app.post("/upost", (req, res) => res.send(req.body));

const aRouter = new Router();
const bRouter = new Router();

aRouter.route("/same").get((req, res) => res.send({ value: "a" }));
bRouter.route("/same").get((req, res) => res.send({ value: "b" }));

app.use("/", aRouter);
app.use("/b", bRouter);

const runTests = (makeRequest) => {

	it("res.send", (done) => {

		makeRequest({ path: "/" })
			.then(result => {
				done();
			})
			.catch(done);
	});

	it("req.query", (done) => {

		const path = "/query";
		const qs = {
			test: "1",
			testing: "2"
		};

		makeRequest({ path, qs })
			.then(result => {
				expect(result).to.deep.equal(qs);
				done();
			})
			.catch(done);

	});

	it("res.status.send", (done) => {

		const path = "/broke";

		makeRequest({ path })
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(500);
				done();
			})
			.catch(done);

	});

	it("res.sendStatus", (done) => {

		const path = "/broke";

		makeRequest({ path })
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(500);
				done();
			})
			.catch(done);

	});

	it("no route match found", (done) => {

		const path = "/asdfgh";

		makeRequest({ path })
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(404);
				done();
			})
			.catch(done);

	});

	it("uerror", (done) => {

		const path = "/ubroke";

		makeRequest({ path })
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(500);
				expect(err.error.eid).to.be.a("string");
				done();
			})
			.catch(done);

	});

	it("json req.body", (done) => {

		const body = {
			value: 80.86,
			timestamp: "2017-01-19T20:55:57.416Z",
			currency: "EUR",
			ip: "37.69.22.229",
			date: "2018-06-02T19:26:18.854Z",
			name: "Mitchell Townsend",
			country: "Luxembourg",
			age: 36,
			gender: "Male",
			eventTypeName: "page-view",
			project_id: 1234455678
		};

		const headers = {
			"cache-control": "no-cache",
			"content-type": "application/json"
		};

		const path = "/upost";
		const method = "POST";

		makeRequest({ path, headers, body, method })
			.then(result => {
				expect(result).to.deep.equal(body);
				done();
			})
			.catch(done);

	});

	it("Router.route", (done) => {

		const headers = {
			"cache-control": "no-cache",
			"content-type": "application/json"
		};

		const path = "/b/same";

		makeRequest({ path, headers })
			.then(result => {
				expect(result).to.deep.equal({ value: "b" });
				done();
			})
			.catch(done);

	});

	it("Throw in route", (done) => {

		const path = "/very-broke";

		makeRequest({ path })
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.deep.equal(500);
				expect(err.error.eid).to.be.a("string");
				done();
			})
			.catch(done);

	});

	describe("intercept", () => {

		it("error in intercept", (done) => {

			const path = "/";
			const headers = {
				"break-on-header": "true"
			};

			makeRequest({ path, headers })
				.then(done)
				.catch(err => {
					expect(err.statusCode).to.deep.equal(500);
					expect(err.error.eid).to.be.a("string");
					done();
				})
				.catch(done);

		});

		it("intercept transform body", (done) => {

			const path = "/";
			const headers = {
				"append-to-body": "true"
			};

			makeRequest({ path, headers })
				.then(result => {
					expect(result).to.deep.equal({ appended: ":)" });
					done();
				})
				.catch(done);

		});

	});

};

describe("Integration", () => {

	describe("Native", () => {
		const port = Math.floor((Math.random() * 9000) + 8500);

		const makeRequest = ({ path = "/", body, headers, qs, method } = {}) => {
			const options = {
				uri: `http://localhost:${port}${path}`,
				headers,
				body,
				qs,
				method,
				json: true
			};

			return request(options);
		};

		const server = app.native();
		before(done => server.listen(port) && done());
		after(done => server.close() && done());

		runTests(makeRequest);
	});

	describe("Lambda", () => {

		const getE = ({ httpMethod, path, body, headers, qs }) => ({
			body,
			httpMethod,
			resource: "/{proxy+}",
			queryStringParameters: qs || {
				foo: "bar"
			},
			requestContext: {
				httpMethod,
				requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
				path: "/{proxy+}",
				extendedRequestId: null,
				resourceId: "123456",
				apiId: "1234567890",
				stage: "prod",
				resourcePath: "/{proxy+}",
				identity: {
					accountId: null,
					apiKey: null,
					userArn: null,
					cognitoAuthenticationProvider: null,
					cognitoIdentityPoolId: null,
					userAgent: "Custom User Agent String",
					caller: null,
					cognitoAuthenticationType: null,
					sourceIp: "127.0.0.1",
					user: null
				},
				accountId: "123456789012"
			},
			headers: headers || {
				"Accept-Language": "en-US,en;q=0.8",
				"Accept-Encoding": "gzip, deflate, sdch",
				"X-Forwarded-Port": "443",
				"CloudFront-Viewer-Country": "US",
				"X-Amz-Cf-Id": "aaaaaaaaaae3VYQb9jd-nvCd-de396Uhbp027Y2JvkCPNLmGJHqlaA==",
				"CloudFront-Is-Tablet-Viewer": "false",
				"User-Agent": "Custom User Agent String",
				Via: "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
				"CloudFront-Is-Desktop-Viewer": "true",
				"CloudFront-Is-SmartTV-Viewer": "false",
				"CloudFront-Is-Mobile-Viewer": "false",
				"X-Forwarded-For": "127.0.0.1, 127.0.0.2",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"Upgrade-Insecure-Requests": "1",
				Host: "1234567890.execute-api.us-east-1.amazonaws.com",
				"X-Forwarded-Proto": "https",
				"Cache-Control": "max-age=0",
				"CloudFront-Forwarded-Proto": "https"
			},
			stageVariables: null,
			path,
			pathParameters: {
				proxy: path
			},
			isBase64Encoded: false
		});
		const makeRequest = ({ path = "/", body, headers, qs, method = "GET" } = {}) =>
			app.lambda(getE({ httpMethod: method, path, body, headers, qs }))
				.then(result => result.body ? Object.assign(result, { body: JSON.parse(result.body) }) : result)
				.then(result => {
					if (result.statusCode === 200) return result.body;
					else return Promise.reject({ statusCode: result.statusCode, error: result.body });
				});

		runTests(makeRequest);

	});

});
