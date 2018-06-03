"use strict";

const errorMap = {
	"UBadRequestError": { "statusCode": 400, "code": "BadRequest" },
	"UUnauthorizedError": { "statusCode": 401, "code": "Unauthorized" },
	"UPaymentRequiredError": { "statusCode": 402, "code": "PaymentRequired" },
	"UForbiddenError": { "statusCode": 403, "code": "Forbidden" },
	"UNotFoundError": { "statusCode": 404, "code": "NotFound" },
	"UMethodNotAllowedError": { "statusCode": 405, "code": "MethodNotAllowed" },
	"UNotAcceptableError": { "statusCode": 406, "code": "NotAcceptable" },
	"UProxyAuthenticationRequiredError": { "statusCode": 407, "code": "ProxyAuthenticationRequired" },
	"URequestTimeoutError": { "statusCode": 408, "code": "RequestTimeout" },
	"UConflictError": { "statusCode": 409, "code": "Conflict" },
	"UGoneError": { "statusCode": 410, "code": "Gone" },
	"ULengthRequiredError": { "statusCode": 411, "code": "LengthRequired" },
	"UPreconditionFailedError": { "statusCode": 412, "code": "Error" },
	"UPayloadTooLargeError": { "statusCode": 413, "code": "PayloadTooLarge" },
	"UUriTooLongError": { "statusCode": 414, "code": "UriTooLong" },
	"UUnsupportedMediaTypeError": { "statusCode": 415, "code": "UnsupportedMediaType" },
	"URangeNotSatisfiableError": { "statusCode": 416, "code": "RangeNotSatisfiable" },
	"UExpectationFailedError": { "statusCode": 417, "code": "ExpectationFailed" },
	"UImATeapotError": { "statusCode": 418, "code": "ImATeapot" },
	"UMisdirectedRequestError": { "statusCode": 421, "code": "MisdirectedRequest" },
	"UUnprocessableEntityError": { "statusCode": 422, "code": "UnprocessableEntity" },
	"ULockedError": { "statusCode": 423, "code": "Locked" },
	"UFailedDependencyError": { "statusCode": 424, "code": "FailedDependency" },
	"UUnorderedCollectionError": { "statusCode": 425, "code": "UnorderedCollection" },
	"UUpgradeRequiredError": { "statusCode": 426, "code": "UpgradeRequired" },
	"UPreconditionRequiredError": { "statusCode": 428, "code": "PreconditionRequired" },
	"UTooManyRequestsError": { "statusCode": 429, "code": "TooManyRequests" },
	"URequestHeaderFieldsTooLargeError": { "statusCode": 431, "code": "RequestHeaderFieldsTooLarge" },
	"UUnavailableForLegalReasonsError": { "statusCode": 451, "code": "UnavailableForLegalReasons" },
	"UInternalServerError": { "statusCode": 500, "code": "InternalServer" },
	"UNotImplementedError": { "statusCode": 501, "code": "NotImplemented" },
	"UBadGatewayError": { "statusCode": 502, "code": "BadGateway" },
	"UServiceUnavailableError": { "statusCode": 503, "code": "ServiceUnavailable" },
	"UGatewayTimeoutError": { "statusCode": 504, "code": "GatewayTimeout" },
	"UHttpVersionNotSupportedError": { "statusCode": 505, "code": "HttpVersionNotSupported" },
	"UVariantAlsoNegotiatesError": { "statusCode": 506, "code": "VariantAlsoNegotiates" },
	"UInsufficientStorageError": { "statusCode": 507, "code": "InsufficientStorage" },
	"ULoopDetectedError": { "statusCode": 508, "code": "LoopDetected" },
	"UBandwidthLimitExceededError": { "statusCode": 509, "code": "BandwidthLimitExceeded" },
	"UNotExtendedError": { "statusCode": 510, "code": "NotExtended" },
	"UNetworkAuthenticationRequiredError": { "statusCode": 511, "code": "NetworkAuthenticationRequired" },
	"UBadDigestError": { "statusCode": 400, "code": "Error" },
	"UBadMethodError": { "statusCode": 405, "code": "Error" },
	"UConnectTimeoutError": { "statusCode": 408, "code": "Error" },
	"UInternalError": { "statusCode": 500, "code": "Error" },
	"UInvalidArgumentError": { "statusCode": 409, "code": "Error" },
	"UInvalidContentError": { "statusCode": 400, "code": "Error" },
	"UInvalidCredentialsError": { "statusCode": 401, "code": "Error" },
	"UInvalidHeaderError": { "statusCode": 400, "code": "Error" },
	"UInvalidVersionError": { "statusCode": 400, "code": "Error" },
	"UMissingParameterError": { "statusCode": 409, "code": "Error" },
	"UNotAuthorizedError": { "statusCode": 403, "code": "Error" },
	"URequestExpiredError": { "statusCode": 400, "code": "Error" },
	"URequestThrottledError": { "statusCode": 429, "code": "Error" },
	"UResourceNotFoundError": { "statusCode": 404, "code": "Error" },
	"UWrongAcceptError": { "statusCode": 406, "code": "Error" }
};
const crypto = require("crypto");

module.exports = Object.keys(errorMap).reduce((acc, key) => {

	const {code, statusCode} = errorMap[key];

	acc[key] = class extends Error {
		constructor(message) {
			super(message);
			this.uuid = crypto.randomBytes(20).toString("hex");
			this.code = code;
			this.statusCode = statusCode;
		}
	};

	return acc;

}, {});
