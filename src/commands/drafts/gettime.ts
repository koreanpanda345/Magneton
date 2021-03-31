import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "gettime",
	aliases: ["time"],
	description:
		"Gets the remaining time that a player has before they are skipped.",
	usages: ["m!gettime <league prefix>", ""],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args[0])
			return ctx.sendMessage(
				"Please try this command again, but add the league's prefix that you want to get the remaining time for."
			);
		const prefix = ctx.args[0].toLowerCase();
		DraftTimer.findOne(
			{ prefix },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There doesn't seem like there is a league with that prefix."
					);
				const draft = client.cache.drafts.get(prefix);
				if (!draft)
					return ctx.sendMessage(
						"There doesn't seem like there is a draft running with that prefix."
					);
				draft.getTimeRemaining(record, ctx);
			}
		);
	},
});
