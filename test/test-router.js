"use strict";

const Router = require("../library/Router");

describe("Test Router", () => {

	it("Basic App", (done) => {

		const userRouter = new Router();

		userRouter.pre((res,req, next) => {
			next()
		});

		userRouter.get("/user/:user_id/friend/:friend_id", (req, res) => {
			res.send({user_id: req.params.user_id});
		});

		const router = new Router();
		router.get("/v", (req, res) => res.send({v: "0.0.1"}));
		router.use("/user", userRouter);

		done();

	});

});