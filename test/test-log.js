const { expect } = require("chai");
const Log = require("../library/Log");
const { UBadGatewayError } = require("../library/UErrors");

// Log.config.pretty = true;

describe("Log", () => {

	describe("info", () => {

		it("string", (done) => {

			const log = new Log({ service: "my-service" });
			const data = "this is a thing";

			const expected = JSON.stringify({
				level: 300,
				request_id: "0",
				service: "my-service",
				environment: "develop",
				message: "this is a thing"
			}) + "\n";

			Object.assign(log, {
				request_id: "0",
				stream: { write: (chunk) => expect(chunk).to.equal(expected) }
			});

			log.info(data);
			done();
		});

		it("object", (done) => {

			const log = new Log({ service: "my-service" });
			const data = { event: "an event" };

			const expected = JSON.stringify({
				level: 300,
				request_id: "0",
				service: "my-service",
				environment: "develop",
				event: "an event"
			}) + "\n";

			Object.assign(log, {
				request_id: "0",
				stream: { write: (chunk) => expect(chunk).to.equal(expected) }
			});

			log.info(data);
			done();
		});

		it("error", (done) => {

			const log = new Log({ service: "my-service" });
			const data = new Error("an error");

			Object.assign(log, {
				stream: {
					write: (chunk) => {
						const obj = JSON.parse(chunk);
						expect(obj.stack).to.be.a("string");
						done();
					}
				}
			});

			log.info(data);

		});

	});

	describe("error", () => {

		it("string", (done) => {

			const log = new Log({ service: "my-service" });
			const data = "this is a thing";

			Object.assign(log, {
				stream: {
					write: (chunk) => {
						const obj = JSON.parse(chunk);
						expect(obj.stack).to.be.a("string");
						done();
					}
				}
			});

			log.error(data);
		});

		it("object", (done) => {

			const log = new Log({ service: "my-service" });
			const data = { event: "an event" };

			Object.assign(log, {
				stream: {
					write: (chunk) => {
						const obj = JSON.parse(chunk);
						expect(obj.stack).to.be.a("string");
						done();
					}
				}
			});

			log.error(data);
		});

		it("error", (done) => {

			const log = new Log({ service: "my-service" });
			const data = new Error("an error");

			Object.assign(log, {
				stream: {
					write: (chunk) => {
						const obj = JSON.parse(chunk);
						expect(obj.stack).to.be.a("string");
						done();
					}
				}
			});

			log.error(data);
		});

		it("uerror", (done) => {

			const log = new Log({ service: "my-service" });
			const data = new UBadGatewayError("an error");

			Object.assign(log, {
				stream: {
					write: (chunk) => {
						const obj = JSON.parse(chunk);

						expect(obj.request_id).to.be.a("string");
						expect(obj.stack).to.be.a("string");
						expect(obj.eid).to.be.a("string");
						expect(obj.statusCode).to.be.a("number");
						expect(obj.code).to.be.a("string");
						done();
					}
				}
			});

			log.error(data);
		});

	});

});