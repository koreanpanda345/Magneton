import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import Settings, { ISettings } from "../../database/SettingsSchema";
import { PermissionString, MessageEmbed } from 'discord.js';
import { CallbackError } from "mongoose";

export class Config implements ICommand {
	name = "config";
	category = "settings";
	description = "Allows you to configure Magneton";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async (ctx: CommandContext) => {
		Settings.findOne({serverId: ctx.guildId}, (error: CallbackError, record: ISettings) => {
			if(!record) return ctx.sendMessage(`ERROR: Please show this to koreanpanda345#2878 in the #bug-and-help channel of my support server.\nERROR: couldn't find record for ${ctx.guildId} config.`);
			let config = record;
			let embed = new MessageEmbed();
			if(!ctx.args[0]) {
				embed.setTitle(`Config for ${ctx.guild?.name}`);
				embed.setDescription(`These are the available config for this server.`);
				embed.addField("Prefix: ", config.prefix);

				embed.setColor("RANDOM");
			}
			else {
				switch(ctx.args[0]) {
					case "prefix":
						ctx.args.shift();
						if(!ctx.args[0]) return ctx.sendMessage("Please execute this command again, but provide the new prefix you want me to use.");
						let prefix = ctx.args.join(" ");
						let oldprefix = config.prefix;
						if(prefix.toLowerCase().startsWith("reset") || prefix.toLowerCase().startsWith("default")) {
							config.prefix = process.env.PREFIX as string;
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
		})
	}
}