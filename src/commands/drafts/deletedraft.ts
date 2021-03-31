import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { DraftSystem } from "../../systems/DraftSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "deletedraft",
	aliases: ["delete"],
	description:
		"Deletes the current draft. Use this command in the draft channel.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channel_id: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft maded. Please set one up, by using the `setdraft` command."
					);
				if (client.cache.drafts.has(record.prefix))
					return ctx.sendMessage("Please stop the draft before deleting");
				const draft = new DraftSystem(ctx);
				draft.destroy(record.prefix, record.channel_id);
				client.cache.drafts.delete(record.prefix);
				ctx.sendMessage("Deleted Draft");
			}
		);
	},
});
