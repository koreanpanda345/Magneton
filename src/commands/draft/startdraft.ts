
import { PermissionString } from 'discord.js';
import { ICommand } from '../../types/commands';
import { CommandContext } from '../../types/CommandContext';
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from 'mongoose';
import { DraftSystem } from '../../systems/DraftSystem';
export class Startdraft implements ICommand {
	name = "startdraft";
	permissions: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};

	invoke = async (ctx: CommandContext) => {
		return await new Promise((resolve) => {
			DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
				if(!record) return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
				if(ctx.client.drafts.has(record.prefix)) return ctx.sendMessage("There is already a draft made.");
				const draft = new DraftSystem(ctx);

				draft.start(record);
				ctx.client.drafts.set(record.prefix, draft);
				ctx.sendMessage("Starting Draft");
			});
		})
	}
}