import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { client } from "../../index";

createCommand({
	name: "offer",
	description: "Allows you to offer a pokemon to trade.",
	usages: ["m!trade <trade id> <pokemon>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try this again, but provided the trade id, and then the pokemon you are offering."
			);
		const id = Number(ctx.args.shift());
		const pokemon = ctx.args.join(" ");
		const trade = client.cache.trades.get(id);
		if (!trade)
			return ctx.sendMessage("It doesn't seem to be any trades with that id.");
		if (!trade.isPlayerInTrade(ctx.userId))
			return ctx.sendMessage("You are not in this trade.");
		await trade.offerPokemon(ctx.userId, pokemon, ctx);
	},
}).catch((error) => {
	console.error(error);
});
