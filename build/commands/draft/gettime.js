"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gettime = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
class Gettime {
    constructor() {
        this.name = "gettime";
        this.description = "Gets the time remaining for the player in the draft.";
        this.category = "draft";
        this.invoke = async (ctx) => {
            if (!ctx.args[0])
                return ctx.sendMessage("Please try this command again, but add the league's prefix that you want to get the remaining time for.");
            let prefix = ctx.args[0].toLowerCase();
            DraftTimerSchema_1.default.findOne({ prefix }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
                const draft = ctx.client.drafts.get(prefix);
                if (!draft)
                    return ctx.sendMessage("There doesn't seem like there is a draft running with that prefix.");
                draft.getTimeRemaining(record, ctx);
            });
        };
    }
}
exports.Gettime = Gettime;
