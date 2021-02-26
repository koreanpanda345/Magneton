import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { Dex } from '@pkmn/dex';
import { PermissionString } from 'discord.js';

export class Leftpick implements ICommand {
	name = "leftpick";
	description = "Allows you to pick for someone.";
	usage = ["m!leftpicks <@who> <league prefix> <pokemon>"];
	category = "draft";
	invoke = async(ctx: CommandContext) => {
		if(!ctx.args[0]) return ctx.sendMessage("Please execute this command again, but add the league prefix, and the pokemon you want to draft.");
		let player = ctx.message.mentions.users.first();
		if(!player) return ctx.sendMessage("Please mention the player that you are picking for.");
		ctx.args.shift();
		let prefix = ctx.args.shift()?.toLowerCase()!;
		let pokemon = ctx.args.join(" ");
		
		DraftTimer.findOne({prefix}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
			let draft = ctx.client.drafts.get(prefix);
			if(!draft) return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
			if(!draft.isInDraft(record, player?.id!)) return ctx.sendMessage("You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person.");
			if(!draft.isPlayersTurn(record, player?.id!)) return ctx.sendMessage("It is not your turn yet. please wait");
			let result = await draft.makePick(ctx, player?.id!, prefix, pokemon, "") as IDraftTimer;
			if(!result) return;
			await draft.askForPick(result);
		});
	}
}