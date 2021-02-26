"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deletedraft = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
const DraftSystem_1 = require("../../systems/DraftSystem");
class Deletedraft {
    constructor() {
        this.name = "deletedraft";
        this.description = "Deletes the draft.";
        this.category = "draft";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
                if (ctx.client.drafts.has(record.prefix))
                    return ctx.sendMessage("Please stop the draft before deleting");
                const draft = new DraftSystem_1.DraftSystem(ctx);
                draft.destroy(record.prefix, record.channelId);
                ctx.client.drafts.delete(record.prefix);
                ctx.sendMessage("Deleted Draft");
            });
        };
    }
}
exports.Deletedraft = Deletedraft;
