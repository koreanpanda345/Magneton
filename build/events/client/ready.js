"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ready = void 0;
class Ready {
    constructor(_client) {
        this._client = _client;
        this.name = "ready";
        this.invoke = async () => {
            var _a, _b, _c;
            console.log(`${(_a = this._client.user) === null || _a === void 0 ? void 0 : _a.username} is ready`);
            (_b = this._client.user) === null || _b === void 0 ? void 0 : _b.setStatus("dnd");
            (_c = this._client.user) === null || _c === void 0 ? void 0 : _c.setActivity(`${process.env.PREFIX}help | In ${this._client.guilds.cache.size} servers`);
        };
    }
}
exports.Ready = Ready;
