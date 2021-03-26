import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { TeamStorageSystem } from "../../systems/TeamStorageSystem";

createCommand({
	name: "teams",
	aliases: ["team"],
	description: "Displays a list of all of your teams.",
	usages: ["m!teams"],
	invoke: async (ctx: CommandContext) => {
		await new TeamStorageSystem(ctx).getTeams();
	},
});
