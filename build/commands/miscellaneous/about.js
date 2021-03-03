"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.About = void 0;
const discord_js_1 = require("discord.js");
const typeColors_1 = require("../../utils/typeColors");
const discord_js_2 = __importDefault(require("discord.js"));
class About {
    constructor() {
        this.name = "about";
        this.aliases = ["info", "botinfo", "bot"];
        this.description = "Gives you information about me.";
        this.category = "miscellaneous";
        this.invoke = async (ctx) => {
            var _a, _b, _c;
            let embed = new discord_js_1.MessageEmbed();
            embed.setAuthor((_a = ctx.client.user) === null || _a === void 0 ? void 0 : _a.username, (_b = ctx.client.user) === null || _b === void 0 ? void 0 : _b.avatarURL());
            embed.setThumbnail((_c = ctx.client.user) === null || _c === void 0 ? void 0 : _c.avatarURL());
            embed.setColor(typeColors_1.TypeColors["electric"][1]);
            embed.setDescription("Magneton is more than just a pokemon. Its a discord bot!!!");
            embed.addField("Libraries", `Discord.js Version: ${discord_js_2.default.version}\nNode: ${process.version}\n`);
            embed.addField("Developer", `${await (await (ctx.client.users.fetch("304446682081525772"))).username}`);
            ctx.sendMessage(embed).then(async (msg) => {
                embed.addField("Base Stats", `HP: 1000000\nATK: 0\nDEF: 0\nSPA: 100000\nSPD: 1000000\nSPE: ${msg.createdTimestamp - Date.now()}`);
                msg.edit(embed);
            });
        };
    }
}
exports.About = About;
