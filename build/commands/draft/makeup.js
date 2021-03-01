"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Makeup = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
class Makeup {
    constructor() {
        this.name = "makeup";
        this.description = "Allows you to make a pick up pick, if you were skipped.";
        this.usage = ["m!makeup <league prefix> <pokemon>"];
        this.category = "draft";
        this.invoke = async (ctx) => {
            var _a;
            if (!ctx.args[0])
                return ctx.sendMessage("Please execute the command again, but provided a league prefix.");
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
                await draft.makeupPick(ctx, ctx.userId, prefix, pokemon);
            });
        };
    }
}
exports.Makeup = Makeup;
