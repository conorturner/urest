#! /usr/bin/env node

const {exec} = require("child_process");

if (process.argv.length < 3) return;

switch (process.argv[2]) {

	case "init": {

		exec(`cp -R ${__dirname + "/template/*"} .`, (err, stdout, stderr) => {
			if (err || stderr) throw err || stderr;
		});

		break;
	}

	case "env": {

		const envKey = process.argv[3];

		exec(`pwd`, (err, stdout, stderr) => {
			if (err || stderr) throw err || stderr;

			const env = require(`${stdout.substr(0, stdout.length - 1)}/environment/${envKey}.json`);

			const promiseArray = Object.keys(env).map((key) => {

				if (typeof env[key] === "string") return Promise.resolve(env[key]);
				else {

					exec(`
					
					echo -n "testing" | gcloud kms encrypt \\
				  --plaintext-file=- \\  
				  --ciphertext-file=- \\  
				  --location=global \\
				  --keyring=build-secrets \\
				  --key=[KEY-NAME] | base64
									
					
					`, (err, stdout, stderr) => {
						if (err || stderr) throw err || stderr;
					});

				}

			});

		});

		break;
	}

	default: {
		return;
	}

}