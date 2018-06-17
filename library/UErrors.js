const crypto = require("crypto");
const util = require("util");

function UError(message) {
	this.eid = crypto.randomBytes(20).toString("hex");
	this.message = message;
	Error.captureStackTrace(this);
}

const buildProto = (data) => function (message) {
	UError.call(this, message);
	Object.assign(this, data);
};

exports.UBadRequestError = buildProto({ statusCode: 400, code: "BadRequest" });
exports.UUnauthorizedError = buildProto({ statusCode: 401, code: "Unauthorized" });
exports.UPaymentRequiredError = buildProto({ statusCode: 402, code: "PaymentRequired" });
exports.UForbiddenError = buildProto({ statusCode: 403, code: "Forbidden" });
exports.UNotFoundError = buildProto({ statusCode: 404, code: "NotFound" });
exports.UMethodNotAllowedError = buildProto({ statusCode: 405, code: "MethodNotAllowed" });
exports.UNotAcceptableError = buildProto({ statusCode: 406, code: "NotAcceptable" });
exports.UProxyAuthenticationRequiredError = buildProto({ statusCode: 407, code: "ProxyAuthenticationRequired" });
exports.URequestTimeoutError = buildProto({ statusCode: 408, code: "RequestTimeout" });
exports.UConflictError = buildProto({ statusCode: 409, code: "Conflict" });
exports.UGoneError = buildProto({ statusCode: 410, code: "Gone" });
exports.ULengthRequiredError = buildProto({ statusCode: 411, code: "LengthRequired" });
exports.UPreconditionFailedError = buildProto({ statusCode: 412, code: "Error" });
exports.UPayloadTooLargeError = buildProto({ statusCode: 413, code: "PayloadTooLarge" });
exports.UUriTooLongError = buildProto({ statusCode: 414, code: "UriTooLong" });
exports.UUnsupportedMediaTypeError = buildProto({ statusCode: 415, code: "UnsupportedMediaType" });
exports.URangeNotSatisfiableError = buildProto({ statusCode: 416, code: "RangeNotSatisfiable" });
exports.UExpectationFailedError = buildProto({ statusCode: 417, code: "ExpectationFailed" });
exports.UImATeapotError = buildProto({ statusCode: 418, code: "ImATeapot" });
exports.UMisdirectedRequestError = buildProto({ statusCode: 421, code: "MisdirectedRequest" });
exports.UUnprocessableEntityError = buildProto({ statusCode: 422, code: "UnprocessableEntity" });
exports.ULockedError = buildProto({ statusCode: 423, code: "Locked" });
exports.UFailedDependencyError = buildProto({ statusCode: 424, code: "FailedDependency" });
exports.UUnorderedCollectionError = buildProto({ statusCode: 425, code: "UnorderedCollection" });
exports.UUpgradeRequiredError = buildProto({ statusCode: 426, code: "UpgradeRequired" });
exports.UPreconditionRequiredError = buildProto({ statusCode: 428, code: "PreconditionRequired" });
exports.UTooManyRequestsError = buildProto({ statusCode: 429, code: "TooManyRequests" });
exports.URequestHeaderFieldsTooLargeError = buildProto({ statusCode: 431, code: "RequestHeaderFieldsTooLarge" });
exports.UUnavailableForLegalReasonsError = buildProto({ statusCode: 451, code: "UnavailableForLegalReasons" });
exports.UInternalServerError = buildProto({ statusCode: 500, code: "InternalServer" });
exports.UNotImplementedError = buildProto({ statusCode: 501, code: "NotImplemented" });
exports.UBadGatewayError = buildProto({ statusCode: 502, code: "BadGateway" });
exports.UServiceUnavailableError = buildProto({ statusCode: 503, code: "ServiceUnavailable" });
exports.UGatewayTimeoutError = buildProto({ statusCode: 504, code: "GatewayTimeout" });
exports.UHttpVersionNotSupportedError = buildProto({ statusCode: 505, code: "HttpVersionNotSupported" });
exports.UVariantAlsoNegotiatesError = buildProto({ statusCode: 506, code: "VariantAlsoNegotiates" });
exports.UInsufficientStorageError = buildProto({ statusCode: 507, code: "InsufficientStorage" });
exports.ULoopDetectedError = buildProto({ statusCode: 508, code: "LoopDetected" });
exports.UBandwidthLimitExceededError = buildProto({ statusCode: 509, code: "BandwidthLimitExceeded" });
exports.UNotExtendedError = buildProto({ statusCode: 510, code: "NotExtended" });
exports.UNetworkAuthenticationRequiredError = buildProto({ statusCode: 511, code: "NetworkAuthenticationRequired" });
exports.UBadDigestError = buildProto({ statusCode: 400, code: "BadDigest" });
exports.UBadMethodError = buildProto({ statusCode: 405, code: "BadMethod" });
exports.UConnectTimeoutError = buildProto({ statusCode: 408, code: "ConnectTimeout" });
exports.UInternalError = buildProto({ statusCode: 500, code: "Internal" });

Object.keys(exports).forEach(key => util.inherits(exports[key], UError));
