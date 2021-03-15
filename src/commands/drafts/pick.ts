import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { client } from "../..";

createCommand({
	name: "pick",
	description:
		"Allows you to pick a pokemon for your draft when it is your turn.",
	usages: ["m!pick <league prefix> <pokemon>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args[0])
			return ctx.sendMessage(
				"Please execute this command again, but add the league prefix, and the pokemon you want to draft."
			);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const prefix = ctx.args.shift()?.toLowerCase()!;
		let pokemon = ctx.args.join(" ");
		let text = "";

		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There is no draft made. Please tell your liasion that there is no draft made yet."
					);
				if (pokemon.includes("-text")) {
					text = pokemon.split("-text")[1].trim();
					pokemon = pokemon.split("-text")[0].trim();
				}
				const draft = client.cache.drafts.get(prefix);
				if (!draft)
					return ctx.sendMessage(
						"There is no draft running with that league prefix. Tell your Liaison to start the draft."
					);
				if (!draft.isInDraft(record, ctx.userId))
					return ctx.sendMessage(
						"You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person."
					);
				if (!draft.isPlayersTurn(record, ctx.userId))
					return ctx.sendMessage("It is not your turn yet. please wait");
				const result = (await draft.makePick(
					ctx,
					ctx.userId,
					prefix,
					pokemon,
					record.modes.text === true ? text : ""
				)) as IDraftTimer;
				if (!result) return;
				await draft.askForPick(result);
			}
		);
	},
});
