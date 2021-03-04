import { Client, Collection } from "discord.js";
import {readdirSync} from "fs";
import { DraftSystem } from "./systems/DraftSystem";
import { ICommand } from "./types/commands";
import { IEvent } from "./types/events";
import { TradeSystem } from "./systems/TradeSystem";
export class Magneton extends Client {
	// Variables are private so that i can reduce the chances of overriding these variables.
	private readonly _commands: Collection<string, ICommand>;
	private readonly _events: Collection<string, IEvent>;
	private readonly _drafts: Collection<string, DraftSystem>;
	private readonly _trades: Collection<number, TradeSystem>;

	constructor() {
		super();
		this._commands = new Collection<string, ICommand>();
		this._events = new Collection<string, IEvent>();
		this._drafts = new Collection<string, DraftSystem>();
		this._trades = new Collection<number, TradeSystem>();
	}
	/**
	 * Runs the bot.
	 * @param type - What stage are we in?
	 */
	public start(type: "development" | "production") {
		this.loadFiles(type);
		this.login(process.env.TOKEN);
	}
	/**
	 * Loads the required files.
	 * @param type - What stage are we in?
	 */
	public loadFiles(type: "development" | "production") {
		this.loadCommands(type);
		this.loadEvents(type);
	}
	/**
	 * Loads the commands.
	 * @param type - What stage are we in?
	 */
	public loadCommands(type: "development" | "production") {
		// If we are in the development stage, then we are going to be using ts-node.
		// which uses the files in the src folder. else we would be using node, and use
		// the files in the build folder.
		const folder = type === "development" ? "./src/commands" : "./build/commands";
		const dirs = readdirSync(`${folder}`);
		dirs.forEach(async dir => {
			const files = readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
			for(let file of files) {
				import(`../${folder}/${dir}/${file}`).then(instance => {
					const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const command: ICommand = new instance[`${name}`](this);
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
	public loadEvents(type: "development" | "production") {
		// If we are in the development stage, then we are going to be using ts-node.
		// which uses the files in the src folder. else we would be using node, and use
		// the files in the build folder.
		const folder = type === "development" ? "./src/events" : "./build/events";
		const dirs = readdirSync(`${folder}`);
		dirs.forEach(async dir => {
			const files = readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
			for(let file of files) {
				import(`../${folder}/${dir}/${file}`).then(instance => {
					const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const event: any = new instance[`${name}`](this);
					this._events.set(event.name, event);
					this.on(event.name, (...args) => event.invoke(...args));
				});
			}
		});
	}
	/**
	 * The collection of commands.
	 */
	public get commands() { return this._commands; }
	/**
	 * The collection of events.
	 */
	public get events() { return this._events; }
	/**
	 * The collection of executed draft timers.
	 */
	public get drafts() { return this._drafts; }
	/**
	 * The collection executed trades.
	 */
	public get trades() { return this._trades; }
}