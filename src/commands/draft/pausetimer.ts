import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { PermissionString } from 'discord.js';


export class Pausetimer implements ICommand {
	name = "pausetimer";
	description = "Pauses the timer. You can resume the timer with the `resumetimer` command.";
	category = "draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async(ctx: CommandContext) => {

	}
}