import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { DraftSystem } from "../../systems/DraftSystem";

createCommand({
	name: "removeplayer",
	aliases: ["remove"],
	description: "Removes a player from the draft.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!removeplayer <@who>", "m!remove <@who>"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			(error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"Please setup the draft by using the `setdraft` command."
					);
				const list: string[] = [];
				ctx.message.mentions.users.forEach((user) => {
					if (!record.players.find((x) => x.userId === user.id))
						ctx.sendMessage(`Player ${user.username} is not in the draft.`);
					else {
						record.players.splice(
							record.players.findIndex((x) => x.userId === user.id),
							1
						);
						list.push(user.username);
					}
				});

				record.save().catch((error) => console.error());
				return ctx.sendMessage(`Removed these players:\n${list.join("\n")}`);
			}
		);
	},
});
