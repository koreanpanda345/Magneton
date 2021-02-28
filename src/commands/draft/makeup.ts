import { CommandContext } from "../../types/CommandContext";
import { ICommand } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import {DraftSystem} from "../../systems/DraftSystem";
import { CallbackError } from "mongoose";

export class Makeup implements ICommand {
	name = "makeup";
	description = "Allows you to make a pick up pick, if you were skipped.";
	usage = ["m!makeup <league prefix> <pokemon>"];
	invoke = async (ctx: CommandContext) => {
		if(!ctx.args[0]) return ctx.sendMessage("Please execute the command again, but provided a league prefix.");
		let prefix = ctx.args.shift()?.toLowerCase()!;
		let pokemon = ctx.args.join(" ");
		
		DraftTimer.findOne({prefix}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
			let draft = ctx.client.drafts.get(prefix);
			if(!draft) return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
			if(!draft.isInDraft(record, ctx.userId)) return ctx.sendMessage("You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person.");
			if(!draft.isPlayersTurn(record, ctx.userId)) return ctx.sendMessage("It is not your turn yet. please wait");
			await draft.makeupPick(ctx, ctx.userId, prefix, pokemon);
		});
	};
}