import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "ping",
	description: "Displays the bot's ping",
	invoke: async (ctx: CommandContext) => {
		ctx.sendMessage(`Pong`);
	},
});
