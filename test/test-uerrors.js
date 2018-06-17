const { expect } = require("chai");
const UErrors = require("../library/UErrors");

describe("UErrors - TDD", () => {

	it("contents", (done) => {
		const { UBadGatewayError } = UErrors;
		const err = new UBadGatewayError();

		expect(err.statusCode).to.equal(502);
		expect(err.eid).to.be.a("string");
		expect(err.stack).to.be.a("string");

		done();
	});

});