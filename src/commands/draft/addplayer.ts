import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { CallbackError } from "mongoose";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";
import { DraftSystem } from "../../systems/DraftSystem";
import { PermissionString } from 'discord.js';


export class Addplayer implements ICommand {
	name = "addplayer";
	category = "draft";
	description = "Adds a player to the draft.";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async (ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
			let player = ctx.message.mentions.users.first();
			if(!player) return ctx.sendMessage("Please mention the player that you are picking for.");
			if(ctx.client.drafts.has(record.prefix)) return ctx.sendMessage("Please stop the draft before deleting");
			const draft = new DraftSystem(ctx);
			await draft.addPlayer((data) => {
				data.players.push({
					userId: player?.id as string,
					pokemon: [] as string[],
					order: data.players.length + 1,
					leavePicks: "none",
					skips: 0,
					queue: [] as string[]
				});

				return data;
			});

			ctx.sendMessage(`Added ${player.username} to the draft.`);
		});
	}
}