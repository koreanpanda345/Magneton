import { MessageEmbed } from "discord.js";

import { TeamStorageSystem } from "../../systems/TeamStorageSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "deleteteam",
	aliases: ["dt"],
	description: "Deletes a team from your pc.",
	usages: ["m!deleteteam <team id>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try again, but provide the team id, of the team that you want to delete."
			);
		const id = Number(ctx.args[0]);
		if (isNaN(id))
			return ctx.sendMessage("Please try again, but provide a valid team id.");
		const result = await new TeamStorageSystem(ctx).deleteTeam(id);
		if (!result.success) {
			const embed = new MessageEmbed();
			embed.setTitle("There was an error when trying to delete this team.");
			embed.setDescription(result.reason);
			embed.setColor("RED");
			return ctx.sendMessage(embed);
		}
		const embed = new MessageEmbed();
		embed.setTitle("Deleted Team");
		embed.setColor("GREEN");
		return ctx.sendMessage(embed);
	},
});
