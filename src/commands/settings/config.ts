import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import SettingsSchema, { ISettings } from "../../databases/SettingsSchema";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";

createCommand({
	name: "config",
	aliases: ["settings"],
	description: "Allows you to configure the bot for the server.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		SettingsSchema.findOne(
			{ serverId: ctx.guildId },
			(error: CallbackError, record: ISettings) => {
				if (!record)
					return ctx.sendMessage(
						`ERROR: Please show this to koreanpanda345#2878 in the #bug-and-help channel of my support server.\nERROR: couldn't find record for ${ctx.guildId} config.`
					);
				const config = record;
				const embed = new MessageEmbed();
				if (!ctx.args[0]) {
					embed.setTitle(`Config for ${ctx.guild?.name}`);
					embed.setDescription(
						`These are the available config for this server.`
					);
					embed.addField("Prefix: ", config.prefix);

					embed.setColor("RANDOM");
				} else {
					switch (ctx.args[0]) {
						case "prefix":
							ctx.args.shift();
							if (!ctx.args[0])
								return ctx.sendMessage(
									"Please execute this command again, but provide the new prefix you want me to use."
								);
							// eslint-disable-next-line no-case-declarations
							const prefix = ctx.args.join(" ");
							// eslint-disable-next-line no-case-declarations
							const oldprefix = config.prefix;
							if (
								prefix.toLowerCase().startsWith("reset") ||
								prefix.toLowerCase().startsWith("default")
							) {
								config.prefix = process.env.PREFIX as string;
								embed.setTitle("Prefix Resetted");
								embed.setDescription(
									`Prefix has been resetted back to **${config.prefix}**`
								);
								embed.setColor("RANDOM");
								config.save().catch((error) => console.error(error));
							} else {
								config.prefix = prefix;
								embed.setTitle("Prefix Changed");
								embed.setDescription(
									`Prefix has been changed from **${oldprefix}** to **${config.prefix}**`
								);
								embed.setColor("RANDOM");
								config.save().catch((error) => console.error(error));
							}
							break;
						default:
							return ctx.sendMessage("There is no config field called that.");
					}
				}

				ctx.sendMessage(embed);
			}
		);
	},
});
