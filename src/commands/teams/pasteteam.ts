import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { TeamStorageSystem } from "../../systems/TeamStorageSystem";

createCommand({
	name: "pasteteam",
	aliases: ["paste"],
	description:
		"Pastes your team to pokepaste and gives you the url to that paste.",
	usages: ["m!pasteteam <team id>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try again, but provide the team id, of the team that you want to paste to pokepaste."
			);
		const id = Number(ctx.args[0]);
		if (isNaN(id))
			return ctx.sendMessage("Please try again, but provide a valid team id.");
		await new TeamStorageSystem(ctx).pasteTeam(id);
	},
});
