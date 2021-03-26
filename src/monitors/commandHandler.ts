import { Message, MessageEmbed, PermissionString } from "discord.js";
import { client, logger } from "..";
import { CommandContext, Command } from "../types/commands";
import { createMonitors } from "../utils/helpers";

export function parsePrefix(guildId: string | undefined): string {
	const prefix = process.env.PREFIX as string;
	return guildId !== undefined ? prefix : (process.env.PREFIX as string);
}

export function parseCommand(message: Message, args: string[]) {
	const commandName = args.shift()?.toLowerCase();
	const command =
		client.cache.commands.get(commandName!) ||
		client.cache.commands.find(
			(cmd) => (cmd.aliases && cmd.aliases.includes(commandName!)) || false
		);
	if (!command) return false;
	let run = true;
	if (message.channel.type !== "dm") {
		command.permissions?.user?.forEach((permission: PermissionString) => {
			if (!message.member?.hasPermission(permission)) {
				run = false;
				return message.reply(
					`You don't have permission to use this command. You must have the permission of ${permission}`
				);
			}
			run = true;
		});
	}

	if (!run) return false;

	if (message.channel.type !== "dm") {
		command.permissions?.self?.forEach((permission: PermissionString) => {
			if (!message.guild?.me?.hasPermission(permission)) {
				run = false;
				return message.reply(
					`I don't have permission to do this. I must have the permission of ${permission}`
				);
			}
			run = true;
		});
	}

	if (!run) return false;
	const ctx = new CommandContext(message, args);
	command.preconditions?.forEach((condition) => {
		const result = condition(ctx);
		if (typeof result === "boolean" && result === false) {
			run = false;
			return message.reply("You can not perform this action");
		}

		run = true;
	});

	if (!run) return false;

	return command;
}

async function executeCommand(
	message: Message,
	args: string[],
	command: Command
) {
	const ctx = new CommandContext(message, args);
	try {
		await command.invoke(ctx);
	} catch (error) {
		logger.error(error);
	}
}

createMonitors({
	name: "commandHandler",
	invoke: async (message: Message) => {
		if (message.author.bot) return;

		const prefix = parsePrefix(message.guild?.id);
		if (!message.content.toLowerCase().trim().startsWith(prefix)) return;
		const args = message.content.slice(prefix.length).split(/ +/g);
		const command = parseCommand(message, args);
		if (!command) return;
		try {
			await executeCommand(message, args, command);
		} catch (error) {
			const embed = new MessageEmbed();
			embed.setTitle("There was an error when executing that command.");
			embed.setDescription(error);
			embed.setColor("RED");

			message.channel.send(embed);
		}
	},
});
