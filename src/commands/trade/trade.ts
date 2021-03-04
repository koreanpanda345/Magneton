import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import DraftTimerSchema, { IDraftTimer } from "../../database/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { TradeSystem } from "../../systems/TradeSystem";


export class Trade implements ICommand {
	name = "trade";
	category = "trade";
	description = "Allows you to make a trade with another player that is in the same draft as you.";

	invoke = async (ctx: CommandContext) => {
		if(!ctx.args[0]) return ctx.sendMessage("Please execute the command again, but provide the league's prefix");
		let prefix = ctx.args.shift()?.toLowerCase();
		DraftTimerSchema.findOne({prefix}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There is no draft with that prefix.");
			const trade = new TradeSystem(ctx);

			trade.getPlayer(record, ctx.userId);
			
		});
	}
}