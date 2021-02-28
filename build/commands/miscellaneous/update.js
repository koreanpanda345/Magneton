"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
const discord_js_1 = require("discord.js");
const UpdateSchema_1 = __importDefault(require("../../database/UpdateSchema"));
class Update {
    constructor() {
        this.name = "update";
        this.description = "Lists all of the updates, or information about a specific update";
        this.invoke = async (ctx) => {
            let embed = new discord_js_1.MessageEmbed();
            if (!ctx.args[0]) {
                embed.setTitle(`List of updates.`);
                embed.setDescription(`This list only contains the past 20 updates.`);
                embed.setColor("RANDOM");
                UpdateSchema_1.default.find({}, (error, records) => {
                    for (let record of records) {
                        embed.addField(`__ID: **${record.id}**__ - ${record.title}`, `Date: ${record.date}`, true);
                    }
                }).limit(20);
            }
            else {
                let id = Number(ctx.args[0]);
                UpdateSchema_1.default.findOne({ id }, (err, record) => {
                    if (!record)
                        return ctx.sendMessage(`There is no update with that id.`);
                    embed.setTitle(`${record.title}`);
                    embed.setDescription(`Date: ${record.date}\nType: ${record.type}\nDescription: ${record.description}`);
                    embed.setColor(record.type === "patch" ? "BLUE" : record.type === "error" ? "RED" : record.type === "downtime" ? "ORANGE" : record.type === "update" ? "GREEN" : "RANDOM");
                });
            }
            ctx.sendMessage(embed);
        };
    }
}
exports.Update = Update;
