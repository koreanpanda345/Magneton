"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Magneton = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
class Magneton extends discord_js_1.Client {
    constructor() {
        super();
        this._commands = new discord_js_1.Collection();
        this._events = new discord_js_1.Collection();
        this._drafts = new discord_js_1.Collection();
    }
    start() {
        this.loadFiles();
        this.login(process.env.TOKEN);
    }
    loadFiles() {
        this.loadCommands();
        this.loadEvents();
    }
    loadCommands() {
        const dirs = fs_1.readdirSync("./src/commands");
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`./src/commands/${dir}`).filter(d => d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`./commands/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const command = new instance[`${name}`](this);
                    console.log(`Command ${command.name} was loaded`);
                    this._commands.set(command.name, command);
                });
            }
        });
    }
    loadEvents() {
        const dirs = fs_1.readdirSync("./src/events");
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`./src/events/${dir}`).filter(d => d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`./events/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const event = new instance[`${name}`](this);
                    this._events.set(event.name, event);
                    this.on(event.name, (...args) => event.invoke(...args));
                });
            }
        });
    }
    get commands() { return this._commands; }
    get events() { return this._events; }
    get drafts() { return this._drafts; }
}
exports.Magneton = Magneton;
