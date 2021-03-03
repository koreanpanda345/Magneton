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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
    /**
     * Runs the bot.
     * @param type - What stage are we in?
     */
    start(type) {
        this.loadFiles(type);
        this.login(process.env.TOKEN);
    }
    /**
     * Loads the required files.
     * @param type - What stage are we in?
     */
    loadFiles(type) {
        this.loadCommands(type);
        this.loadEvents(type);
    }
    /**
     * Loads the commands.
     * @param type - What stage are we in?
     */
    loadCommands(type) {
        // If we are in the development stage, then we are going to be using ts-node.
        // which uses the files in the src folder. else we would be using node, and use
        // the files in the build folder.
        const folder = type === "development" ? "./src/commands" : "./build/commands";
        const dirs = fs_1.readdirSync(`${folder}`);
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`../${folder}/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const command = new instance[`${name}`](this);
                    console.log(`Command ${command.name} was loaded`);
                    this._commands.set(command.name, command);
                });
            }
        });
    }
    /**
     * Loads the events.
     * @param type - What stage are we in?
     */
    loadEvents(type) {
        // If we are in the development stage, then we are going to be using ts-node.
        // which uses the files in the src folder. else we would be using node, and use
        // the files in the build folder.
        const folder = type === "development" ? "./src/events" : "./build/events";
        const dirs = fs_1.readdirSync(`${folder}`);
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`../${folder}/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const event = new instance[`${name}`](this);
                    this._events.set(event.name, event);
                    this.on(event.name, (...args) => event.invoke(...args));
                });
            }
        });
    }
    /**
     * The collection of commands.
     */
    get commands() { return this._commands; }
    /**
     * The collection of events.
     */
    get events() { return this._events; }
    /**
     * The collection of executed draft timers.
     */
    get drafts() { return this._drafts; }
}
exports.Magneton = Magneton;
