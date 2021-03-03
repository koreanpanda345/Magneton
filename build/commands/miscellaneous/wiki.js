"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wiki = void 0;
const discord_js_1 = require("discord.js");
class Wiki {
    constructor() {
        this.name = "wiki";
        this.description = "Gives you the wiki link";
        this.category = "miscellaneous";
        this.invoke = async (ctx) => {
            var _a, _b;
            let embed = new discord_js_1.MessageEmbed();
            embed.setTitle("Wiki");
            embed.setImage(((_a = ctx.client.user) === null || _a === void 0 ? void 0 : _a.avatarURL()) || ((_b = ctx.client.user) === null || _b === void 0 ? void 0 : _b.defaultAvatarURL));
            embed.setURL("https://koreanpanda345.gitbook.io/magneton/");
            embed.setColor("RANDOM");
            ctx.sendMessage(embed);
        };
    }
}
exports.Wiki = Wiki;
