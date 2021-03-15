import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";
import { client } from "../..";

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
			{ channelId: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft maded. Please set one up, by using the `setdraft` command."
					);
				if (client.cache.drafts.has(record.prefix))
					return ctx.sendMessage("Please stop the draft before deleting");
				const draft = new DraftSystem(ctx);
				draft.destroy(record.prefix, record.channelId);
				client.cache.drafts.delete(record.prefix);
				ctx.sendMessage("Deleted Draft");
			}
		);
	},
});
