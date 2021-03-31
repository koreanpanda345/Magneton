import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { DraftSystem } from "../../systems/DraftSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "startdraft",
	aliases: ["start"],
	description:
		"Starts the draft if one is made. use this in the channel that you set up the draft in.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!startdraft", "m!start"],
	invoke: async (ctx: CommandContext) => {
		return await new Promise((resolve) => {
			DraftTimer.findOne(
				{ channel_id: ctx.channelId },
				async (error: CallbackError, record: IDraftTimer) => {
					if (!record) {
						return client.cache.commands
							?.get("setdraft")
							?.invoke(ctx, { from: "startdraft" });
					}
					if (client.cache.drafts.has(record.prefix))
						return ctx.sendMessage("There is already a draft made.");
					const draft = new DraftSystem(ctx);

					draft.start(record);
					console.debug(record);
					client.cache.drafts.set(record.prefix, draft);
					client.user?.setActivity(
						`In ${client.guilds.cache.size} Servers | Currently Running ${client.cache.drafts.size} Drafts`
					);
				}
			);
		});
	},
});
