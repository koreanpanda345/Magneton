"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pausetimer = void 0;
class Pausetimer {
    constructor() {
        this.name = "pausetimer";
        this.description = "Pauses the timer. You can resume the timer with the `resumetimer` command.";
        this.category = "draft";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
        };
    }
}
exports.Pausetimer = Pausetimer;
