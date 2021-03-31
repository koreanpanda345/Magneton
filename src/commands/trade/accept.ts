import { client } from "../../index";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "accept",
	aliases: ["confirm"],
	description:
		"Allows you to accept the trade. Both players must offer a pokemon in order to accept the trade.",
	usages: ["m!accept <trade id>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try this again, but provide the trade id."
			);
		const id = Number(ctx.args[0]);
		const trade = client.cache.trades.get(id);
		if (!trade)
			return ctx.sendMessage("There doesn't to be a trade with that id.");
		if (!trade.isPlayerInTrade(ctx.userId))
			return ctx.sendMessage("You are not in this trade.");
		await trade.accept(ctx.userId, ctx);
	},
});
