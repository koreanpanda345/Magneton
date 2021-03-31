import { TeamStorageSystem } from "../../systems/TeamStorageSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "teams",
	aliases: ["team"],
	description: "Displays a list of all of your teams.",
	usages: ["m!teams"],
	invoke: async (ctx: CommandContext) => {
		await new TeamStorageSystem(ctx).getTeams();
	},
});
