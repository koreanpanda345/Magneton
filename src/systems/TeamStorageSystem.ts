import { Message, MessageEmbed } from "discord.js";
import { CallbackError } from "mongoose";
import fetch from "node-fetch";

import { PokemonSet, Sets } from "@pkmn/sets";

import TeamStorage, { ITeamStorage } from "../databases/TeamStorage";
import { CommandContext } from "../types/commands";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TinyUrl = require("tinyurl");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const htmlToArticleJson = require("@mattersmedia/html-to-article-json")();
export class TeamStorageSystem {
	constructor(private _ctx: CommandContext) {}
	public async getTeams() {
		const data = await new Promise((resolve) => {
			return TeamStorage.findOne(
				{ userId: this._ctx.userId },
				async (error: CallbackError, record: ITeamStorage) => {
					if (error) {
						const embed = new MessageEmbed();
						embed.setTitle(
							"There was an error when trying to get all of your teams."
						);
						embed.setDescription(error);
						embed.setColor("RED");
						return this._ctx.sendMessage(embed);
					}
					if (!record) {
						const embed = new MessageEmbed();
						embed.setTitle("It doesn't seem like you ahve any teams made yet.");
						embed.setColor("ORANGE");
						embed.setDescription(
							"Use `addteam` command to add some teams to your pc."
						);
						return this._ctx.sendMessage(embed);
					}
					const teams = record.teams;
					let _teams = "";
					for (let i = 0; i < teams.length; i++) {
						_teams += `__**ID: ${i + 1}**__ - *${teams[i].name}*\n`;
					}

					return resolve(this._ctx.sendMessage(_teams));
				}
			);
		});
	}
	public async deleteTeam(id: number) {
		id = id - 1;
		const data = await new Promise((resolve) => {
			return TeamStorage.findOne(
				{ userId: this._ctx.userId },
				async (error: CallbackError, record: ITeamStorage) => {
					if (error) return resolve({ success: false, reason: error });
					if (!record)
						return resolve({
							success: false,
							reason: "You don't have any teams made yet.",
						});
					if (!record.teams[id])
						return resolve({
							success: false,
							reason: "There is no team with that id.",
						});
					record.teams.splice(id);
					record
						.save()
						.then(() => {
							return resolve({ success: true });
						})
						.catch((error) => {
							return resolve({ success: false, reason: error });
						});
				}
			);
		});

		return data as Promise<{ success: boolean; reason?: string }>;
	}
	public async getTeam(id: number) {
		id = id - 1; // we need to subtract the id, to get the correct index.
		const data = await new Promise((resolve) => {
			return TeamStorage.findOne(
				{ userId: this._ctx.userId },
				async (error: CallbackError, record: ITeamStorage) => {
					if (error) return resolve({ success: false, reason: error });
					if (!record)
						return resolve({
							success: false,
							reason: "You don't have any teams saved in your pc yet.",
						});
					const team = record.teams[id];
					if (!team)
						return resolve({
							success: false,
							reason: "There is no team with that id.",
						});
					console.debug(team);
					return resolve({ success: true, data: team });
				}
			);
		});
		return data as Promise<{
			success: boolean;
			reason?: string;
			data?: {
				name: string;
				team: string[];
			};
		}>;
	}
	public newTeam(team: PokemonSet[], name: string) {
		const ctx = this._ctx;
		const pokemons: string[] = [];
		team.forEach((x) => pokemons.push(Sets.toString(x)));
		const data = { name, team: pokemons };
		TeamStorage.findOne(
			{ userId: ctx.userId },
			async (error: CallbackError, record: ITeamStorage) => {
				if (error) {
					const embed = new MessageEmbed();
					embed.setTitle(
						"There was an error when trying to add this team to your PC."
					);
					embed.setDescription(error);
					embed.setColor("RED");

					return ctx.sendMessage(embed).then((msg) => {
						msg.delete({ timeout: 30000 });
					});
				}
				if (!record) {
					const newRecord = new TeamStorage({
						userId: ctx.userId,
						teams: data,
					});

					return newRecord
						.save()
						.then(() => {
							const embed = new MessageEmbed();
							embed.setTitle(`Team: ${data.name}`);
							embed.setDescription(`${data.team.join("\n")}`);
							embed.setFooter(
								"Saved the team to your PC. you can get your team at any time, by using the `getteam` command."
							);
							embed.setColor("RANDOM");

							return ctx.sendMessage(embed).then((msg) => {
								msg.delete({ timeout: 30000 });
							});
						})
						.catch((error) => {
							const embed = new MessageEmbed();
							embed.setTitle(
								"There was an error when trying to save this record."
							);
							embed.setDescription(error);
							embed.setColor("RED");

							return ctx.sendMessage(embed).then((msg) => {
								msg.delete({ timeout: 30000 });
							});
						});
				}
				record.teams.push(data);

				return record
					.save()
					.then(() => {
						const embed = new MessageEmbed();
						embed.setTitle(`Team: ${data.name}`);
						embed.setDescription(`${data.team.join("\n")}`);
						embed.setFooter(
							"Saved the team to your PC. you can get your team at any time, by using the `getteam` command."
						);
						embed.setColor("RANDOM");

						return ctx.sendMessage(embed).then((msg) => {
							msg.delete({ timeout: 30000 });
						});
					})
					.catch((error) => {
						const embed = new MessageEmbed();
						embed.setTitle(
							"There was an error when trying to save this record."
						);
						embed.setDescription(error);
						embed.setColor("RED");

						return ctx.sendMessage(embed).then((msg) => {
							msg.delete({ timeout: 30000 });
						});
					});
			}
		);
	}
	public async pasteTeam(id: number) {
		const result = await this.getTeam(id);
		if (!result.success) {
			const embed = new MessageEmbed();
			embed.setTitle("There was an error when trying to get this team.");
			embed.setDescription(result.reason);
			embed.setColor("RED");
			return this._ctx.sendMessage(embed);
		}
		const team = result.data;
		let url = encodeURI(
			"title=" +
				team?.name +
				"&paste=" +
				team?.team.join("") +
				"&author=" +
				this._ctx.user.username
		);
		url = url.replace(/:/g, "%3A");
		url = url.replace(/%20/g, "+");
		url = url.replace(/\n/g, "%0A");
		url = url.replace(/%0A/g, "%0D%0A");
		url = "https://pokepast.es/create?" + url;

		const data = await new Promise<{
			success: boolean;
			reason?: string;
			url?: string;
		}>((resolve) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			TinyUrl.shorten(url, (res, err) => {
				if (err) return resolve({ success: false, reason: err });
				return resolve({ success: true, url: res });
			});
		});
		if (!data.success) {
			const embed = new MessageEmbed();
			embed.setTitle("There was an error when trying to parse the url.");
			embed.setDescription(data.reason);
			embed.setColor("RED");
			return this._ctx.sendMessage(embed);
		} else {
			const embed = new MessageEmbed();
			embed.setTitle("Your PokePaste");
			embed.setURL(data.url!);
			embed.setDescription(
				"This url is from TinyUrl. TinyUrl is a url shortenr. Since the url was going to be massive, i have to shorten it. So don't be alarmed."
			);

			return this._ctx.sendMessage(embed);
		}
	}

	public async getDataFromPokePaste(
		url: string
	): Promise<{
		success: boolean;
		reason?: string;
		paste?: PokemonSet[];
		name?: string;
	}> {
		const data = await new Promise((resolve) => {
			fetch(url)
				.then((response) => response.text())
				.then((body: string) => {
					const json = htmlToArticleJson(body);
					const team: PokemonSet[] = [];
					for (let i = 0; i < json.length; i++) {
						if (json[i].type === "paragraph") {
							let content = json[i].children[0].content;
							content = content.replace(/Ability:+/g, "<>Ability:");
							content = content.replace(/EVs:+/g, "<>EVs:");
							content = content.replace(/IVs:+/g, "<>IVs:");
							content = content.replace(/(- )+/g, "<>-");
							content = content.replace(/<>+/g, "\n");
							team.push(Sets.fromString(content));
						}
					}
					team.pop();
					return resolve({
						success: true,
						name: json[json.length - 3].children[0].content,
						paste: team,
					});
				})
				.catch((error) => {
					console.error(error);
					return resolve({ success: false, reason: error });
				});
		});
		const parse = data as {
			success: boolean;
			reason?: string;
			paste?: PokemonSet[];
			name?: string;
		};
		return parse;
	}

	// <!DOCTYPE html>
	// <html>
	// <head>
	// <title>Untitled 65</title>
	// <link rel="stylesheet" href="/css/paste.css">
	// 	<meta name="robots" content="noindex">
	// 	</head>
	// 	<body>
	// 	<article>
	// 		<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/887-0.png">
	// 	<img class="img-item" src="/img/items/234.png">
	// 	</div>
	// 	<pre><span class="type-dragon">Dragapult</span> @ Leftovers
	// 		<span class="attr">Ability: </span>Infiltrator
	// <span class="attr">EVs: </span><span class="stat-atk">252 Atk</span> / <span class="stat-spd">4 SpD</span> / <s
	// 	pan class="stat-spe">252 Spe</span>
	// 	Adamant Nature
	// 	<span class="type-dragon">-</span> Dragon Dance
	// 		<span class="type-dragon">-</span> Dragon Darts
	// 		<span class="type-normal">-</span> Substitute
	// 		<span class="type-ghost">-</span> Phantom Force
	//
	// 	</pre>
	// 	</article>
	// 	<article>
	// 	<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/428-1.png">
	// 	<img class="img-item" src="/img/items/768.png">
	// 	</div>
	// 	<pre><span class="type-normal">Lopunny-Mega</span> @ Lopunnite
	// 		<span class="attr">Ability: </span>Limber
	// <span class="attr">EVs: </span><span class="stat-atk">252 Atk</span> / <span class="stat-spd">4 SpD</span> / <s
	// 	pan class="stat-spe">252 Spe</span>
	// 	Jolly Nature
	// 	<span class="type-normal">-</span> Fake Out
	// 		<span class="type-bug">-</span> U-turn
	// 		<span class="type-fighting">-</span> Close Combat
	// 		<span class="type-normal">-</span> Quick Attack
	//
	// 	</pre>
	// 	</article>
	// 	<article>
	// 	<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/249-0.png">
	// 	<img class="img-item" src="/img/items/234.png">
	// 	</div>
	// 	<pre><span class="type-psychic">Lugia</span> @ Leftovers
	// 		<span class="attr">Ability: </span>Multiscale
	// <span class="attr">EVs: </span><span class="stat-hp">252 HP</span> / <span class="stat-spa">4 SpA</span> / <spa
	// 	n class="stat-spd">252 SpD</span>
	// 	Calm Nature
	// 	<span class="attr">IVs: </span><span class="stat-atk">0 Atk</span>
	// <span class="type-poison">-</span> Toxic
	// 		<span class="type-normal">-</span> Recover
	// 		<span class="type-flying">-</span> Defog
	// 		<span class="type-flying">-</span> Aeroblast
	//
	// 	</pre>
	// 	</article>
	// 	<article>
	// 	<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/591-0.png">
	// 	<img class="img-item" src="/img/items/281.png">
	// 	</div>
	// 	<pre><span class="type-grass">Amoonguss</span> @ Black Sludge
	// 		<span class="attr">Ability: </span>Regenerator
	// <span class="attr">EVs: </span><span class="stat-hp">252 HP</span> / <span class="stat-spa">4 SpA</span> / <spa
	// 	n class="stat-spd">252 SpD</span>
	// 	Calm Nature
	// 	<span class="attr">IVs: </span><span class="stat-atk">0 Atk</span>
	// <span class="type-grass">-</span> Synthesis
	// 		<span class="type-grass">-</span> Worry Seed
	// 		<span class="type-poison">-</span> Toxic
	// 		<span class="type-ice">-</span> Hidden Power [Ice]
	//
	// 	</pre>
	// 	</article>
	// 	<article>
	// 	<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/720-1.png">
	// 	<img class="img-item" src="/img/items/287.png">
	// 	</div>
	// 	<pre><span class="type-psychic">Hoopa-Unbound</span> @ Choice Scarf
	// 		<span class="attr">Ability: </span>Magician
	// <span class="attr">EVs: </span><span class="stat-atk">252 Atk</span> / <span class="stat-spd">4 SpD</span> / <s
	// 	pan class="stat-spe">252 Spe</span>
	// 	Jolly Nature
	// 	<span class="type-ghost">-</span> Destiny Bond
	// 		<span class="type-dark">-</span> Knock Off
	// 		<span class="type-dark">-</span> Taunt
	// 		<span class="type-psychic">-</span> Zen Headbutt
	//
	// 	</pre>
	// 	</article>
	// 	<article>
	// 	<div class="img">
	// 	<img class="img-pokemon" src="/img/pokemon/277-0.png">
	// 	<img class="img-item" src="/img/items/297.png">
	// 	</div>
	// 	<pre><span class="type-normal">Swellow</span> @ Choice Specs
	// 		<span class="attr">Ability: </span>Scrappy
	// <span class="attr">EVs: </span><span class="stat-spa">252 SpA</span> / <span class="stat-spd">4 SpD</span> / <s
	// 	pan class="stat-spe">252 Spe</span>
	// 	Timid Nature
	// 	<span class="type-normal">-</span> Boomburst
	// 		<span class="type-fire">-</span> Heat Wave
	// 		<span class="type-flying">-</span> Air Slash
	// 		<span class="type-bug">-</span> U-turn
	//
	// 		</pre>
	// 		</article>
	// 		<aside>
	// 		<h1>Untitled 65</h1>
	// <h2>&nbsp;by iG Koreanpanda</h2>
	// <input id="vgcmode" type="checkbox">
	// 		<label for="vgcmode">Columns Mode</label> /
	// <input id="evivmode" type="checkbox">
	// 		<label for="evivmode">Stat Colours</label> /
	// <input id="lightmode" type="checkbox">
	// 		<label for="lightmode">Light Mode</label>
	// </aside>
	// <script src="/js/preferences.js"></script>
	// 		</body>
	// 		</html>
}
