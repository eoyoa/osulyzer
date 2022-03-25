// using external libraries:
// express.js for web framework
// fs (built-in library from node.js) for reading file input
// osu! api for data
import express from "express";
import * as config from "../config.json";
import { ApiClient } from "./osu";
import fs from "fs/promises";

(async () => {
	const app = express();
	const port = 3000;

	const client = new ApiClient();
	await client.login(config.client_id, config.client_secret);

	app.use("/", express.static("web"));

	app.get("/", async (req, res) => {
		const page = await fs.readFile(__dirname + "/../web/index.html", { encoding: "utf8"});
		res.send(page);
	});

	app.get("/rankup/:id", async (req, res) => {
		const id = req.params.id;
		
		const topPp = (await client.getUserScores(id, "best", { limit: 1 }))[0].pp;
		const user = await client.getUser(id);
		const currentPp = user["statistics"].pp;
		const desiredPp = (await client.getRanking("osu", "performance", 200))["ranking"][48].pp;

		const solution = solve(topPp, currentPp, desiredPp);
		const [plays, ppValue] = solution

		if (plays === 0) {
			res.send(`congrats! you've already achieved a four digit rank!<br>you are currently rank #${user["statistics"].global_rank}.`);
		} else if (plays <= 5) {
			res.send(`you're close to a four digit rank!<br>make ${plays} plays of ${ppValue} pp value!`);
		} else {
			res.send(`to get to a four digit rank, you get to ${desiredPp} total weighted pp.<br>this means you must make ${plays} plays of ${ppValue} pp value.`);
		}	
	});

	app.get("/active-users/:id", async (req, res) => {
		const id = req.params.id;

		let activeUsers = 0;
		let countries = await client.getRanking("osu", "country");
		const total = countries["total"];
		
		let increment = 50;
		let j = 2;
		for (let i = 0; i < total; i += increment) {
			increment = countries["ranking"].length;
			for (const country of countries["ranking"]) {
				activeUsers += country.active_users;
			}
			countries = await client.getRanking("osu", "country", j++);
		}

		const rank = (await client.getUser(id))["statistics"].global_rank;

		res.send(`there are currently ${activeUsers} total active users.<br>you are in the top ${((rank/activeUsers) * 100).toFixed(2)}% (rank #${rank}/${activeUsers})`);
	});

	app.listen(port, () => {
		console.log(`listening on ${port}`);
	});
})();

function solve(playValue: number, currentPp: number, desiredPp: number, scores?: any): any {
	let plays = 0;
	let determinedPlayValue = Math.ceil(playValue);

	let pp = currentPp;
	while (pp < desiredPp) {
		const previous = pp;
		pp = determinedPlayValue + (0.95 * previous);
		if (pp === previous) return solve(determinedPlayValue + 1, currentPp, desiredPp);
		else plays++;
	}

	return [plays, determinedPlayValue];
}

// for (let i = 0; i < 2; i++) {
// 	scores.push(...(await client.getUserScores(id, "best", { limit: 50, offset: 50 * i})));
// }

// let pp = 0;
// for (const score of scores) {
// 	pp += score.weight.pp;
// }