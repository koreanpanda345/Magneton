"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stopdraft = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
const DraftSystem_1 = require("../../systems/DraftSystem");
class Stopdraft {
    constructor() {
        this.name = "stopdraft";
        this.category = "draft";
        this.description = "Stops the draft";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
                if (!ctx.client.drafts.has(record.prefix))
                    return ctx.sendMessage("That draft isn't running currently.");
                const draft = new DraftSystem_1.DraftSystem(ctx);
                ctx.client.drafts.delete(record.prefix);
                ctx.sendMessage("Stopped draft. you can pick off where you last left off.");
            });
        };
    }
}
exports.Stopdraft = Stopdraft;
