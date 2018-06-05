# urest

The zero dependancy rest frame work from the future.

[![npm](https://img.shields.io/npm/dt/urest.svg?style=for-the-badge)](https://www.npmjs.com/package/urest)
![Travis](https://img.shields.io/travis/conorturner/urest.svg?style=for-the-badge)

### Install

```bash
$ npm install urest
```

### Basic App

```javascript
const { Rest, JsonBodyParser } = require("urest");
const app = new Rest();

app.pre(JsonBodyParser.middleware());
app.get('/', (req, res) => res.send({message: 'Hello World'}))

app.native().listen(8000);
```

### UErrors
Errors passed into the next function will be logged, then returned to the client obscured behind a unique ID.
```javascript
const { UErrors } = require("urest");
const { UInternalServerError } = UErrors;

app.get("/broken", (req, res, next) => next(new UInternalServerError("This is logged")));

```
