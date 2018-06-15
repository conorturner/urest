const { expect } = require("chai");

const { Rest, Router, UErrors } = require("../../index");
const { UInternalServerError } = UErrors;

describe("AWS Lambda", () => {

	const nullLog = () => null;
	const app = new Rest({ log: { info: nullLog, error: nullLog } });

	app.get("/broke", (req, res) => res.status(500).send({ error: "oh no" }));
	app.get("/ubroke", (req, res, next) => next(new UInternalServerError(":(")));
	app.get("/", (req, res) => res.send({}));
	app.post("/upost", (req, res) => res.send(req.body));
	app.route("/route")
		.get((req,res) => res.send({}))
		.post((req,res) => res.send({}));

	const getE = ({ httpMethod, path, body }) => ({
		body,
		httpMethod,
		resource: "/{proxy+}",
		queryStringParameters: {
			foo: "bar"
		},
		requestContext: {
			httpMethod: "POST",
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
		headers: {
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

	it("res.send", (done) => {

		const e = getE({ httpMethod: "GET", path: "/" });

		app.lambda(e)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.deep.equal({ statusCode: 200, body: "{}" });
				done();
			})
			.catch(done);

	});

	it("router.route", (done) => {

		const e = getE({ httpMethod: "GET", path: "/route" });
		const e2 = getE({ httpMethod: "POST", path: "/route" });

		Promise.all([
			app.lambda(e).then(result => expect(result).to.deep.equal({ statusCode: 200, body: "{}" })),
			app.lambda(e2).then(result => expect(result).to.deep.equal({ statusCode: 200, body: "{}" }))
		])
			.then(() => {
				done();
			})
			.catch(done);

	});

	it("res.status.send", (done) => {

		const e = getE({ httpMethod: "GET", path: "/broke" });

		app.lambda(e)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.deep.equal({
					body: "{\"error\":\"oh no\"}",
					statusCode: 500
				});
				done();
			})
			.catch(done);

	});

	it("404", (done) => {

		const e = getE({ httpMethod: "GET", path: "/blahdf" });

		app.lambda(e)
			.then(result => {
				// console.log(JSON.stringify(result));
				expect(result).to.deep.equal({ statusCode: 404 });
				done();
			})
			.catch(done);

	});

	it("uerror", (done) => {

		const e = getE({ httpMethod: "GET", path: "/ubroke" });

		app.lambda(e)
			.then(result => {
				// console.log(JSON.stringify(result));
				const body = JSON.parse(result.body);
				expect(body.eid).to.be.a("string");
				expect(body.code).to.equal("InternalServer");
				done();
			})
			.catch(done);

	});

	it("JSON body", (done) => {

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

		const e = getE({ httpMethod: "POST", path: "/upost", body: JSON.stringify(body) });

		app.lambda(e)
			.then(result => {
				expect(JSON.parse(result.body)).to.deep.equal(body);
				done();
			})
			.catch(done);

	});

	it("Routing Order", (done) => {
		const app = new Rest();

		app.get("/broke", (req, res) => res.status(500).send({ error: "oh no" }));
		app.get("/v2/broke", (req, res) => res.status(500).send({ error: "yay" }));

		const e = getE({ httpMethod: "GET", path: "/v2/broke" });

		app.lambda(e)
			.then(result => {
				expect(result).to.deep.equal({ statusCode: 500, body: "{\"error\":\"yay\"}" });
				done();
			})
			.catch(done);
	});

});