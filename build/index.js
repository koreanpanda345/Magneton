"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const Magneton_1 = require("./Magneton");
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.config();
// Mongoose Connection.
mongoose_1.default.connect(process.env.MONGOOSE_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});
const client = new Magneton_1.Magneton();
client.start("production");
