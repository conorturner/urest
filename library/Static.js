const fs = require("fs");
const pathLib = require("path");

class Static {

	constructor({ localPath, options }) {
		this.localPath = localPath;
		this.options = options;
	}

	get(path) {
		const { notFound } = this.options;
		const notFoundPath = pathLib.join(this.localPath, notFound || "");
		const cleanPath = this.cleanPath(path);

		let promise, status;
		if (Static.exists(cleanPath)) {
			status = 200;
			promise = Static.readFile(cleanPath);
		}
		else if (notFound && Static.exists(notFoundPath)) {
			status = 404;
			promise = Static.readFile(notFoundPath);
		}
		else {
			status = 404;
			promise = Promise.resolve();
		}

		return promise.then(buffer => ({
			buffer,
			status,
			headers: {
				"Content-Length": buffer ? Buffer.byteLength(buffer) : 0,
				"Content-Type": `${Static.getContentType(cleanPath)}; charset=UTF-8`
			}
		}));
	}

	cleanPath (path) {
		const { index = "index.html", spa = false } = this.options;
		const isSpaRoot = !path.includes(".") && spa;
		return pathLib.join(this.localPath, path === "/" || isSpaRoot ? `/${index}` : path);
	}

	static readFile(path) {
		return new Promise((resolve, reject) =>
			fs.readFile(path, { encoding: "utf8" }, (err, data) => err ? reject(err) : resolve(data)));
	}

	static exists(path) {
		try {
			const stats = fs.lstatSync(path);
			return stats.isFile();
		}
		catch (e) {
			return false;
		}
	}

	static joinPath(...args) {
		return pathLib.join(...args);
	}

	static getContentType(path) {
		const types = {
			html: "text/html",
			css: "text/css",
			json: "application/json",
			js: "application/javascript",
			png: "image/png"
		};

		const tokens = path.split(".");
		const ending = tokens[tokens.length - 1];
		return types[ending] || "";
	}
}

module.exports = Static;