# urest

URest is a zero dependency restful routing framework inspired by express and restify.
The U in the name comes from the unqiue ids URest attaches to logs and errors to make it easier to debug your application.

 <p align="center">
[![npm](https://img.shields.io/npm/dt/urest.svg?style=for-the-badge)](https://www.npmjs.com/package/urest)
[![Travis](https://img.shields.io/travis/conorturner/urest.svg?style=for-the-badge)](https://travis-ci.org/conorturner/urest)
[![Coveralls github](https://img.shields.io/coveralls/github/conorturner/urest.svg?style=for-the-badge)](https://coveralls.io/github/conorturner/urest)
![license](https://img.shields.io/github/license/conorturner/urest.svg?style=for-the-badge)
</p>

## Install
```bash
$ npm install urest
```

### Basic App
```javascript
const { Rest, JsonBodyParser } = require("urest");
const app = new Rest();

app.pre(JsonBodyParser.middleware());
app.get('/', (req, res) => res.send({message: 'Hello World'}));
app.post("/echo", (req, res) => res.send(req.body));
```
#### Native HTTP server
```javascript
app.native().listen(8000);
```
#### AWS Lambda
```javascript
exports.handle = (e, context) => app.lambda(e, context);
```
#### Google Cloud Functions
```javascript
module.exports = app.gcf();
```

## UErrors
Errors passed into the next function will be logged, then returned to the client obscured behind a unique ID.
```javascript
const { UErrors } = require("urest");
const { UInternalServerError } = UErrors;

app.get("/broken", (req, res, next) => next(new UInternalServerError("This is logged")));

```
#### Response
```json
// 500
{
    "code":"InternalServer",
    "eid":"3ccf6fadf79875f58631a8c7ecc302523b563423"
}
```
#### Log
```json
{
    "level":500,
    "request_id":"1a376e5eb266511a35aefcc7ffad7d50aef5df40",
    "environment":"develop",
    "service": "my-service",
    "stack":"UInternalServerError: This is logged\n    at Object.UError (urest/library/UErrors.js:7:8)\n    at new <anonymous> (urest/library/UErrors.js:11:9)\n    at runHandler (urest/library/Rest.js:79:22)\n    at next (urest/library/Rest.js:87:4)\n    at IncomingMessage.req.on.on (urest/library/JsonBodyParser.js:26:6)\n    at emitNone (events.js:106:13)\n    at IncomingMessage.emit (events.js:208:7)\n    at endReadableNT (_stream_readable.js:1056:12)\n    at _combinedTickCallback (internal/process/next_tick.js:138:11)\n    at process._tickCallback (internal/process/next_tick.js:180:9)",
    "message":"This is logged",
    "eid":"3ccf6fadf79875f58631a8c7ecc302523b563423",
    "code":"InternalServer",
    "statusCode":500
}
```

## Interceptors
Interceptors works in much the same way as middleware but act on the response before it is returned to the client.

#### GZIP Interceptor

The following example will check for the header `"accept-encoding": "gzip"` and will compress response bodies as fit.

```javascript
const { Rest, JsonBodyParser } = require("urest");
const { Neutron } = require("urequest");
const app = new Rest();

app.int(Neutron.intercept());

app.pre(JsonBodyParser.middleware());
app.post("/echo", (req, res) => res.send(req.body));
const server = app.native().listen(1234);
```

#### Custom Interceptors

The value passed into res.send is attached as `res.responseData`, the following example checks for a property in the response and prevents the request if not true.

```javascript
const { Rest, UErrors } = require("urest");
const { UUnauthorizedError } = UErrors;

const app = new Rest();
app.int((req, res, next) => {
   if (res.responseData.authed !== true) next(new UUnauthorizedError());
   else next();
});
```
