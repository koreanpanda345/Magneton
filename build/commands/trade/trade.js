"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
const TradeSystem_1 = require("../../systems/TradeSystem");
class Trade {
    constructor() {
        this.name = "trade";
        this.category = "trade";
        this.description = "Allows you to make a trade with another player that is in the same draft as you.";
        this.invoke = async (ctx) => {
            var _a;
            if (!ctx.args[0])
                return ctx.sendMessage("Please execute the command again, but provide the league's prefix");
            let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            DraftTimerSchema_1.default.findOne({ prefix }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft with that prefix.");
                const trade = new TradeSystem_1.TradeSystem(ctx);
                trade.getPlayer(record, ctx.userId);
            });
        };
    }
}
exports.Trade = Trade;
