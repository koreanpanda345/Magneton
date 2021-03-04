import { CommandContext } from "../types/CommandContext";
import DraftTimerSchema, { IDraftTimer } from "../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Dex } from "@pkmn/dex";


export class TradeSystem {
	private _data: {
		draft?: IDraftTimer,
		tradeId: number
		players: {[key: string]: GuildMember},
		offer: {[key: string]: string},
		accept: {[key: string]: boolean},
		message?: Message,
		embed?: MessageEmbed
	};
	constructor(
		private _ctx: CommandContext,
	){
		this._data = {
			tradeId: this.getId() as number,
			players: {

			},
			offer: {

			},
			accept: {

			}
		};
	}

	getId(increment: number = 1) {
		let id = this._ctx.client.trades.size + increment;
		if(this._ctx.client.trades.has(id))
			this.getId(increment++);
		else return id;
	}

	async getDraft(prefix: string): Promise<IDraftTimer> {
		return await new Promise((resolve) => {
			DraftTimerSchema.findOne({prefix}, (error: CallbackError, record: IDraftTimer) => {
				if(!record) return this._ctx.sendMessage("There is no draft under this prefix.");
				return resolve(record);
			});
		});
	}

	isInDraft(record: IDraftTimer, userId: string) {
		return record.players.find(x => x.userId === userId);
	}
	isInTrade(userId: string) {
		return ((this._data.players.trader?.id === userId) || (this._data.players.tradee?.id === userId));
	}

	async getPlayer(draft: IDraftTimer, userId: string) {
		if(!this.isInDraft(draft, userId)) return this._ctx.sendMessage("You are not in this draft.");
		let tradee = this._ctx.message.mentions.members?.first() as GuildMember;
		if(!this.isInDraft(draft, tradee?.id as string)) return this._ctx.sendMessage("This player is not in the draft.");
		this._data.players.trader = this._ctx.member as GuildMember;
		this._data.players.tradee = tradee as GuildMember;
		this._data.draft! = draft;
		this._ctx.client.trades.set(this._data.tradeId, this);
		await this.sendEmbed();
	}

	doesPlayerHavePokemon(record: IDraftTimer, userId: string, pokemon: string) {
		let player = record.players.find(x => x.userId === userId);
		return player?.pokemon.includes(pokemon);
	}

	async setOffer(draft: IDraftTimer, ctx: CommandContext, pokemon: string) {
		if(!this.isInTrade(ctx.userId)) return ctx.sendMessage("You are not in this draft.");
		let player = (this.data.players.trader === ctx.member) ? "trader" : "tradee";
		let _pokemon = Dex.getSpecies(pokemon);
		if(!_pokemon.exists) return ctx.sendMessage("That is not a valid pokemon");
		if(!this.doesPlayerHavePokemon(draft, ctx.userId, _pokemon.name))
			return ctx.sendMessage("You didn't draft this pokemon.");
		this._data.offer[`${player}`] = _pokemon.name;
		this._data.embed?.addField(`Player ${ctx.user.username} is offering`, `${_pokemon.name}`, true);
		this._data.message?.edit(this._data.embed as MessageEmbed);
	}

	async confirm(ctx: CommandContext) {
		let player = (this._data.players.trader === ctx.member) ? "trader" : "tradee";
		this._data.accept[player] = true;
		this._data.embed!.description += `\n${ctx.user.username} has accepted ✅`;
		this._data.message?.edit(this._data!.embed!);
		if(this._data.accept["trader"] === true && this._data.accept["tradee"] === true) {
			await this.makeTrade();
		}
	}

	async decline(ctx: CommandContext) {
		this._data.embed!.description += `\n${ctx.user.username} has declined the trade. canceling trade now.`;
		ctx.client.trades.delete(this._data.tradeId);
		this._data.message?.edit(this._data.embed!).then(async (msg) => await msg.delete({timeout: 10000}));
		
	}


	async makeTrade() {
		let draft = this._data.draft as IDraftTimer;
		let trader = draft.players.find(x => x.userId === this._data.players["trader"].id);
		let tradee = draft.players.find(x => x.userId === this._data.players["tradee"].id);

		trader!.pokemon[trader!.pokemon!.findIndex(x => x === this._data.offer["trader"])]! = this._data.offer["tradee"];
		tradee!.pokemon[tradee!.pokemon!.findIndex(x => x === this._data.offer["tradee"])]! = this._data.offer["trader"];

		this._data.message?.delete().then((msg) => {
			let embed = new MessageEmbed();

			embed.setTitle("Trade was successful");
			embed.setColor("GREEN");

			this._ctx.sendMessage(embed);
		})
	}

	async sendEmbed() {
		this._data.embed = new MessageEmbed();
		this._data.embed.setTitle("Trading in progress...");
		this._data.embed.setDescription(
			`A trade is happening between <@${this._data.players["trader"].id}> and <@${this._data.players["tradee"].id}>\n`+
			`Trading Id is ${this.data.tradeId}\n`+
			`To make a offer, do \`m!offer ${this.data.tradeId} <pokemon you are offering>\`.\n` +
			`To accept the trade, do \`m!accept ${this.data.tradeId}\`\n` + 
			`To decline the trade, do \`m!decline ${this.data.tradeId}\``
		);

		this._data.message = await(this._ctx.sendMessage(this._data.embed)) as Message;
	}

	public get data() { return this._data;}
}