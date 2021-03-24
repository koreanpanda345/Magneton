import { DraftSystem } from "./DraftSystem";
import { CommandContext } from "../types/commands";
import { Dex } from "@pkmn/dex";
import { MessageEmbed, Message } from "discord.js";
import { client, logger } from "..";
import DraftTimer, { IDraftTimer } from "../databases/DraftTimer";
import { CallbackError } from "mongoose";
export class TradeSystem {
	private _data: {
		id: number;
		embed: MessageEmbed;
		message?: Message;
		players: {
			player: string;
			offer: string;
			accept: boolean;
		}[];
	} = {
		id: client.cache.trades.size,
		embed: new MessageEmbed(),
		players: [],
	};

	constructor(private _players: string[], private _prefix: string) {
		_players.forEach((player) => {
			this._data.players?.push({
				player,
				offer: "",
				accept: false,
			});
			console.debug(this._data.players);
		});
	}
	public isPlayerInTrade(userId: string) {
		return this._players.includes(userId);
	}
	public async start(ctx: CommandContext) {
		this._data.embed.setTitle("Trade is in progress...");
		this._data.embed.setAuthor(
			`Trade Between ${
				(await client.users.fetch(this._players[0])).username
			} and ${(await client.users.fetch(this._players[1])).username}`
		);
		this._data.embed.setDescription(
			`Trade Id: **${this._data.id}**\n` +
				"To make an offer, use the `offer` command.\n" +
				"To accept the trade, use the `accept` command.\n" +
				"To decline the trade, use the `decline` command."
		);
		this._data.embed.addField(
			`${(await client.users.fetch(this._players[0])).username} is offering...`,
			"\u200b",
			true
		);
		this._data.embed.addField(
			`${(await client.users.fetch(this._players[1])).username} is offering...`,
			"\u200b",
			true
		);

		this._data.embed.setColor("RANDOM");
		this._data.message = await ctx.sendMessage(this.data.embed);
	}

	public async offerPokemon(
		player: string,
		pokemon: string,
		ctx: CommandContext
	) {
		if (!Dex.getSpecies(pokemon).exists)
			return ctx.sendMessage("That is not a valid pokemon.");
		const record = await this.getData();
		if (!record)
			return ctx.sendMessage(
				"There doesn't seem to be any draft with that prefix."
			);
		const _player = (record as IDraftTimer).players?.find(
			(x) => x.userId === player
		);
		const _pokemon = Dex.getSpecies(pokemon);
		if (!_player?.pokemon.includes(_pokemon.name))
			return ctx.sendMessage("You didn't draft this pokemon.");
		this._data.players!.find((x) => x.player === player)!.offer = pokemon;
		this._data.embed.fields[
			this._players.findIndex((x) => x === player)
		].value = `${_pokemon.name}`;
		await this._data.message?.edit(this._data.embed);
	}

	private async getData() {
		return await new Promise((resolve) => {
			DraftTimer.findOne(
				{ prefix: this._prefix },
				(error: CallbackError, record: IDraftTimer) => {
					if (error) return console.error(error);
					if (!record) return false;
					return resolve(record);
				}
			);
		});
	}

	public async accept(userId: string, ctx: CommandContext) {
		this._data.players.forEach((player) => {
			if (player.offer === "")
				return ctx.sendMessage(
					"Both sides must offer a pokemon, in order for the trade to be accepted."
				);
		});
		const record = await this.getData();
		const accepted: { [key: string]: boolean } = {};
		this._data.players.forEach((player) => {
			accepted[player.player] = player.accept;
		});
		// If both players accepted the trade.
		if (accepted[0] === true && accepted[1] === true) {
			const player1 = (record as IDraftTimer).players?.find(
				(x) => x.userId === this._players[0]
			);
			const player2 = (record as IDraftTimer).players?.find(
				(x) => x.userId === this._players[1]
			);

			player1!.pokemon[
				player1!.pokemon.findIndex(
					(x) =>
						x ===
						this._data!.players!.find((x) => x.player === this._players[0])!
							.offer
				)
			] = this._data?.players?.find(
				(x) => x.player === this._players[1]
			)!.offer;

			player2!.pokemon[
				player2!.pokemon.findIndex(
					(x) =>
						x ===
						this._data!.players!.find((x) => x.player === this._players[1])!
							.offer
				)
			] = this._data?.players?.find(
				(x) => x.player === this._players[0]
			)!.offer;
			(record as IDraftTimer)
				.save()
				.then(async (_record) => {
					console.log(_record);
					this._data.embed = new MessageEmbed();
					this._data.embed.setTitle("Trade was successful.");
					this._data.embed.setColor("GREEN");
					await this._data.message?.edit(this._data.embed);
				})
				.catch((error) => logger.error(error));
		}
	}

	public get data() {
		return this._data;
	}
}
