import { CallbackError } from "mongoose";

import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "usesheets",
	description: "Enables the automation for you draft docs.",
	usages: ["m!usesheets <sheet url>"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channel_id: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"Please setup the draft by using the `setdraft` command."
					);
				const url = ctx.args[0];
				let id = "";
				if (url.startsWith("https://docs.google.com/spreadsheets/d/"))
					id = url.split("/")[5];

				record.sheet_id = id;

				record.save().catch((error) => console.error(error));

				ctx.sendMessage(
					`I will now update the draft doc, everytime I receive a pick.`
				);
			}
		);
	},
});
