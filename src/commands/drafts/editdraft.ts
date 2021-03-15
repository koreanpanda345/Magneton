import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";

createCommand({
	name: "editdraft",
	aliases: ["edit"],
	description: "Edits the draft.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!editdraft <field> <value>", "m!edit <field> <value>"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is not draft made yet. Please use the `setdraft` command to set one up."
					);
				if (!ctx.args.length)
					return ctx.sendMessage(
						"Please provided the field that you want to edit."
					);
				const field = ctx.args.shift()?.toLowerCase();

				switch (field) {
					case "timer":
						// eslint-disable-next-line no-case-declarations
						const time = ctx.args.join(" ");
						if (time.includes("m"))
							record.timer = Number.parseInt(time.split("m")[0]) * 60000;
						else if (time.includes("h"))
							record.timer = Number.parseInt(time.split("h")[0]) * 3600000;
						else if (!time.includes("m") || time.includes("h")) {
							ctx.sendMessage(
								"That is not a valid time. Please use m for minutes, and h for hours."
							);
						}
						record.save().catch((error) => console.error(error));
						break;
				}
			}
		);
	},
});
