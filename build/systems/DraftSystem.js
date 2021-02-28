"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftSystem = void 0;
const DraftTimerSchema_1 = __importDefault(require("../database/DraftTimerSchema"));
const dex_1 = require("@pkmn/dex");
const discord_js_1 = require("discord.js");
const moment_1 = __importDefault(require("moment"));
const GoogleSheets_1 = require("../modules/GoogleSheets");
const Timer = require("i-event-timer");
class DraftSystem {
    constructor(_ctx) {
        this._ctx = _ctx;
        this.timer = new Timer();
    }
    async start(record) {
        let ctx = this._ctx;
        ctx.sendMessage(`Draft Timer has been turned on!`);
        await this.askForPick(record);
    }
    isPlayersTurn(record, userId) {
        return userId === record.currentPlayer;
    }
    async makeupPick(ctx, userId, prefix, pokemon, text) {
        let record = await this.whichLeague(prefix);
        let player = this.getCurrentPlayer(record);
        if ((player === null || player === void 0 ? void 0 : player.skips) === 0)
            return ctx.sendMessage("You don't have any makeup picks.");
        if (!record)
            return ctx.sendMessage("There doesn't seem like there is a league with that prefix");
        if (!this.doesPokemonExist(pokemon))
            return ctx.sendMessage("That is not a valid pokemon.");
        if (this.isPokemonTaken(record, pokemon).taken === true) {
            let result = this.isPokemonTaken(record, pokemon);
            return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner)).username}`);
        }
        let name = dex_1.Dex.getSpecies(pokemon);
        let embed = new discord_js_1.MessageEmbed();
        embed.setTitle("Makeup Pick");
        embed.setDescription(`<@${ctx.userId}> has selected ${name.name} as their make up pick.`);
        let img = this.getImageForPokemon(name.name);
        embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`);
        embed.setColor("RANDOM");
        record.pokemon.push(name.name);
        player === null || player === void 0 ? void 0 : player.pokemon.push(name.name);
        player.skips--;
        record.save().catch(error => console.error(error));
        ctx.sendMessage(embed);
    }
    async askForPick(record) {
        return await new Promise(async (resolve) => {
            var _a;
            let who = (_a = this.getCurrentPlayer(record)) === null || _a === void 0 ? void 0 : _a.userId;
            (await this._ctx.client.users.fetch(who)).createDM().then(dm => {
                var _a;
                let player = record.players.find(x => x.userId === record.currentPlayer);
                let time = moment_1.default(player.skips === 0 ? record.timer : Math.floor(Math.round(record.timer / (2 * player.skips))));
                let pickEmbed = new discord_js_1.MessageEmbed()
                    .setTitle(`Its your pick in ${(_a = this._ctx.guild) === null || _a === void 0 ? void 0 : _a.name}`)
                    .setDescription(`Your league's prefix is ${record.prefix}. To draft a pokemon type in \`m!pick ${record.prefix} <pokemon name>\` example: \`m!pick ${record.prefix} lopunny\``)
                    .setColor("RANDOM")
                    .addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
                    .setFooter(`We are on pick ${player === null || player === void 0 ? void 0 : player.order} of round ${record.round} / ${record.maxRounds}`);
                dm.send(pickEmbed);
                let serverEmbed = new discord_js_1.MessageEmbed()
                    .setDescription(`<@${record.currentPlayer}> is on the Clock!\nWe are on pick ${player === null || player === void 0 ? void 0 : player.order} of round ${record.round} / ${record.maxRounds}`)
                    .addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
                    .setColor("RANDOM");
                this._ctx.sendMessage(serverEmbed);
                this.timer = new Timer(time.milliseconds(), [(time.milliseconds() / 2)]);
                this.timer.startTimer();
                this.timer.on("notify", (n) => {
                    dm.send(`You have ${moment_1.default(n).minutes()} minutes left before you get skipped.`);
                });
                this.timer.on("end", () => {
                    return this.skip(record);
                });
            });
        });
    }
    async editPick(ctx, userId, prefix, oldPokemon, newPokemon) {
        let record = await this.whichLeague(prefix);
        let player = record.players.find(x => x.userId === userId);
        if (!record)
            return ctx.sendMessage("There doesn't seem like there is a league with the prefix");
        if (!this.doesPokemonExist(newPokemon))
            return ctx.sendMessage("That is a not a valid pokemon");
        if (this.isPokemonTaken(record, newPokemon).taken === true) {
            let result = this.isPokemonTaken(record, newPokemon);
            return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner)).username}`);
        }
        let newName = dex_1.Dex.getSpecies(newPokemon);
        let oldName = dex_1.Dex.getSpecies(oldPokemon);
        let draftEmbed = new discord_js_1.MessageEmbed();
        record.pokemon[record.pokemon.findIndex(x => x === oldName.name)] = newName.name;
        player.pokemon[record.pokemon.findIndex(x => x === oldName.name)] = newName.name;
        draftEmbed.setDescription(`<@${record.currentPlayer}> has drafted **${newName.name}** instead of **${oldName.name}**`);
        let img = this.getImageForPokemon(newName.name);
        draftEmbed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`);
        draftEmbed.setColor("RANDOM");
        console.log(record.sheetId);
        this._ctx.sendMessage(draftEmbed);
        if (record.sheetId !== undefined && record.sheetId !== "none") {
            const gs = new GoogleSheets_1.GoogleSheets();
            await gs.update({ spreadsheetId: record.sheetId, data: [[
                        (await ctx.client.users.fetch(player.userId)).username,
                        oldName.name,
                        newName.name
                    ]] });
            console.log("Updated Sheets");
        }
        record.save().catch(error => console.error());
    }
    async makePick(ctx, userId, prefix, pokemon, text) {
        let record = await this.whichLeague(prefix);
        let player = this.getCurrentPlayer(record);
        if (!record)
            return ctx.sendMessage("There doesn't seem like there is a league with the prefix");
        if (!this.doesPokemonExist(pokemon))
            return ctx.sendMessage("That is a not a valid pokemon");
        if (this.isPokemonTaken(record, pokemon).taken === true) {
            let result = this.isPokemonTaken(record, pokemon);
            return ctx.sendMessage(`${result.pokemon} has already been drafted by ${(await ctx.client.users.fetch(result.owner)).username}`);
        }
        let name = dex_1.Dex.getSpecies(pokemon);
        record.pokemon.push(name.name);
        player === null || player === void 0 ? void 0 : player.pokemon.push(name.name);
        let draftEmbed = new discord_js_1.MessageEmbed();
        draftEmbed.setDescription(`<@${record.currentPlayer}> Has Drafted **${name.name}**${text !== "" ? `\n${text}` : ""}`);
        let img = this.getImageForPokemon(name.name);
        draftEmbed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img}.gif`);
        draftEmbed.setColor("RANDOM");
        console.log(record.sheetId);
        this._ctx.sendMessage(draftEmbed);
        this.timer.stopTimer();
        if (record.sheetId !== undefined && record.sheetId !== "none") {
            await this.sendToSheet(record.sheetId, [[(await this._ctx.client.users.fetch(userId)).username, name.name]]);
            console.log("Set to sheets");
        }
        return this.next(record);
    }
    isInDraft(record, userId) {
        return record.players.find(x => x.userId === userId);
    }
    async addPlayer(callback) {
        let record = await this.getDraftData();
        let result = callback(record);
        result.save().catch(error => console.error(error));
    }
    destroy(prefix, channelId) {
        DraftTimerSchema_1.default.deleteOne({ prefix, channelId }).catch(error => console.error(error));
    }
    async next(record) {
        var _a, _b;
        this.timer.resetTime();
        let player = record.players.find(x => x.userId === record.currentPlayer);
        if (record.direction === "down") {
            if ((player === null || player === void 0 ? void 0 : player.order) === record.players.length) {
                record.direction = "up";
                record.round++;
            }
            else
                record.currentPlayer = (_a = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) + 1)) === null || _a === void 0 ? void 0 : _a.userId;
        }
        else if (record.direction === "up") {
            if ((player === null || player === void 0 ? void 0 : player.order) === 1) {
                record.direction = "down";
                record.round++;
            }
            else
                record.currentPlayer = (_b = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) - 1)) === null || _b === void 0 ? void 0 : _b.userId;
        }
        if (record.round >= record.maxRounds) {
            let finishedEmbed = new discord_js_1.MessageEmbed();
            finishedEmbed.setTitle('Draft has concluded');
            finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
            finishedEmbed.setColor("RANDOM");
            for (let _player of record.players) {
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
    getImageForPokemon(pokemon) {
        return pokemon.startsWith("Tapu") ?
            pokemon.replace(" ", "").toLowerCase() :
            pokemon.toLowerCase();
    }
    async sendToSheet(spreadsheetId, data) {
        const gs = new GoogleSheets_1.GoogleSheets();
        await gs.add({ spreadsheetId, data });
    }
    async whichLeague(prefix) {
        return await new Promise((resolve) => {
            DraftTimerSchema_1.default.findOne({ prefix }, (error, record) => {
                if (!record)
                    return false;
                return resolve(record);
            });
        });
    }
    doesPokemonExist(pokemon) {
        return dex_1.Dex.getSpecies(pokemon).exists;
    }
    isPokemonTaken(record, pokemon) {
        let found = record.pokemon.find(x => x === pokemon.toLowerCase());
        if (found) {
            let owner = record.players.find(x => x.pokemon.includes(pokemon.toLowerCase()));
            return { taken: true, owner: owner === null || owner === void 0 ? void 0 : owner.userId, pokemon: pokemon };
        }
        return { taken: false };
    }
    getCurrentPlayer(record) {
        return record.players.find(x => x.userId === record.currentPlayer);
    }
    async stop(record) {
        this._ctx.sendMessage("Stopping Draft");
        this._ctx.client.drafts.delete(record.prefix);
    }
    async skip(record) {
        var _a, _b;
        let player = this.getCurrentPlayer(record);
        if (this.isWheelPick(record)) {
            record.direction = record.direction === "down" ? "up" : "down";
        }
        this._ctx.sendMessage(`Skipped ${(await this._ctx.client.users.fetch(record.currentPlayer)).username}`);
        player.skips++;
        if (record.direction === "down") {
            if ((player === null || player === void 0 ? void 0 : player.order) === record.players.length) {
                record.direction = "up";
                record.round++;
            }
            else
                record.currentPlayer = (_a = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) + 1)) === null || _a === void 0 ? void 0 : _a.userId;
        }
        else if (record.direction === "up") {
            if ((player === null || player === void 0 ? void 0 : player.order) === 1) {
                record.direction = "down";
                record.round++;
            }
            else
                record.currentPlayer = (_b = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) - 1)) === null || _b === void 0 ? void 0 : _b.userId;
        }
        record.save().catch(error => console.error(error));
        return record;
    }
    isWheelPick(record) {
        let player = record.players.find(x => x.userId === record.currentPlayer);
        return ((player === null || player === void 0 ? void 0 : player.order) >= record.players.length || (player === null || player === void 0 ? void 0 : player.order) <= 0);
    }
    async getDraftData() {
        return await new Promise((resolve) => {
            DraftTimerSchema_1.default.findOne({ channelId: this._ctx.channelId }, async (error, record) => {
                if (record === null)
                    return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
                return resolve(record);
            });
        });
    }
}
exports.DraftSystem = DraftSystem;
