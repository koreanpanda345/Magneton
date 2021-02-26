import { ICommand } from "../../types/commands";
import { CommandContext } from './../../types/CommandContext';
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";
import { PermissionString } from "discord.js";

export class Deletedraft implements ICommand {
	name = "deletedraft";
	description = "Deletes the draft.";
	category = "draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async (ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
			if(ctx.client.drafts.has(record.prefix)) return ctx.sendMessage("Please stop the draft before deleting");
			const draft = new DraftSystem(ctx);
			draft.destroy(record.prefix, record.channelId);
			ctx.client.drafts.delete(record.prefix);
			ctx.sendMessage("Deleted Draft");
		});
	}
}