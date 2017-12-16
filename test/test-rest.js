"use strict";

const {expect} = require("chai");

const {Rest, Router} = require("../index");

describe("Test Rest", () => {

	it("Basic App", (done) => {

		// const userRouter = new Router();
		// userRouter.pre((req, res, next) => {
		// 	req.headers.thing = "stuff";
		// 	next()
		// });
		//
		// userRouter.get("/user/:user_id/friend/:friend_id", (req, res) => {
		// 	res.send(Object.assign(req.params, req.headers))
		// });

		const app = new Rest({name: "test-service"});

		// app.get("/v", (req, res) => res.send({v: "0.0.1"}));
		app.post("/", (req, res) => res.send({v: "0.0.1"}));
		// app.use("/user", userRouter);

		const mockReq = {
			path: "/",
			method: "POST",
			headers: {
				host: 'us-central1-blog-agency.cloudfunctions.net',
				'user-agent': 'PostmanRuntime/6.4.1',
				'transfer-encoding': 'chunked',
				accept: '*/*',
				'cache-control': 'no-cache',
				'content-type': 'multipart/form-data; boundary=--------------------------576589493182931456418299',
				'function-execution-id': '22rypiry6ivz',
				'postman-token': '160cbbcd-f6a0-4d0f-9164-af15a5c64fdb',
				'x-appengine-api-ticket': 'a267eb1ec7ae2798',
				'x-appengine-city': 'newcastle upon tyne',
				'x-appengine-citylatlong': '54.978252,-1.617780',
				'x-appengine-country': 'GB',
				'x-appengine-https': 'on',
				'x-appengine-region': 'eng',
				'x-appengine-user-ip': '77.96.143.42',
				'x-cloud-trace-context': '03813c4b28978682b8191244930b8b88/4780052098526325805;o=1',
				'x-forwarded-for': '77.96.143.42',
				'accept-encoding': 'gzip'
			}
		};

		const mockRes = {
			send: (data) => {
				console.log(data);
				done();
			}
		};

		app.query(mockReq, mockRes);

	});

	it("Error", (done) => {

		const {UErrors} = require("../index");
		const {UInternalServerError} = UErrors;

		const userRouter = new Router();
		userRouter.pre((req, res, next) => {
			req.headers.thing = "stuff";
			next()
		});

		userRouter.get("/user/:user_id/friend/:friend_id", (req, res, next) => {
			// res.send(Object.assign(req.params, req.headers))
			next(new UInternalServerError(":("));

		});

		const app = new Rest({name: "test-service"});

		app.get("/v", (req, res) => res.send({v: "0.0.1"}));
		app.use("/user", userRouter);

		const mockReq = {
			path: "/user/1/friend/2",
			method: "GET",
			headers: {}
		};

		const mockRes = {
			status: (status) => {
				expect(status).to.equal(500);
				return mockRes;
			},
			send: (data) => {
				console.log(data);
				done();
			}
		};


		app.query(mockReq, mockRes);

	});

});