import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";

createCommand({
	name: "mode",
	description:
		"Change modes for different options, to customize the draft to be ran how you want it to be.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: [
		"m!mode",
		"m!mode -dm <value>",
		"m!mode -skips <value>",
		"m!mode -text <value>",
	],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made yet. Use `setdraft` to set one up."
					);
				const embed = new MessageEmbed();
				if (!ctx.args.length) {
					embed.setTitle("Options for the draft.");
					embed.setDescription(
						"Here are the availible options that you can change.\n" +
							"If you would like to know what modes you can use, then do `m!mode -help`"
					);
					embed.setColor("RANDOM");
					embed.addField(
						`-dm: ${record.modes.dm}`,
						"Enables or Disables the option of having the bot dm the user when it is their turn. If diabled, then it will ping them in the server."
					);
					embed.addField(
						`-skips: ${record.modes.skips}`,
						"Enables auto skips, or disables it. If enable then, if the player exceeds the maximum amount of skips they can have, they will go on autoskip."
					);
					embed.addField(
						`-text: ${record.modes.text}`,
						"Enables the option for your players to add text to their picks which will display on the embed displaying their pick."
					);

					ctx.sendMessage(embed);
				} else {
					const options = ctx.args.join(" ").split("-");
					options.forEach((option) => {
						if (option.toLowerCase().startsWith("help")) {
							const str = option.split(" ");
							if (str[1].toLowerCase() === "dm") {
								embed.setTitle("Options for Dm");
								embed.addField("Enable", "yes, y, true, on");
								embed.addField("Disable", "no, n, false, off");
								embed.setColor("RANDOM");
								return ctx.sendMessage(embed);
							} else if (str[1].toLowerCase() === "skips") {
								embed.setTitle("Options for Skips");
								embed.addField("Enable", "yes, y, true, on");
								embed.addField("Disable", "no, n, false, off");
								embed.setColor("RANDOM");
								return ctx.sendMessage(embed);
							} else if (str[1].toLowerCase() === "text") {
								embed.setTitle("Options for Text");
								embed.addField("Enable", "yes, y, true, on");
								embed.addField("Disable", "no, n, false, off");
								embed.setColor("RANDOM");
								return ctx.sendMessage(embed);
							}
						}
						if (option.toLowerCase().startsWith("dm")) {
							const str = option.split(" ");
							if (["yes", "y", "true", "on"].includes(str[1]))
								record.modes.dm = true;
							else if (["no", "n", "false", "off"].includes(str[1]))
								record.modes.dm = false;
							else
								return ctx.sendMessage(
									"Please try again, but please tell me if you want it on or off."
								);
							ctx.sendMessage(
								`${record.modes.dm === true ? "Enabling" : "Disable"} dms`
							);
							record.save().catch((error) => console.error(error));
						}
						if (option.toLowerCase().startsWith("text")) {
							const str = option.split(" ");
							if (["yes", "y", "true", "on"].includes(str[1]))
								record.modes.dm = true;
							else if (["no", "n", "false", "off"].includes(str[1]))
								record.modes.dm = false;
							else
								return ctx.sendMessage(
									"Please try again, but please tell me if you want it on or off."
								);
							ctx.sendMessage(
								`${record.modes.dm === true ? "Enabling" : "Disable"} text`
							);
							record.save().catch((error) => console.error(error));
						}
					});
				}
			}
		);
	},
});
