"use strict";

const Rest = require("../library/Rest");
const Router = require("../library/Router");

describe("Test Router", () => {

	it("Basic App", (done) => {

		const userRouter = new Router();
		userRouter.pre((req,res, next) => {
			req.headers.thing = "stuff";
			next()
		});

		userRouter.get("/user/:user_id/friend/:friend_id", (req, res, next) => {
			res.send(Object.assign(req.params, req.headers))
		});

		const app = new Rest();

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

});