import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "skip",
	description:
		"Skips the current player in the draft. Use in the draft channel.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!skip"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channel_id: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made. Please tell your liasion that there is no draft made yet."
					);
				const draft = client.cache.drafts.get(record.prefix);
				if (!draft)
					return ctx.sendMessage(
						"There is no draft running with that league prefix. Tell your Liaison to start the draft."
					);
				if (!draft.isInDraft(record, record.current_player))
					return ctx.sendMessage("They are not in the draft.");
				if (!draft.isPlayersTurn(record, record.current_player))
					return ctx.sendMessage("It is not their turn yet.");
				const result = await draft.skip(record);
				if (!result) return;
				await draft.askForPick(result);
			}
		);
	},
});
