import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";
import { client } from "../..";

createCommand({
	name: "startdraft",
	aliases: ["start"],
	description:
		"Starts the draft if one is made. use this in the channel that you set up the draft in.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		return await new Promise((resolve) => {
			DraftTimer.findOne(
				{ channelId: ctx.channelId },
				(error: CallbackError, record: IDraftTimer) => {
					if (!record)
						return ctx.sendMessage(
							"There is no draft maded. Please set one up, by using the `setdraft` command."
						);
					if (client.cache.drafts.has(record.prefix))
						return ctx.sendMessage("There is already a draft made.");
					const draft = new DraftSystem(ctx);

					draft.start(record);
					console.debug(record);
					client.cache.drafts.set(record.prefix, draft);
				}
			);
		});
	},
});
