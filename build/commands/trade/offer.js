"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
class Offer {
    constructor() {
        this.name = "offer";
        this.description = "Allows you to offer a pokemon during a trade.";
        this.category = "trade";
        this.invoke = async (ctx) => {
            if (!ctx.args[0] || isNaN(Number(ctx.args[0])))
                return ctx.sendMessage("Please execute this command again, but provide a valid trade id.");
            let id = Number(ctx.args.shift());
            if (!ctx.client.trades.has(id))
                return ctx.sendMessage("There doesn't seem to be a trade with that id.");
            let trade = ctx.client.trades.get(id);
            let draft = trade === null || trade === void 0 ? void 0 : trade.data.draft;
            let player = await (trade === null || trade === void 0 ? void 0 : trade.isInDraft(draft, ctx.userId));
            if (!player)
                return ctx.sendMessage("You are not in the draft.");
            if (!await (trade === null || trade === void 0 ? void 0 : trade.isInTrade(ctx.userId)))
                return ctx.sendMessage("You are not in this trade.");
            trade === null || trade === void 0 ? void 0 : trade.setOffer(draft, ctx, ctx.args.join(" "));
        };
    }
}
exports.Offer = Offer;