import { readdirSync } from "fs";

import { client, logger } from "../..";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "reload",
	description: "Reloads commands",
	hidden: true,
	preconditions: [
		(ctx: CommandContext) => {
			if (ctx.userId !== "304446682081525772") return false;
			return true;
		},
	],

	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				`Please try again, but added the command you want to reload.`
			);
		const commandName = ctx.args[0].toLowerCase().trim();
		const command =
			client.cache.commands.get(commandName) ||
			client.cache.commands.find(
				(cmd) => cmd.aliases! && cmd.aliases!.includes(commandName)
			);
		if (!command)
			return ctx.sendMessage(
				`There is no command with name or alias \`${commandName}\``
			);
		const state = client.state;
		const commandFolders = readdirSync(
			`./${state === "Development" ? "src" : "dist"}/commands`
		);
		const folderName = commandFolders.find((folder) =>
			readdirSync(
				`./${state === "Development" ? "src" : "dist"}/commands/${folder}`
			).includes(`${command.name}${state === "Development" ? ".ts" : ".js"}`)
		);

		delete require.cache[
			require.resolve(
				`../${folderName}/${command.name}${
					state === "Development" ? ".ts" : ".js"
				}`
			)
		];

		try {
			import(
				`../${folderName}/${command.name}${
					state === "Development" ? ".ts" : ".js"
				}`
			).then(() => {
				ctx.sendMessage(`Reloaded ${command.name}`);
			});
		} catch (error) {
			logger.error(error);
			ctx.sendMessage(
				`There was an error while reloading command \`${command.name}\`:\n\`\`\`${error.message}\`\`\``
			);
		}
	},
});
