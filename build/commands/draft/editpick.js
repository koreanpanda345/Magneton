"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editpick = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/DraftTimerSchema"));
class Editpick {
    constructor() {
        this.name = "editpick";
        this.description = "Allows you to pick for someone.";
        this.usage = ["m!leftpicks <@who> <league prefix> <pokemon>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.category = "draft";
        this.invoke = async (ctx) => {
            var _a;
            if (!ctx.args[0])
                return ctx.sendMessage("Please execute this command again, but add the league prefix, and the pokemon you want to draft.");
            let player = ctx.message.mentions.users.first();
            if (!player)
                return ctx.sendMessage("Please mention the player that you are picking for.");
            ctx.args.shift();
            let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let args = ctx.args.join(" ");
            let oldPokemon = args.split(",")[0].replace(/ +/g, "");
            let newPokemon = args.split(",")[1].replace(/ +/g, "");
            DraftTimerSchema_1.default.findOne({ prefix }, async (error, record) => {
                if (!record)
                    return ctx.sendMessage("There is no draft made. Please tell your liasion that there is no draft made yet.");
                let draft = ctx.client.drafts.get(prefix);
                if (!draft)
                    return ctx.sendMessage("There is no draft running with that league prefix. Tell your Liaison to start the draft.");
                if (!draft.isInDraft(record, player === null || player === void 0 ? void 0 : player.id))
                    return ctx.sendMessage("You are not in the draft. If you are picking for someone, then use `leftpick` command to pick for said person.");
                if (!draft.isPlayersTurn(record, player === null || player === void 0 ? void 0 : player.id))
                    return ctx.sendMessage("It is not your turn yet. please wait");
                await draft.editPick(ctx, player === null || player === void 0 ? void 0 : player.id, prefix, oldPokemon, newPokemon);
            });
        };
    }
}
exports.Editpick = Editpick;
