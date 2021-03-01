import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";

export class Gettime implements ICommand {
	name = "gettime";
	description = "Gets the time remaining for the player in the draft.";
	category = "draft";
	invoke = async(ctx: CommandContext) => {
		if(!ctx.args[0]) return ctx.sendMessage("Please try this command again, but add the league's prefix that you want to get the remaining time for.");
		let prefix = ctx.args[0].toLowerCase();
		DraftTimer.findOne({prefix}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
			const draft = ctx.client.drafts.get(prefix);
			if(!draft) return ctx.sendMessage("There doesn't seem like there is a draft running with that prefix.");
			draft.getTimeRemaining(record, ctx);
		});
	}
}