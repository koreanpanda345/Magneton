import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { DraftSystem } from "../../systems/DraftSystem";
import { TradeSystem } from "../../systems/TradeSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "trade",
	description: "Allows you to trade with another player.",
	usages: ["m!trade <league prefix> <@who>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try again, but provided the league prefix, followed by mentioning the player you want to trade with."
			);
		const prefix = ctx.args[0];
		const member = ctx.message.mentions.users.first();
		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage("There is no draft with that prefix.");
				const trade = new TradeSystem([ctx.userId, member!.id], prefix);

				client.cache.trades.set(trade.data.id, trade);

				await trade.start(ctx);
			}
		);
	},
});
