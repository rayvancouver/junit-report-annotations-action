
const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const parser = require('xml-js');
const axios = require('axios');
const fs = require('fs');


(async () => {
	try {
		core.debug(`Running slack test alerts:`);
		const path = core.getInput('path');
		const includeSummary = core.getInput('includeSummary');
		const numFailures = core.getInput('numFailures');
		const accessToken = core.getInput('access-token');
		const testSrcPath = core.getInput('testSrcPath');
		const slackBotToken = core.getInput('slack-bot-token');
		const slackChannelId = core.getInput('slack-channel-id');
		const globber = await glob.create(path, {followSymbolicLinks: false});

		let numTests = 0;
		let numSkipped = 0;
		let numFailed = 0;
		let numErrored = 0;
		let testDuration = 0;

		let annotations = [];

		core.debug(`Getting git for repo=${JSON.stringify(github.context.repo)} sha=${github.context.sha}:`);
		// const octokit = new github.GitHub(accessToken);
		// const req = {
		// 	...github.context.repo,
		// 	ref: github.context.sha
		// }
//		const res = await octokit.checks.listForRef(req);
//		core.debug(`Response: ${JSON.stringify(res.data)}`);

//		const check_run_id = res.data.check_runs.filter(check => check.name === 'build')[0].id

//		core.debug(`Run id: ${check_run_id}`);

		for await (const file of globber.globGenerator()) {
			const data = await fs.promises.readFile(file);
			var json = JSON.parse(parser.xml2json(data, {compact: true}));
			core.debug(`json: ${JSON.stringify(json)}`);
			if (json.testsuite) {
				const testsuite = json.testsuite;
				testDuration += Number(testsuite._attributes.time);
				numTests += Number(testsuite._attributes.tests);
				numErrored += Number(testsuite._attributes.errors);
				numFailed += Number(testsuite._attributes.failures);
				numSkipped += Number(testsuite._attributes.skipped);
				testFunction = async testcase => {
					const problem = testcase.failure || testcase.error;
//					core.debug(`Testcase: ${JSON.stringify(testcase)}, numFailures: ${numFailures}`);
					if (problem) {
						if (numFailures === "0" || annotations.length < numFailures) {
							const name = testcase._attributes.classname;
							// const klass = name.replace(/$.*/g, '').replace(/\./g, '/');
							// const path = `${testSrcPath}${klass}`

							// const file = await fs.promises.readFile(path, {encoding: 'utf-8'});
							// //TODO: make this better won't deal with methods with arguments etc
							let line = 0;
							// const lines = file.split('\n')
							// for (let i = 0; i < lines.length; i++) {
							// 	if (lines[i].indexOf(testcase._attributes.name) >= 0) {
							// 		line = i;
							// 		break;
							// 	}
							// }

							const descriptor = testcase.failure ? 'Failure' : 'Error';
							annotations.push({
								path: name,
								start_line: line,
								end_line: line,
								start_column: 0,
								end_column: 1,
								annotation_level: 'failure',
								message: `Test ${testcase._attributes.name} ${descriptor} ${problem._attributes.message}`,
							});

							const owner = github.context.repo.owner;
							const repo = github.context.repo.repo;
							const arr = /:(\d+)\)/g.exec(problem._attributes.$t);
							const lineNum = (arr && arr.length > 1) ? arr[1] : 0;
							const branch = github.context.ref.replace("refs/heads/", "");
							const message = problem._attributes.message
									? problem._attributes.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
									: "No message found";

							const slackMessage = "*Test " + descriptor
									+ "* | <https://github.com/" + owner + "/" + repo + "/actions>"
									+ " - `" + testcase._attributes.name + "`:\n```" + message
									+ "```";

							core.debug(slackMessage);

							await axios({
								url: "https://slack.com/api/chat.postMessage",
								method: "post",
								headers: {
									"Authorization": `Bearer ${slackBotToken}`,
									"Content-type": "application/json"
								},
								data: {
									"channel": slackChannelId,
									"blocks": [
										{
											"type": "section",
											"text": {
												"type": "mrkdwn",
												"text": slackMessage
											}
										}
									]
								}
							});
						}
						//add
					}
				}

				if (Array.isArray(testsuite.testcase)) {
					for (const testcase of testsuite.testcase) {
						await testFunction(testcase)
					}
				} else {
					//single test
					await testFunction(testsuite.testcase)
				}
			}
		}


		const annotation_level = numFailed + numErrored > 0 ? 'failure' : 'notice';
		const annotation = {
			path: 'test',
			start_line: 0,
			end_line: 0,
			start_column: 0,
			end_column: 0,
			annotation_level,
			message: `Junit Results ran ${numTests} in ${testDuration} seconds ${numErrored} Errored, ${numFailed} Failed, ${numSkipped} Skipped`,
		};

		// const update_req = {
		// 	...github.context.repo,
		// 	check_run_id,
		// 	output: {
		// 		title: "Junit Results",
		// 		summary: `Num passed etc`,
		// 		annotations: [annotation, ...annotations]
		// 	}
		// }
		// await octokit.checks.update(update_req);
	} catch (error) {
		core.setFailed(error.message);
	}
})();
