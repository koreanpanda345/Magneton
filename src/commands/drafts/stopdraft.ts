import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { DraftSystem } from "../../systems/DraftSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "stopdraft",
	aliases: ["stop"],
	description:
		"Stops the current draft. Use this in the channel that you set up the draft in.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!stopdraft", "m!stop"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channel_id: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft maded. Please set one up, by using the `setdraft` command."
					);
				if (!client.cache.drafts.has(record.prefix))
					return ctx.sendMessage("That draft isn't running currently.");
				const draft = new DraftSystem(ctx);

				await draft.stop(record);
				client.user?.setActivity(
					`In ${client.guilds.cache.size} Servers | Currently Running ${client.cache.drafts.size} Drafts`
				);
				ctx.sendMessage(
					"Stopped draft. you can pick off where you last left off."
				);
			}
		);
	},
});
