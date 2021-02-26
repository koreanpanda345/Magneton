"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skip = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
class Skip {
    constructor() {
        this.name = "skip";
        this.description = "Skips the current player. Use in the draft channel.";
        this.usage = ["m!skip <@who>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.category = "draft";
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, async (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
                let draft = ctx.client.drafts.get(record.prefix);
                if (!draft)
                    return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
                if (!draft.isInDraft(record, record.currentPlayer))
                    return ctx.sendMessage("They are not in the draft.");
                if (!draft.isPlayersTurn(record, record.currentPlayer))
                    return ctx.sendMessage("It is not their turn yet.");
                let result = await draft.skip(record);
                if (!result)
                    return;
                await draft.askForPick(result);
            });
        };
    }
}
exports.Skip = Skip;
