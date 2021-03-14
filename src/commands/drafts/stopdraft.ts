import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";
import { client } from "../..";

createCommand({
	name: "stopdraft",
	aliases: ["stop"],
	description:
		"Stops the current draft. Use this in the channel that you set up the draft in.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft maded. Please set one up, by using the `setdraft` command."
					);
				if (!client.cache.drafts.has(record.prefix))
					return ctx.sendMessage("That draft isn't running currently.");
				const draft = new DraftSystem(ctx);

				await draft.stop(record);
				ctx.sendMessage(
					"Stopped draft. you can pick off where you last left off."
				);
			}
		);
	},
});
