import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "leftpicks",
	description: "Allows you to pick for someone, when it is their turn.",
	aliases: ["lp"],
	usages: [
		"m!leftpicks <league prefix> <@who> <pokemon>",
		"m!lp <league prefix> <@who> <pokemon>",
	],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args[0])
			return ctx.sendMessage(
				"Please execute this command again, but add the league prefix, and the pokemon you want to draft."
			);
		const player = ctx.message.mentions.users.first();
		if (!player)
			return ctx.sendMessage(
				"Please mention the player that you are picking for."
			);
		ctx.args.shift();

		const prefix = ctx.args.shift()!.toLowerCase();
		const pokemon = ctx.args.join(" ");

		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made. Please tell your liasion that there is no draft made yet."
					);
				const draft = client.cache.drafts.get(prefix);
				if (!draft)
					return ctx.sendMessage(
						"There is no draft running with that league prefix. Tell your Liaison to start the draft."
					);
				if (!draft.isInDraft(record, player!.id))
					return ctx.sendMessage(
						"You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person."
					);
				if (!draft.isPlayersTurn(record, player!.id))
					return ctx.sendMessage("It is not your turn yet. please wait");
				await draft.makePick(ctx, player!.id, prefix, pokemon, "");
			}
		);
	},
});
