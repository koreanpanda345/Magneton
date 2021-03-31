/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { MessageEmbed, TextChannel } from "discord.js";
import moment from "moment";
import { CallbackError } from "mongoose";
import Timeout from "smart-timeout";

import { Dex } from "@pkmn/dex";

import { client } from "../";
import DraftTimer, { IDraftTimer } from "../databases/DraftTimer";
import { GoogleSheets } from "../modules/GoogleSheets";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandContext } from "../types/commands";

export class DraftSystem {
	constructor(private _ctx: CommandContext) {}

	public async getDraftData(): Promise<IDraftTimer> {
		return await new Promise((resolve) => {
			DraftTimer.findOne(
				{ channelId: this._ctx.channelId },
				async (error: CallbackError, record: IDraftTimer) => {
					if (record === null)
						return await this._ctx.sendMessage(
							"There doesn't seem to be a draft made. Please set one up by using the `setdraft` command."
						);
					return resolve(record);
				}
			).catch((error) => console.error(error));
		});
	}

	private isWheelPick(record: IDraftTimer): boolean {
		const player = this.getCurrentPlayer(record);
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		return player?.order! >= record.players.length || player?.order! <= 1;
	}

	private getCurrentPlayer(record: IDraftTimer) {
		return record.players.find((x) => x.user_id === record.current_player);
	}

	public isPokemonTaken(record: IDraftTimer, pokemon: string) {
		const found = record.pokemons.find(
			(x) => x.toLowerCase() === pokemon.toLowerCase()
		);
		if (found) {
			const owner = record.players.find((x) =>
				x.pokemon.find((y) => y.toLowerCase() === pokemon.toLowerCase())
			);
			return {
				taken: true,
				owner: owner?.user_id!,
				pokemon,
			};
		}
		return {
			taken: false,
		};
	}

	public doesPokemonExist(pokemon: string) {
		return Dex.getSpecies(pokemon).exists;
	}

	private async whichLeague(prefix: string) {
		return await new Promise((resolve) => {
			DraftTimer.findOne(
				{ prefix },
				(error: CallbackError, record: IDraftTimer) => {
					if (!record) return false;
					console.log(record);
					if (error) throw new Error(error.message);
					return resolve(record);
				}
			);
		});
	}

	private static getImageForPokemon(pokemon: string) {
		return pokemon.startsWith("Tapu")
			? pokemon.replace(" ", "").toLowerCase()
			: pokemon.toLowerCase();
	}

	public destroy(prefix: string, channel_id: string) {
		DraftTimer.deleteOne({ prefix, channel_id }).catch((error) =>
			console.error(error)
		);
	}

	public isInDraft(record: IDraftTimer, userId: string) {
		return record.players.find((x) => x.user_id === userId);
	}
	public async addPlayer(callback: (record: IDraftTimer) => IDraftTimer) {
		const record = await this.getDraftData();
		const result = callback(record);
		result.save().catch((error) => console.error(error));
	}

	public isPlayersTurn(record: IDraftTimer, userId: string) {
		return userId == record.current_player;
	}

	public getPlayer(record: IDraftTimer, userId: string) {
		return record.players.find((x) => x.user_id === userId);
	}

	public async start(record: IDraftTimer) {
		await this._ctx.sendMessage(`Draft Timer has been turned on.`);
		await this.askForPick(record);
		Timeout.create(
			record.league_name,
			async () => {
				record = await this.skip(record);
				await this.askForPick(record);
			},
			record.timer
		);
	}

	private async setTimer(record: IDraftTimer, time: number) {
		Timeout.clear(record.league_name, true);
		Timeout.create(
			record.league_name,
			async () => {
				await this.skip(record);
			},
			time
		);
	}

	public async getTimeRemaining(record: IDraftTimer, ctx: CommandContext) {
		return await new Promise(() => {
			const embed = new MessageEmbed();
			embed.setTitle("Time Remaining.");
			const time = moment(Timeout.remaining(record.league_name));
			const str = `<@${record.current_player}> has ${
				time.minutes() >= 60
					? `${time.hours()} hours`
					: time.minutes() > 0
					? `${time.minutes()} minutes`
					: `${time.seconds()} seconds`
			} left`;
			embed.setDescription(str);
			embed.setColor("RANDOM");

			ctx.sendMessage(embed);
		});
	}

	private async checkQueue(record: IDraftTimer) {
		// eslint-disable-next-line no-async-promise-executor
		return await new Promise(async (resolve) => {
			const player = this.getCurrentPlayer(record);
			if (player?.queue.length !== 0) {
				const pokemon = player?.queue.shift();
				record = (await record
					.save()
					.catch((error) => console.error(error))) as IDraftTimer;
				await this.makePick(
					this._ctx,
					player!.user_id,
					record.prefix,
					pokemon!,
					""
				);
				return resolve(true);
			}

			return resolve(false);
		});
	}

