import { MessageEmbed } from "discord.js";

import { client } from "../..";
import { parsePrefix } from "../../monitors/commandHandler";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "help",
	description:
		"Displays a list of commands, or information about a specific command.",
	aliases: ["command", "commnads"],

	invoke: async (ctx: CommandContext) => {
		const prefix = parsePrefix(ctx.guildId);
		const embed = new MessageEmbed();
		embed.setColor("RANDOM");
		if (!ctx.args[0]) {
			embed.setTitle("List of commands");
			embed.setDescription(
				`Prefix: ${prefix}\nTotal Commands: ${client.cache.commands.size}`
			);
			client.cache.commands.forEach((cmd) => {
				if (!cmd.hidden)
					embed.addField(
						`-${cmd.name}`,
						cmd.description || "No description was provided"
					);
			});
		} else {
			const search = ctx.args[0].toLowerCase();
			const command =
				client.cache.commands.get(search) ||
				client.cache.commands.find(
					(cmd) => cmd.aliases! && cmd.aliases!.includes(search)
				);
			if (!command) {
				embed.setColor("RED");
				embed.setTitle("Couldn't find command.");
				embed.setDescription(
					`I couldn't find a command called \`${search}\` Please make sure you spelt it correctly.`
				);

				return ctx.sendMessage(embed);
			}

			embed.setTitle(`Information on ${command.name}`);
			embed.setDescription(
				`${command.aliases ? `Aliases: ${command.aliases.join(",")}\n` : ""}` +
					`Description: ${
						command.description || "No Description was provided."
					}\nUsages:\n${
						command.usages?.join("\n") || "No Usages were provided"
					}`
			);
		}
		ctx.sendMessage(embed);
	},
});
