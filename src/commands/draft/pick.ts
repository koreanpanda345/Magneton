import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { Dex } from '@pkmn/dex';

export class Pick implements ICommand {
	name = "pick";
	description = "Allows you to pick a pokemon for your draft when it is your turn.";
	category = "draft";
	usage = ["m!pick <league prefix> <pokemon>"]
	invoke = async(ctx: CommandContext) => {
		if(!ctx.args[0]) return ctx.sendMessage("Please execute this command again, but add the league prefix, and the pokemon you want to draft.");
		let prefix = ctx.args.shift()?.toLowerCase()!;
		let pokemon = ctx.args.join(" ");
		
		DraftTimer.findOne({prefix}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
			let draft = ctx.client.drafts.get(prefix);
			if(!draft) return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
			if(!draft.isInDraft(record, ctx.userId)) return ctx.sendMessage("You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person.");
			if(!draft.isPlayersTurn(record, ctx.userId)) return ctx.sendMessage("It is not your turn yet. please wait");
			let result = await draft.makePick(ctx, ctx.userId, prefix, pokemon, "") as IDraftTimer;
			if(!result) return;
			await draft.askForPick(result);
		});
	}
}