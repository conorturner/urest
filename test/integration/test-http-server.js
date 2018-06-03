const { expect } = require("chai");

const { Rest, Router, UErrors, JsonBodyParser } = require("../../index");
const { UInternalServerError } = UErrors;
const request = require("request-promise-native");

describe("HTTP Server", () => {

	const app = new Rest();

	app.pre(JsonBodyParser.middleware());
	app.get("/broke", (req, res) => res.status(500).send({ error: "oh no" }));
	app.get("/ubroke", (req, res, next) => next(new UInternalServerError(":(")));
	app.get("/", (req, res) => res.send({}));
	app.post("/upost", (req, res) => res.send(req.body));

	// console.log(app.routes)

	app.native().listen(8000);

	it("res.send", (done) => {

		const options = {
			uri: "http://localhost:8000/",
			json: true
		};

		request(options)
			.then(result => {
				console.log(result);
				done();
			})
			.catch(done);

	});

	it("res.status.send", (done) => {

		const options = {
			uri: "http://localhost:8000/broke",
			json: true
		};

		request(options)
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(500);
				done();
			});

	});

	it("no route match found", (done) => {

		const options = {
			uri: "http://localhost:8000/asdfgh",
			json: true
		};

		request(options)
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(404);
				done();
			});

	});

	it("uerror", (done) => {

		const options = {
			uri: "http://localhost:8000/ubroke",
			json: true
		};

		request(options)
			.then(done)
			.catch(err => {
				expect(err.statusCode).to.equal(500);
				console.log("err", err.error.eid);
				done();
			})
			.catch(done);

	});

	it("JSON body", (done) => {

		const body = {
			value: 80.86,
			timestamp: '2017-01-19T20:55:57.416Z',
			currency: 'EUR',
			ip: '37.69.22.229',
			date: '2018-06-02T19:26:18.854Z',
			name: 'Mitchell Townsend',
			country: 'Luxembourg',
			age: 36,
			gender: 'Male',
			eventTypeName: 'page-view',
			project_id: 1234455678
		};

		const options = {
			method: 'POST',
			uri: "http://localhost:8000/upost",
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json'
			},
			body,
			json: true
		};

		request(options)
			.then(result => {
				expect(result).to.deep.equal(body);
				done();
			})
			.catch(done);

	});

});