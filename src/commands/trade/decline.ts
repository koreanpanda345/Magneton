import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { IDraftTimer } from "../../database/DraftTimerSchema";


export class Decline implements ICommand {
	name = "decline";
	description = "allows you to declien the trade.";
	category = "trade";

	invoke = async (ctx: CommandContext) => {
		if(!ctx.args[0] || isNaN(Number(ctx.args[0]))) return ctx.sendMessage("Please execute this command again, but provide a valid trade id.");
		let id = Number(ctx.args.shift());
		if(!ctx.client.trades.has(id)) return ctx.sendMessage("There doesn't seem to be a trade with that id.");
		let trade = ctx.client.trades.get(id);
		let draft = trade?.data.draft as IDraftTimer;

		let player = await trade?.isInDraft(draft, ctx.userId);
		if(!player) return ctx.sendMessage("You are not in the draft.");
		if(!await trade?.isInTrade(ctx.userId)) return ctx.sendMessage("You are not in this trade.");

		trade?.decline(ctx);
	}
}