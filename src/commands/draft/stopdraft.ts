import { ICommand } from "../../types/commands";
import { CommandContext } from './../../types/CommandContext';
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";
import { PermissionString } from 'discord.js';

export class Stopdraft implements ICommand {
	name = "stopdraft";
	category = "draft";
	description = "Stops the draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};
	invoke = async (ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
			if(!ctx.client.drafts.has(record.prefix)) return ctx.sendMessage("That draft isn't running currently.");
			const draft = new DraftSystem(ctx);
			
			await draft.stop(record);
			ctx.sendMessage("Stopped draft. you can pick off where you last left off.");
		});
	}
}