import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { client } from "../..";

createCommand({
	name: "done",
	description: "If you are done drafting, then use this command.",
	usages: ["m!done <league prefix>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try again, but provide the league prefix."
			);
		const prefix = ctx.args[0];
		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage("There doesn't seem to be any draft.");
				const draft = client.cache.drafts.get(prefix);
				if (!draft) return ctx.sendMessage("The draft is not happening.");
				if (!draft.isInDraft(record, ctx.userId))
					return ctx.sendMessage("You are not in this draft.");

				const player = draft.getPlayer(record, ctx.userId);
				player!.done = true;
				record.save().catch((error) => console.error(error));
				ctx.sendMessage(
					"You not be able to draft anymore, till the end of the draft."
				);
				return await draft.askForPick(record);
			}
		);
	},
});
