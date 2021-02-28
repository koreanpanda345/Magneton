import { CommandContext } from "../types/CommandContext";
import DraftTimer from "../database/DraftTimerSchema";
import { IDraftTimer } from './../database/DraftTimerSchema';
import { CallbackError } from "mongoose";
import {Dex} from "@pkmn/dex";
import { MessageEmbed, Message, MessageCollector, DMChannel } from "discord.js";
import moment from "moment";
import { GoogleSheets } from "../modules/GoogleSheets";
const Timer = require("i-event-timer");
export class DraftSystem {
	constructor(
		private _ctx: CommandContext
	){
	}
	
	public timer = new Timer();

	public async start(record: IDraftTimer) {
		let ctx = this._ctx;
		ctx.sendMessage(`Draft Timer has been turned on!`);
		await this.askForPick(record);
	}

	public isPlayersTurn(record: IDraftTimer, userId: string) {
		return userId === record.currentPlayer;
	}

	public async makeupPick(ctx: CommandContext, userId: string, prefix: string, pokemon: string, text?: string) {
		let record = await this.whichLeague(prefix) as IDraftTimer;
		let player = this.getCurrentPlayer(record);
		if(player?.skips === 0) return ctx.sendMessage("You don't have any makeup picks.");
		if(!record) return ctx.sendMessage("There doesn't seem like there is a league with that prefix");
		if(!this.doesPokemonExist(pokemon)) return ctx.sendMessage("That is not a valid pokemon.");
		if(this.isPokemonTaken(record, pokemon).taken === true) {
			let result = this.isPokemonTaken(record, pokemon);
			return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner!)).username}`);
		}

		let name = Dex.getSpecies(pokemon);

		let embed = new MessageEmbed();
		embed.setTitle("Makeup Pick");
		embed.setDescription(`<@${ctx.userId}> has selected ${name.name} as their make up pick.`);
		let img = this.getImageForPokemon(name.name);
		embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`)
		embed.setColor("RANDOM");

		record.pokemon.push(name.name);
		player?.pokemon.push(name.name);
		player!.skips--;

		if(record.sheetId !== undefined && record.sheetId !== "none") {
			await this.sendToSheet(record.sheetId, [[(await this._ctx.client.users.fetch(userId)).username, name.name]]);
			console.log("Set to sheets");
		}

		record.save().catch(error => console.error(error));
		ctx.sendMessage(embed);
	}

	public async askForPick(record: IDraftTimer): Promise<MessageCollector> {
		return await new Promise(async (resolve) => {
			let who = this.getCurrentPlayer(record)?.userId;
			(await this._ctx.client.users.fetch(who!)).createDM().then(dm => {
				let player = record.players.find(x => x.userId === record.currentPlayer)!;
				let time = moment(player.skips === 0 ? record.timer : Math.floor(Math.round(record.timer / (2 * player.skips))));
				let pickEmbed = new MessageEmbed()
						.setTitle(`Its your pick in ${this._ctx.guild?.name}`)
						.setDescription(`Your league's prefix is ${record.prefix}. To draft a pokemon type in \`m!pick ${record.prefix} <pokemon name>\` example: \`m!pick ${record.prefix} lopunny\``)
						.setColor("RANDOM")
						.addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
						.setFooter(`We are on pick ${player?.order} of round ${record.round} / ${record.maxRounds}`);
					dm.send(pickEmbed);
				let serverEmbed = new MessageEmbed()
					.setDescription(`<@${record.currentPlayer}> is on the Clock!\nWe are on pick ${player?.order} of round ${record.round} / ${record.maxRounds}`)
					.addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
					.setColor("RANDOM");
				this._ctx.sendMessage(serverEmbed);
				this.timer = new Timer(time.milliseconds(), [(time.milliseconds() / 2)]);
				this.timer.startTimer();
				this.timer.on("notify", (n: number) => {
					dm.send(`You have ${moment(n).minutes()} minutes left before you get skipped.`);
				});
				this.timer.on("end", () => {
					return this.skip(record);
				})
			});
		});
	}

	public async editPick(ctx: CommandContext, userId: string, prefix: string, oldPokemon: string, newPokemon: string) {
		let record = await this.whichLeague(prefix) as IDraftTimer;
		let player = record.players.find(x => x.userId === userId)!;
		if(!record) return ctx.sendMessage("There doesn't seem like there is a league with the prefix");
		if(!this.doesPokemonExist(newPokemon)) return ctx.sendMessage("That is a not a valid pokemon");
		if(this.isPokemonTaken(record, newPokemon).taken === true) {
			let result = this.isPokemonTaken(record, newPokemon);
			return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner!)).username}`);
		}
		let newName = Dex.getSpecies(newPokemon);
		let oldName = Dex.getSpecies(oldPokemon);

		let draftEmbed = new MessageEmbed()
		record.pokemon![record.pokemon!.findIndex(x => x === oldName.name)]! = newName.name;
		player!.pokemon![record.pokemon!.findIndex(x => x === oldName.name)]! = newName.name;
		draftEmbed.setDescription(`<@${record.currentPlayer}> has drafted **${newName.name}** instead of **${oldName.name}**`);
		let img = this.getImageForPokemon(newName.name);
		draftEmbed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`)
		draftEmbed.setColor("RANDOM");
		console.log(record.sheetId);
		this._ctx.sendMessage(draftEmbed);
		if(record.sheetId !== undefined && record.sheetId !== "none") {
			const gs = new GoogleSheets();
			await gs.update({spreadsheetId: record.sheetId, data: [[
				(await ctx.client.users.fetch(player.userId)).username,
				oldName.name,
				newName.name
			]]});
			console.log("Updated Sheets");
		}
		record.save().catch(error => console.error());
	}

	public async makePick(ctx: CommandContext, userId: string, prefix: string, pokemon: string, text: string) {
		let record = await this.whichLeague(prefix) as IDraftTimer;
		let player = this.getCurrentPlayer(record);
		if(!record) return ctx.sendMessage("There doesn't seem like there is a league with the prefix");
		if(!this.doesPokemonExist(pokemon)) return ctx.sendMessage("That is a not a valid pokemon");
		if(this.isPokemonTaken(record, pokemon).taken === true) {
			let result = this.isPokemonTaken(record, pokemon);
			return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner!)).username}`);
		}
		let name = Dex.getSpecies(pokemon);
		record.pokemon.push(name.name);
		player?.pokemon.push(name.name);
		let draftEmbed = new MessageEmbed()

		draftEmbed.setDescription(`<@${record.currentPlayer}> Has Drafted **${name.name}**${text !== "" ? `\n${text}`: ""}`)
		let img = this.getImageForPokemon(name.name);
		draftEmbed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`)
		draftEmbed.setColor("RANDOM");
		console.log(record.sheetId);
		this._ctx.sendMessage(draftEmbed);
		this.timer.stopTimer();
		if(record.sheetId !== undefined && record.sheetId !== "none") {
			await this.sendToSheet(record.sheetId, [[(await this._ctx.client.users.fetch(userId)).username, name.name]]);
			console.log("Set to sheets");
		}
		
		return this.next(record);
	}

	public isInDraft(record: IDraftTimer, userId: string) {
		return record.players.find(x => x.userId === userId);
	}

	public async addPlayer(callback: (record: IDraftTimer) => IDraftTimer) {
		let record = await this.getDraftData();
		let result = callback(record);
		result.save().catch(error => console.error(error));
	}

	public destroy(prefix: string, channelId: string) {
		DraftTimer.deleteOne({prefix, channelId}).catch(error => console.error(error));	
	}

	public async next(record: IDraftTimer) {
		this.timer.resetTime();
		let player = record.players.find(x => x.userId === record.currentPlayer);
		if(record.direction === "down") {
			if(player?.order === record.players.length) {
				record.direction = "up";
				record.round++;
			}
			else 
				record.currentPlayer = record.players.find(x => x.order === player?.order! + 1)?.userId!;
		}
		else if(record.direction === "up") {
			if(player?.order === 1) {
				record.direction = "down";
				record.round++;
			}
			else 
				record.currentPlayer = record.players.find(x => x.order === player?.order! - 1)?.userId!;	
		}
		if(record.round >= record.maxRounds) {
			let finishedEmbed = new MessageEmbed();
				finishedEmbed.setTitle('Draft has concluded');
				finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
				finishedEmbed.setColor("RANDOM");
				for(let _player of record.players) {
					let desc = "";
						_player.pokemon.forEach(x => desc += `Round ${_player.pokemon.findIndex(y => y === x) + 1} - ${x}\n`);

						finishedEmbed.addField(`Player ${(await this._ctx.client.users.fetch(_player.userId)).username}`, desc, true);
				}
			this._ctx.client.drafts.delete(record.prefix);
			return this._ctx.sendMessage(finishedEmbed);
		}
		record.save().catch(error => console.error(error));
		console.log(record);
		return record;
	}

	private getImageForPokemon(pokemon: string) {
		return pokemon.startsWith("Tapu") ?
			pokemon.replace(" ", "").toLowerCase() :
			pokemon.toLowerCase();
	}

	private async sendToSheet(spreadsheetId: string, data: Array<Array<string>>) {
		const gs = new GoogleSheets();
		await gs.add({spreadsheetId, data});
	}

	private async whichLeague(prefix: string): Promise<IDraftTimer | false> {
		return await new Promise((resolve) => {
			DraftTimer.findOne({prefix}, (error: CallbackError, record: IDraftTimer) => {
				if(!record) return false;
				return resolve(record);
			});
		});
	}

	private doesPokemonExist(pokemon: string) {
		return Dex.getSpecies(pokemon).exists;
	}

	private isPokemonTaken(record: IDraftTimer, pokemon: string) {
		let found = record.pokemon.find(x => x === pokemon.toLowerCase());
		if(found) {
			let owner = record.players.find(x => x.pokemon.includes(pokemon.toLowerCase()));
			return {taken: true, owner: owner?.userId, pokemon: pokemon};
		}
		return {taken: false};
	}

	private getCurrentPlayer(record: IDraftTimer) {
		return record.players.find(x => x.userId === record.currentPlayer);
	}

	private async stop(record: IDraftTimer) {
		this._ctx.sendMessage("Stopping Draft");
		this._ctx.client.drafts.delete(record.prefix);
	}

	public async skip(record: IDraftTimer) {
		let player = this.getCurrentPlayer(record);
		if(this.isWheelPick(record)) {
			record.direction = record.direction === "down" ? "up" : "down";
		}
		this._ctx.sendMessage(`Skipped ${(await this._ctx.client.users.fetch(record.currentPlayer)).username}`);
		player!.skips++;
		if(record.direction === "down") {
			if(player?.order === record.players.length) {
				record.direction = "up";
				record.round++;
			}
			else 
				record.currentPlayer = record.players.find(x => x.order === player?.order! + 1)?.userId!;
		}
		else if(record.direction === "up") {
			if(player?.order === 1) {
				record.direction = "down";
				record.round++;
			}
			else 
				record.currentPlayer = record.players.find(x => x.order === player?.order! - 1)?.userId!;	
		}
		record.save().catch(error => console.error(error));
		return record;
	}

	private isWheelPick(record: IDraftTimer) {
		let player = record.players.find(x => x.userId === record.currentPlayer);
		return (player?.order! >= record.players.length || player?.order! <= 0);
	}

	public async getDraftData(): Promise<IDraftTimer> {
		return await new Promise((resolve) => {
			DraftTimer.findOne({channelId: this._ctx.channelId}, async (error: CallbackError, record: IDraftTimer) => {
				if(record === null) return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
				return resolve(record);
			});
		});
	}
}