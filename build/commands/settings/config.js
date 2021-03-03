"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const SettingsSchema_1 = __importDefault(require("../../database/SettingsSchema"));
const discord_js_1 = require("discord.js");
class Config {
    constructor() {
        this.name = "config";
        this.category = "settings";
        this.description = "Allows you to configure Magneton";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            SettingsSchema_1.default.findOne({ serverId: ctx.guildId }, (error, record) => {
                var _a;
                if (!record)
                    return ctx.sendMessage(`ERROR: Please show this to koreanpanda345#2878 in the #bug-and-help channel of my support server.\nERROR: couldn't find record for ${ctx.guildId} config.`);
                let config = record;
                let embed = new discord_js_1.MessageEmbed();
                if (!ctx.args[0]) {
                    embed.setTitle(`Config for ${(_a = ctx.guild) === null || _a === void 0 ? void 0 : _a.name}`);
                    embed.setDescription(`These are the available config for this server.`);
                    embed.addField("Prefix: ", config.prefix);
                    embed.setColor("RANDOM");
                }
                else {
                    switch (ctx.args[0]) {
                        case "prefix":
                            ctx.args.shift();
                            if (!ctx.args[0])
                                return ctx.sendMessage("Please execute this command again, but provide the new prefix you want me to use.");
                            let prefix = ctx.args.join(" ");
                            let oldprefix = config.prefix;
                            if (prefix.toLowerCase().startsWith("reset") || prefix.toLowerCase().startsWith("default")) {
                                config.prefix = process.env.PREFIX;
                                embed.setTitle("Prefix Resetted");
                                embed.setDescription(`Prefix has been resetted back to **${config.prefix}**`);
                                embed.setColor("RANDOM");
                                config.save().catch(error => console.error(error));
                            }
                            else {
                                config.prefix = prefix;
                                embed.setTitle("Prefix Changed");
                                embed.setDescription(`Prefix has been changed from **${oldprefix}** to **${config.prefix}**`);
                                embed.setColor("RANDOM");
                                config.save().catch(error => console.error(error));
                            }
                            break;
                        default:
                            return ctx.sendMessage("There is no config field called that.");
                    }
                }
                ctx.sendMessage(embed);
            });
        };
    }
}
exports.Config = Config;
