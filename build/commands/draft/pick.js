"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pick = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
class Pick {
    constructor() {
        this.name = "pick";
        this.description = "Allows you to pick a pokemon for your draft when it is your turn.";
        this.category = "draft";
        this.usage = ["m!pick <league prefix> <pokemon>"];
        this.invoke = async (ctx) => {
            var _a;
            if (!ctx.args[0])
                return ctx.sendMessage("Please execute this command again, but add the league prefix, and the pokemon you want to draft.");
            let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let pokemon = ctx.args.join(" ");
            DraftTimerSchema_1.default.findOne({ prefix }, async (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
                let draft = ctx.client.drafts.get(prefix);
                if (!draft)
                    return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
                if (!draft.isInDraft(record, ctx.userId))
                    return ctx.sendMessage("You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person.");
                if (!draft.isPlayersTurn(record, ctx.userId))
                    return ctx.sendMessage("It is not your turn yet. please wait");
                let result = await draft.makePick(ctx, ctx.userId, prefix, pokemon, "");
                if (!result)
                    return;
                await draft.askForPick(result);
            });
        };
    }
}
exports.Pick = Pick;
