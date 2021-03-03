"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Support = void 0;
const discord_js_1 = require("discord.js");
class Support {
    constructor() {
        this.name = "support";
        this.aliases = ["server"];
        this.description = "Gives you the server link to the support server.";
        this.category = "miscellaneous";
        this.invoke = async (ctx) => {
            var _a, _b;
            let embed = new discord_js_1.MessageEmbed();
            embed.setTitle("Support Server");
            embed.setImage(((_a = ctx.client.user) === null || _a === void 0 ? void 0 : _a.avatarURL()) || ((_b = ctx.client.user) === null || _b === void 0 ? void 0 : _b.defaultAvatarURL));
            embed.setURL("https://discord.gg/EPjF2JbhkZ");
            embed.setColor("RANDOM");
            ctx.sendMessage(embed);
        };
    }
}
exports.Support = Support;
