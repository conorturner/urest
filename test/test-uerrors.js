const UErrors = require("../library/UErrors");

describe("UErrors - TDD", () => {

	it("contents", (done) => {
		const {UBadGatewayError} = UErrors;

		console.log(new UBadGatewayError());

		done();
	});

});