	public async askForPick(record: IDraftTimer) {
		// eslint-disable-next-line no-async-promise-executor
		return await new Promise(async (resolve) => {
			const result = await this.checkQueue(record);
			if (result) return;
			const player = this.getCurrentPlayer(record);
			if (player?.done) {
				record = (await this.skip(record)) as IDraftTimer;
				await this.askForPick(record);
				return;
			}
			if (record.modes.skips && player!.skips >= record.total_skips) {
				record = (await this.skip(record)) as IDraftTimer;
				await this.askForPick(record);
				return;
			}
			if (record.modes.dm) {
				(await client.users?.fetch(player?.user_id!))
					.createDM()
					.then(async (dm) => {
						await this.setTimer(
							record,
							player!.skips === 0
								? record.timer
								: Math.floor(Math.round(record.timer / (2 * player!.skips)))
						);
						const pickEmbed = new MessageEmbed()
							.setTitle(`Its your pick in ${record.league_name}`)
							.setDescription(
								`Your league's prefix is \`${record.prefix}\`To draft a pokemon type in \`m!pick ${record.prefix} <pokemon name>\` example: \`m!pick ${record.prefix} lopunny\``
							)
							.setColor("RANDOM")
							.addField(
								"Timer",
								` ${
									record.pause
										? "Timer Is off"
										: record.timer / 60000 >= 60
										? `${record.timer / 3600000} hours`
										: `${record.timer / 60000} minutes`
								}`
							)
							.setFooter(
								`We are on pick ${player?.order} of round ${record.round} / ${record.max_rounds}`
							);
						dm.send(pickEmbed);
						const serverEmbed = new MessageEmbed()
							.setDescription(
								`<@${record.current_player}> is on the Clock!\nWe are on pick ${player?.order} of round ${record.round} / ${record.max_rounds}`
							)
							.addField(
								"Timer:",
								`${
									record.pause
										? "Timer Is off"
										: record.timer / 60000 >= 60
										? `${record.timer / 3600000} hours`
										: `${record.timer / 60000} minutes`
								}`
							)
							.setColor("RANDOM");
						await this._ctx.sendMessage(serverEmbed);
					});
			} else {
				const serverEmbed = new MessageEmbed()
					.setDescription(
						`<@${record.current_player}> is on the Clock!\nWe are on pick ${player?.order} of round ${record.round} / ${record.max_rounds}`
					)
					.addField(
						"Timer:",
						`${
							record.pause
								? "Timer Is off"
								: record.timer / 60000 >= 60
								? `${record.timer / 3600000} hours`
								: `${record.timer / 60000} minutes`
						}`
					)
					.setColor("RANDOM");
				await (this._ctx.channel as TextChannel).send(
					`<@${record.current_player}>`,
					{
						embed: serverEmbed,
					}
				);
			}
		});
	}

	public async skip(record: IDraftTimer) {
		const player = this.getCurrentPlayer(record);
		if (this.isWheelPick(record)) {
			record.direction = record.direction === "down" ? "up" : "down";
		}
		await this._ctx.sendMessage(
			`Skipped ${(await client.users.fetch(record.current_player)).username}`
		);
		player!.skips++;
		record = (await this.next(record)) as IDraftTimer;
		return record;
	}

	public async next(record: IDraftTimer) {
		const player = this.getCurrentPlayer(record);
		if (record.direction === "down") {
			if (player?.order === record.players.length) {
				record.direction = "up";
				record.round++;
			} else
				record.current_player = record.players.find(
					(x) => x.order === player?.order! + 1
				)?.user_id!;
		} else if (record.direction === "up") {
			if (player?.order === 1) {
				record.direction = "down";
				record.round++;
			} else
				record.current_player = record.players.find(
					(x) => x.order === player?.order! - 1
				)?.user_id!;
		}
		if (record.round > record.max_rounds) {
			const finishedEmbed = new MessageEmbed();
			finishedEmbed.setTitle("Draft has concluded");
			finishedEmbed.setDescription(
				`Here is the Drafts that each player has made.`
			);
			finishedEmbed.setColor("RANDOM");
			for (const _player of record.players) {
				let desc = "";
				_player.pokemon.forEach(
					(x) =>
						(desc += `Round ${
							_player.pokemon.findIndex((y) => y === x) + 1
						} - ${x}\n`)
				);

				finishedEmbed.addField(
					`Player ${(await client.users.fetch(_player.user_id)).username}`,
					desc,
					true
				);
			}
			client.cache.drafts.delete(record.prefix);
			return this._ctx.sendMessage(finishedEmbed);
		}
		record.save().catch((error) => console.error(error));
		console.log(record);
		return record;
	}
	public async editPick(
		ctx: CommandContext,
		userId: string,
		prefix: string,
		oldPokemon: string,
		newPokemon: string
	) {
		const record = (await this.whichLeague(prefix)) as IDraftTimer;
		console.debug(record);
		const player = record.players.find((x) => x.user_id === userId)!;
		if (!record)
			return ctx.sendMessage(
				"There doesn't seem like there is a league with the prefix"
			);
		if (!this.doesPokemonExist(newPokemon))
			return ctx.sendMessage("That is a not a valid pokemon");
		if (this.isPokemonTaken(record, newPokemon)!.taken) {
			const result = this.isPokemonTaken(record, newPokemon);
			return ctx.sendMessage(
				`${result!.pokemon} has already been drafted by ${
					(await client.users.fetch(result!.owner!)).username
				}`
			);
		}
		const newName = Dex.getSpecies(newPokemon);
		const oldName = Dex.getSpecies(oldPokemon);

		const draftEmbed = new MessageEmbed();
		record.pokemons![
			record.pokemons!.findIndex((x) => x === oldName.name)
		]! = newName.name;
		player!.pokemon![
			record.pokemons!.findIndex((x) => x === oldName.name)
		]! = newName.name;
		draftEmbed.setDescription(
			`<@${record.current_player}> has drafted **${newName.name}** instead of **${oldName.name}**`
		);
		const img = DraftSystem.getImageForPokemon(newName.name);
		draftEmbed.setImage(
			`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`
		);
		draftEmbed.setColor("RANDOM");
		console.log(record.sheet_id);
		await this._ctx.sendMessage(draftEmbed);
		if (record.sheet_id !== undefined && record.sheet_id !== "none") {
			const gs = new GoogleSheets();
			await gs.update({
				spreadsheetId: record.sheet_id,
				data: [
					[
						(await client.users.fetch(player.user_id)).username,
						oldName.name,
						newName.name,
					],
				],
			});
			console.log("Updated Sheets");
		}
		record.save().catch(() => console.error());
	}

