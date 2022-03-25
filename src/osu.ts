// using external libraries:
// node-fetch for requesting data from api
// querystring for encoding objects into queries
// osu! api for data

import fetch, { Response } from "node-fetch";
import qs from "querystring";

const base = "https://osu.ppy.sh/api/v2";

interface OAuthResponse {
	token_type: string;
	expires_in: number;
	access_token: string;
}

export class ApiClient {
	token: string = "";

	async login(id: number, secret: string) {
		// comes from osu api doc
		const token = await fetch("https://osu.ppy.sh/oauth/token", {
			method: 'post',
			headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"grant_type": "client_credentials",
				"client_id": id,
				"client_secret": secret,
				"scope": "public"
			})
		})
		.then(response => {
			console.log("logged in!");
			return response.json();
		}).then((json: OAuthResponse) => {
			this.token = json.access_token;
		});
		
	}
	async getUserScores(user: string, type: string, queries?: { limit?: number, offset?: number} ): Promise<any> {
		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Authorization": `Bearer ${this.token}`
		}

		const response = await fetch(base + `/users/${user}/scores/${type}?${qs.encode(queries)}`, {
			method: "GET",
			headers: headers
		});
		return await response.json();
	}
	async getUser(user: string) {
		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Authorization": `Bearer ${this.token}`
		}
		
		const response = await fetch(base + `/users/${user}?${user}`, {
			method: "GET",
			headers: headers
		});
		return await response.json();
	}
	async getRanking(mode: string, type: string, page?: any) {
		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Authorization": `Bearer ${this.token}`
		}
		
		const response = await fetch(base + `/rankings/${mode}/${type}?cursor[page]=${page}`, {
			method: "GET",
			headers: headers
		});
		return await response.json();
	}
}