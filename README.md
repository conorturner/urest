# urest

URest is a zero dependency, fully featured, restful routing framework inspired by express and restify.
The U in the name comes from the unqiue ids URest attaches to logs and errors in your application to assist in easy bug retrieval.

[![npm](https://img.shields.io/npm/dt/urest.svg?style=for-the-badge)](https://www.npmjs.com/package/urest)
[![Travis](https://img.shields.io/travis/conorturner/urest.svg?style=for-the-badge)](https://travis-ci.org/conorturner/urest)

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
### Native HTTP server
```javascript
app.native().listen(8000);
```
### AWS Lambda
```javascript
return app.lambda(e, context);
```
### Google Cloud Functions
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
```
{ Error: Error: This is logged
    at runHandler (/urest/library/Rest.js:68:18)
    at next (/urest/library/Rest.js:76:4)
    at IncomingMessage.req.on.on (/urest/library/JsonBodyParser.js:17:6)
    at emitNone (events.js:106:13)
    at IncomingMessage.emit (events.js:208:7)
    at endReadableNT (_stream_readable.js:1056:12)
    at _combinedTickCallback (internal/process/next_tick.js:138:11)
    at process._tickCallback (internal/process/next_tick.js:180:9)
  eid: '3ccf6fadf79875f58631a8c7ecc302523b563423',
  code: 'InternalServer',
  statusCode: 500,
  level: 'error',
  request_id: '1db31695e77da813550f8210253a99ed81312f4a',
  service: "my-service",
  environment: 'develop'
}
```
