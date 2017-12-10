"use strict";

const {expect} = require("chai");

const Rest = require("../library/Rest");
const Router = require("../library/Router");

describe("Test Router", () => {

	it("Basic App", (done) => {

		const userRouter = new Router();
		userRouter.pre((req,res, next) => {
			req.headers.thing = "stuff";
			next()
		});

		userRouter.get("/user/:user_id/friend/:friend_id", (req, res) => {
			res.send(Object.assign(req.params, req.headers))
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
		userRouter.pre((req,res, next) => {
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