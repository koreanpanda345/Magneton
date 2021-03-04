"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeSystem = void 0;
const DraftTimerSchema_1 = __importDefault(require("../database/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
const dex_1 = require("@pkmn/dex");
class TradeSystem {
    constructor(_ctx) {
        this._ctx = _ctx;
        this._data = {
            tradeId: this.getId(),
            players: {},
            offer: {},
            accept: {}
        };
    }
    getId(increment = 1) {
        let id = this._ctx.client.trades.size + increment;
        if (this._ctx.client.trades.has(id))
            this.getId(increment++);
        else
            return id;
    }
    async getDraft(prefix) {
        return await new Promise((resolve) => {
            DraftTimerSchema_1.default.findOne({ prefix }, (error, record) => {
                if (!record)
                    return this._ctx.sendMessage("There is no draft under this prefix.");
                return resolve(record);
            });
        });
    }
    isInDraft(record, userId) {
        return record.players.find(x => x.userId === userId);
    }
    isInTrade(userId) {
        var _a, _b;
        return ((((_a = this._data.players.trader) === null || _a === void 0 ? void 0 : _a.id) === userId) || (((_b = this._data.players.tradee) === null || _b === void 0 ? void 0 : _b.id) === userId));
    }
    async getPlayer(draft, userId) {
        var _a;
        if (!this.isInDraft(draft, userId))
            return this._ctx.sendMessage("You are not in this draft.");
        let tradee = (_a = this._ctx.message.mentions.members) === null || _a === void 0 ? void 0 : _a.first();
        if (!this.isInDraft(draft, tradee === null || tradee === void 0 ? void 0 : tradee.id))
            return this._ctx.sendMessage("This player is not in the draft.");
        this._data.players.trader = this._ctx.member;
        this._data.players.tradee = tradee;
        this._data.draft = draft;
        this._ctx.client.trades.set(this._data.tradeId, this);
        await this.sendEmbed();
    }
    doesPlayerHavePokemon(record, userId, pokemon) {
        let player = record.players.find(x => x.userId === userId);
        return player === null || player === void 0 ? void 0 : player.pokemon.includes(pokemon);
    }
    async setOffer(draft, ctx, pokemon) {
        var _a, _b;
        if (!this.isInTrade(ctx.userId))
            return ctx.sendMessage("You are not in this draft.");
        let player = (this.data.players.trader === ctx.member) ? "trader" : "tradee";
        let _pokemon = dex_1.Dex.getSpecies(pokemon);
        if (!_pokemon.exists)
            return ctx.sendMessage("That is not a valid pokemon");
        if (!this.doesPlayerHavePokemon(draft, ctx.userId, _pokemon.name))
            return ctx.sendMessage("You didn't draft this pokemon.");
        this._data.offer[`${player}`] = _pokemon.name;
        (_a = this._data.embed) === null || _a === void 0 ? void 0 : _a.addField(`Player ${ctx.user.username} is offering`, `${_pokemon.name}`, true);
        (_b = this._data.message) === null || _b === void 0 ? void 0 : _b.edit(this._data.embed);
    }
    async confirm(ctx) {
        var _a;
        let player = (this._data.players.trader === ctx.member) ? "trader" : "tradee";
        this._data.accept[player] = true;
        this._data.embed.description += `\n${ctx.user.username} has accepted ✅`;
        (_a = this._data.message) === null || _a === void 0 ? void 0 : _a.edit(this._data.embed);
        if (this._data.accept["trader"] === true && this._data.accept["tradee"] === true) {
            await this.makeTrade();
        }
    }
    async decline(ctx) {
        var _a;
        this._data.embed.description += `\n${ctx.user.username} has declined the trade. canceling trade now.`;
        ctx.client.trades.delete(this._data.tradeId);
        (_a = this._data.message) === null || _a === void 0 ? void 0 : _a.edit(this._data.embed).then(async (msg) => await msg.delete({ timeout: 10000 }));
    }
    async makeTrade() {
        var _a;
        let draft = this._data.draft;
        let trader = draft.players.find(x => x.userId === this._data.players["trader"].id);
        let tradee = draft.players.find(x => x.userId === this._data.players["tradee"].id);
        trader.pokemon[trader.pokemon.findIndex(x => x === this._data.offer["trader"])] = this._data.offer["tradee"];
        tradee.pokemon[tradee.pokemon.findIndex(x => x === this._data.offer["tradee"])] = this._data.offer["trader"];
        (_a = this._data.message) === null || _a === void 0 ? void 0 : _a.delete().then((msg) => {
            let embed = new discord_js_1.MessageEmbed();
            embed.setTitle("Trade was successful");
            embed.setColor("GREEN");
            this._ctx.sendMessage(embed);
        });
    }
    async sendEmbed() {
        this._data.embed = new discord_js_1.MessageEmbed();
        this._data.embed.setTitle("Trading in progress...");
        this._data.embed.setDescription(`A trade is happening between <@${this._data.players["trader"].id}> and <@${this._data.players["tradee"].id}>\n` +
            `Trading Id is ${this.data.tradeId}\n` +
            `To make a offer, do \`m!offer ${this.data.tradeId} <pokemon you are offering>\`.\n` +
            `To accept the trade, do \`m!accept ${this.data.tradeId}\`\n` +
            `To decline the trade, do \`m!decline ${this.data.tradeId}\``);
        this._data.message = await (this._ctx.sendMessage(this._data.embed));
    }
    get data() { return this._data; }
}
exports.TradeSystem = TradeSystem;
