#! /usr/bin/env node

const {exec} = require("child_process");

if(process.argv.length < 3) return;

switch (process.argv[2]){

	case "init": {

		exec(`cp -R ${__dirname + "/template/*"} .`, (err, stdout, stderr) => {
			if (err || stderr) console.error(err || stderr);
		});

		break;
	}

	default: {
		return;
	}

}