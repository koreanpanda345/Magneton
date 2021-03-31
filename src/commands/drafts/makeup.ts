import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "makeup",
	description: "Allows you to make up a pick, if you were skipped.",
	aliases: ["mu"],
	usages: [
		"m!makeup <league prefix> <pokemon>",
		"m!mu <league prefix> <pokemon>",
	],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args[0])
			return ctx.sendMessage(
				"Please execute this command again, but provided a league prefix, and the pokemon you want to take."
			);
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const prefix = ctx.args.shift()?.toLowerCase()!;
		const pokemon = ctx.args.join(" ");

		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made. Please tell your liaison that there is no draft made yet."
					);
				const draft = client.cache.drafts.get(prefix);
				if (!draft)
					return ctx.sendMessage(
						"The draft is happening currently. Tell your liaison to start the draft."
					);
				if (!draft.isInDraft(record, ctx.userId))
					return ctx.sendMessage(
						"You are not in the draft. If you are picking for someone, then use `leftpicks` command."
					);
				const player = draft.getPlayer(record, ctx.userId);
				if (player?.skips === 0)
					return ctx.sendMessage("You don't have any make up picks.");
				await draft.makeupPick(ctx, ctx.userId, record.prefix, pokemon);
			}
		);
	},
});
