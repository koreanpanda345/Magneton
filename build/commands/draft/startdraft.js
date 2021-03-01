"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Startdraft = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
const DraftSystem_1 = require("../../systems/DraftSystem");
class Startdraft {
    constructor() {
        this.name = "startdraft";
        this.permissions = {
            user: ["MANAGE_GUILD"]
        };
        this.category = "draft";
        this.invoke = async (ctx) => {
            return await new Promise((resolve) => {
                DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                    if (!record)
                        return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
                    if (ctx.client.drafts.has(record.prefix))
                        return ctx.sendMessage("There is already a draft made.");
                    const draft = new DraftSystem_1.DraftSystem(ctx);
                    draft.start(record);
                    ctx.client.drafts.set(record.prefix, draft);
                    ctx.sendMessage("Starting Draft");
                });
            });
        };
    }
}
exports.Startdraft = Startdraft;