	public async makePick(
		ctx: CommandContext,
		userId: string,
		prefix: string,
		pokemon: string,
		text: string
	) {
		const record = (await this.whichLeague(prefix)) as IDraftTimer;
		console.debug(record);
		const player = this.getCurrentPlayer(record);
		if (!record)
			return await ctx.sendMessage(
				"There doesn't seem like there is a league with the prefix"
			);
		if (!this.doesPokemonExist(pokemon))
			return await ctx.sendMessage("That is a not a valid pokemon");
		if (this.isPokemonTaken(record, pokemon)!.taken) {
			const result = this.isPokemonTaken(record, pokemon);
			console.log(result);
			return ctx.sendMessage(
				`${result!.pokemon} has already been drafted by ${
					(await client.users.fetch(result!.owner!)).username
				}`
			);
		}
		const name = Dex.getSpecies(pokemon);
		record.pokemons.push(name.name);
		player?.pokemon.push(name.name);
		const draftEmbed = new MessageEmbed();

		draftEmbed.setDescription(
			`<@${record.current_player}> Has Drafted **${name.name}**${
				text !== "" ? `\n${text}` : ""
			}`
		);
		const img = DraftSystem.getImageForPokemon(name.name);
		draftEmbed.setImage(
			`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`
		);
		draftEmbed.setColor("RANDOM");
		console.log(record.sheet_id);
		await this._ctx.sendMessage(draftEmbed);
		if (record.sheet_id !== undefined && record.sheet_id !== "none") {
			await DraftSystem.sendToSheet(record.sheet_id, [
				[(await client.users.fetch(userId)).username, name.name],
			]);
			console.log("Set to sheets");
		}

		return this.next(record);
	}
	public async makeupPick(
		ctx: CommandContext,
		userId: string,
		prefix: string,
		pokemon: string
	) {
		const record = (await this.whichLeague(prefix)) as IDraftTimer;
		const player = this.getPlayer(record, userId);
		if (player?.skips === 0)
			return ctx.sendMessage("You don't have any makeup picks.");
		if (!record)
			return ctx.sendMessage(
				"There doesn't seem like there is a league with that prefix"
			);
		if (!this.doesPokemonExist(pokemon))
			return ctx.sendMessage("That is not a valid pokemon.");
		if (this.isPokemonTaken(record, pokemon).taken) {
			const result = this.isPokemonTaken(record, pokemon);
			return ctx.sendMessage(
				`${result.pokemon} has already been drafted by ${
					(await client.users.fetch(result.owner!)).username
				}`
			);
		}

		const name = Dex.getSpecies(pokemon);

		const embed = new MessageEmbed();
		embed.setTitle("Makeup Pick");
		embed.setDescription(
			`<@${ctx.userId}> has selected ${name.name} as their make up pick.`
		);
		const img = DraftSystem.getImageForPokemon(name.name);
		embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`);
		embed.setColor("RANDOM");

		record.pokemons.push(name.name);
		player?.pokemon.push(name.name);
		player!.skips--;

		if (record.sheet_id !== undefined && record.sheet_id !== "none") {
			await DraftSystem.sendToSheet(record.sheet_id, [
				[(await client.users.fetch(userId)).username, name.name],
			]);
			console.log("Set to sheets");
		}

		record.save().catch((error) => console.error(error));
		await ctx.sendMessage(embed);
	}

	private static async sendToSheet(
		spreadsheetId: string,
		data: Array<Array<string>>
	) {
		const gs = new GoogleSheets();
		await gs.add({ spreadsheetId, data });
	}

	public async stop(record: IDraftTimer) {
		await this._ctx.sendMessage("Stopping Draft");
		if (Timeout.exists(record.league_name))
			Timeout.clear(record.league_name, true);
		client.cache.drafts.delete(record.prefix);
	}
}
