"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const updateSchema = new Schema({
    date: String,
    title: String,
    description: String,
    type: String,
    id: Number
});
exports.default = mongoose_1.default.model("Updates", updateSchema);
