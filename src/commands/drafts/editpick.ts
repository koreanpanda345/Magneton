import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { client } from "../..";
import { Dex } from "@pkmn/dex";

createCommand({
	name: "editpick",
	description: "Edits a players pick.",
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	usages: ["m!editpick <@who> <old pokemon>, <new pokemon>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try this command again, but provide the player, player's pick to be changed, and the new pokemon."
			);
		const member = ctx.message.mentions.users.first();
		ctx.args.shift();

		const oldPokemon = ctx.args.join(" ").split(",")[0];
		const newPokemon = ctx.args.join(" ").split(",")[1];

		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made yet. Please use the `setdraft` command, to set one up."
					);
				const draft = client.cache.drafts.get(record.prefix);
				if (!draft)
					return ctx.sendMessage(
						"The draft is not happening currently. Please use the `startdraft` command to start it."
					);
				await draft.editPick(
					ctx,
					member!.id,
					record.prefix,
					oldPokemon,
					newPokemon
				);
			}
		);
	},
});
