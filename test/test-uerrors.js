const UErrors = require("../library/UErrors")({ uuidv4: require("uuid/v4") });

describe("UErrors - TDD", () => {

	it("contents", (done) => {
		const {UBadGatewayError} = UErrors;

		console.log(new UBadGatewayError());

		done();
	});

});