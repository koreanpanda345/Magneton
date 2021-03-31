import { client } from "../../index";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "decline",
	description: "Allows you to decline the trade.",
	usages: ["m!decline <trade id>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try this again, but provide the trade id."
			);
		const id = Number(ctx.args[0]);
		const trade = client.cache.trades.get(id);
		if (!trade)
			return ctx.sendMessage("There doesn't seem to be a trade with that id.");
		if (!trade.isPlayerInTrade(ctx.userId))
			return ctx.sendMessage("You are not in this trade.");
		await trade.decline(ctx);
	},
});
