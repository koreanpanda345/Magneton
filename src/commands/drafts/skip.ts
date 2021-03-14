import { createCommand } from "../../utils/helpers";
import { client } from "../..";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";

createCommand({
	name: "skip",
	description:
		"Skips the current player in the draft. Use in the draft channel.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
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
				if (!draft.isInDraft(record, record.currentPlayer))
					return ctx.sendMessage("They are not in the draft.");
				if (!draft.isPlayersTurn(record, record.currentPlayer))
					return ctx.sendMessage("It is not their turn yet.");
				const result = await draft.skip(record);
				if (!result) return;
				await draft.askForPick(result);
			}
		);
	},
});
