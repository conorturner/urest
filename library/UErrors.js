const errorMap = {
	UBadRequestError: { statusCode: 400, code: "BadRequest" },
	UUnauthorizedError: { statusCode: 401, code: "Unauthorized" },
	UPaymentRequiredError: { statusCode: 402, code: "PaymentRequired" },
	UForbiddenError: { statusCode: 403, code: "Forbidden" },
	UNotFoundError: { statusCode: 404, code: "NotFound" },
	UMethodNotAllowedError: { statusCode: 405, code: "MethodNotAllowed" },
	UNotAcceptableError: { statusCode: 406, code: "NotAcceptable" },
	UProxyAuthenticationRequiredError: { statusCode: 407, code: "ProxyAuthenticationRequired" },
	URequestTimeoutError: { statusCode: 408, code: "RequestTimeout" },
	UConflictError: { statusCode: 409, code: "Conflict" },
	UGoneError: { statusCode: 410, code: "Gone" },
	ULengthRequiredError: { statusCode: 411, code: "LengthRequired" },
	UPreconditionFailedError: { statusCode: 412, code: "Error" },
	UPayloadTooLargeError: { statusCode: 413, code: "PayloadTooLarge" },
	UUriTooLongError: { statusCode: 414, code: "UriTooLong" },
	UUnsupportedMediaTypeError: { statusCode: 415, code: "UnsupportedMediaType" },
	URangeNotSatisfiableError: { statusCode: 416, code: "RangeNotSatisfiable" },
	UExpectationFailedError: { statusCode: 417, code: "ExpectationFailed" },
	UImATeapotError: { statusCode: 418, code: "ImATeapot" },
	UMisdirectedRequestError: { statusCode: 421, code: "MisdirectedRequest" },
	UUnprocessableEntityError: { statusCode: 422, code: "UnprocessableEntity" },
	ULockedError: { statusCode: 423, code: "Locked" },
	UFailedDependencyError: { statusCode: 424, code: "FailedDependency" },
	UUnorderedCollectionError: { statusCode: 425, code: "UnorderedCollection" },
	UUpgradeRequiredError: { statusCode: 426, code: "UpgradeRequired" },
	UPreconditionRequiredError: { statusCode: 428, code: "PreconditionRequired" },
	UTooManyRequestsError: { statusCode: 429, code: "TooManyRequests" },
	URequestHeaderFieldsTooLargeError: { statusCode: 431, code: "RequestHeaderFieldsTooLarge" },
	UUnavailableForLegalReasonsError: { statusCode: 451, code: "UnavailableForLegalReasons" },
	UInternalServerError: { statusCode: 500, code: "InternalServer" },
	UNotImplementedError: { statusCode: 501, code: "NotImplemented" },
	UBadGatewayError: { statusCode: 502, code: "BadGateway" },
	UServiceUnavailableError: { statusCode: 503, code: "ServiceUnavailable" },
	UGatewayTimeoutError: { statusCode: 504, code: "GatewayTimeout" },
	UHttpVersionNotSupportedError: { statusCode: 505, code: "HttpVersionNotSupported" },
	UVariantAlsoNegotiatesError: { statusCode: 506, code: "VariantAlsoNegotiates" },
	UInsufficientStorageError: { statusCode: 507, code: "InsufficientStorage" },
	ULoopDetectedError: { statusCode: 508, code: "LoopDetected" },
	UBandwidthLimitExceededError: { statusCode: 509, code: "BandwidthLimitExceeded" },
	UNotExtendedError: { statusCode: 510, code: "NotExtended" },
	UNetworkAuthenticationRequiredError: { statusCode: 511, code: "NetworkAuthenticationRequired" },
	UBadDigestError: { statusCode: 400, code: "BadDigest" },
	UBadMethodError: { statusCode: 405, code: "BadMethod" },
	UConnectTimeoutError: { statusCode: 408, code: "ConnectTimeout" },
	UInternalError: { statusCode: 500, code: "Internal" },
	UInvalidArgumentError: { statusCode: 409, code: "InvalidArgument" },
	UInvalidContentError: { statusCode: 400, code: "InvalidContent" },
	UInvalidCredentialsError: { statusCode: 401, code: "InvalidCredentials" },
	UInvalidHeaderError: { statusCode: 400, code: "InvalidHeader" },
	UInvalidVersionError: { statusCode: 400, code: "InvalidVersion" },
	UMissingParameterError: { statusCode: 409, code: "MissingParameter" },
	UNotAuthorizedError: { statusCode: 403, code: "NotAuthorized" },
	URequestExpiredError: { statusCode: 400, code: "RequestExpired" },
	URequestThrottledError: { statusCode: 429, code: "RequestThrottled" },
	UResourceNotFoundError: { statusCode: 404, code: "ResourceNotFound" },
	UWrongAcceptError: { statusCode: 406, code: "WrongAccept" }
};
const crypto = require("crypto");

module.exports = Object.keys(errorMap).reduce((acc, key) => {

	const { code, statusCode } = errorMap[key];

	acc[key] = class extends Error {
		constructor(message) {
			super(message);
			this.eid = crypto.randomBytes(20).toString("hex");
			this.code = code;
			this.statusCode = statusCode;
		}
	};

	return acc;

}, {});
