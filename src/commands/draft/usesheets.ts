import { ICommand } from "../../types/commands";
import { PermissionString } from "discord.js";
import { CommandContext } from "../../types/CommandContext";
import { CallbackError } from "mongoose";
import DraftTimer, { IDraftTimer } from "../../database/DraftTimerSchema";


export class Usesheets implements ICommand {
	name = "usesheets";
	description = "Enables the automation for you draft doc.";
	category = "draft";
	usage = ["m!usesheets <google sheet url>"];
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};
	invoke = async(ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
			let url = ctx.args[0];
			let id = "";
			if(url.startsWith("https://docs.google.com/spreadsheets/d/"))
				id = url.split("/")[5];
			
			record.sheetId = id;

			record.save().catch(error => console.error(error));

			ctx.sendMessage(`I will now update the draft doc, everytime I receive a pick.`);
		});
	};
}