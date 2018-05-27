const { expect } = require("chai");

const { Rest, Router } = require("../index");
const request = require("request-promise-native");

describe("HTTP Server", () => {

	const app = new Rest();

	app.get("/broke", (req, res) => res.status(500).send({error: "oh no"}));
	app.get("/", (req, res) => res.send({}));

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

});