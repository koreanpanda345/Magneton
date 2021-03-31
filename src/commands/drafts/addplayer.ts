import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { DraftSystem } from "../../systems/DraftSystem";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "addplayer",
	aliases: ["add"],
	description:
		"Adds a player to the draft. Use this in the channel that you set up the draft in.",
	usages: ["m!addplayer <@who>", "m!add <@who>"],
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channel_id: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft maded. Please set one up, by using the `setdraft` command."
					);
				const player = ctx.message.mentions.users.first();
				if (!player)
					return ctx.sendMessage(
						"Please mention the player that you are picking for."
					);
				if (client.cache.drafts.has(record.prefix))
					return ctx.sendMessage("Please stop the draft before deleting");
				const draft = new DraftSystem(ctx);
				await draft.addPlayer((data) => {
					data.players.push({
						user_id: player?.id as string,
						pokemon: [] as string[],
						order: data.players.length + 1,
						skips: 0,
						queue: [] as string[],
						done: false,
						username: player?.username,
						auto_skip: false,
					});

					return data;
				});

				ctx.sendMessage(`Added ${player.username} to the draft.`);
			}
		);
	},
});
