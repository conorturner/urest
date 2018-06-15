const { expect } = require("chai");
const UErrors = require("../library/UErrors");

describe("UErrors - TDD", () => {

	it("contents", (done) => {
		const { UBadGatewayError } = UErrors;
		expect(new UBadGatewayError().statusCode).to.equal(502);
		done();
	});

});