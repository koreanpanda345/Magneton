"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Removeplayer = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
const DraftSystem_1 = require("../../systems/DraftSystem");
class Removeplayer {
    constructor() {
        this.name = "removeplayer";
        this.category = "draft";
        this.description = "Removes a player from the draft";
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, async (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft maded. Please set one up, by using the `setdraft` command.");
                let player = ctx.message.mentions.users.first();
                if (!player)
                    return ctx.sendMessage("Please mention the player that you are picking for.");
                const draft = new DraftSystem_1.DraftSystem(ctx);
                await draft.addPlayer((data) => {
                    data.players.push({
                        userId: player === null || player === void 0 ? void 0 : player.id,
                        pokemon: [],
                        order: data.players.length + 1,
                        leavePicks: "none",
                        skips: 0,
                        queue: []
                    });
                    return data;
                });
                ctx.sendMessage(`Added ${player.username} to the draft.`);
            });
        };
    }
}
exports.Removeplayer = Removeplayer;
