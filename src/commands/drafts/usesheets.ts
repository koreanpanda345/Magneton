import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";

createCommand({
	name: "usesheets",
	description: "Enables the automation for you draft docs.",
	usages: ["m!usesheets <sheet url>"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"Please setup the draft by using the `setdraft` command."
					);
				const url = ctx.args[0];
				let id = "";
				if (url.startsWith("https://docs.google.com/spreadsheets/d/"))
					id = url.split("/")[5];

				record.sheetId = id;

				record.save().catch((error) => console.error(error));

				ctx.sendMessage(
					`I will now update the draft doc, everytime I receive a pick.`
				);
			}
		);
	},
});
