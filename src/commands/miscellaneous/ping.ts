import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";

createCommand({
	name: "ping",
	description: "Displays the bot's ping",
	invoke: async (ctx: CommandContext) => {
		ctx.sendMessage(`Pong`);
	},
});
