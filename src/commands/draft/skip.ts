import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { Dex } from '@pkmn/dex';
import { PermissionString } from 'discord.js';

export class Skip implements ICommand {
	name = "skip";
	description = "Skips the current player. Use in the draft channel.";
	usage = ["m!skip <@who>"];
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	category = "draft";
	invoke = async(ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
			let draft = ctx.client.drafts.get(record.prefix);
			if(!draft) return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
			if(!draft.isInDraft(record, record.currentPlayer)) return ctx.sendMessage("They are not in the draft.");
			if(!draft.isPlayersTurn(record, record.currentPlayer)) return ctx.sendMessage("It is not their turn yet.");
			let result = await draft.skip(record);
			if(!result) return;
			await draft.askForPick(result);
		});
	}
}