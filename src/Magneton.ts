import { Client, Collection } from "discord.js";
import {readdirSync} from "fs";
import { DraftSystem } from "./systems/DraftSystem";
import { ICommand } from "./types/commands";
import { IEvent } from "./types/events";
export class Magneton extends Client {
	private readonly _commands: Collection<string, ICommand>;
	private readonly _events: Collection<string, IEvent>;
	private readonly _drafts: Collection<string, DraftSystem>;

	constructor() {
		super();
		this._commands = new Collection<string, ICommand>();
		this._events = new Collection<string, IEvent>();
		this._drafts = new Collection<string, DraftSystem>();
	}

	public start() {
		this.loadFiles();
		this.login(process.env.TOKEN);
	}

	public loadFiles() {
		this.loadCommands();
		this.loadEvents();
	}

	public loadCommands() {
		const dirs = readdirSync("./src/commands");
		dirs.forEach(async dir => {
			const files = readdirSync(`./src/commands/${dir}`).filter(d => d.endsWith(".ts"));
			for(let file of files) {
				import(`./commands/${dir}/${file}`).then(instance => {
					const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const command: ICommand = new instance[`${name}`](this);
					console.log(`Command ${command.name} was loaded`);
					this._commands.set(command.name, command);
				});
			}
		});
	}

	public loadEvents() {
		const dirs = readdirSync("./src/events");
		dirs.forEach(async dir => {
			const files = readdirSync(`./src/events/${dir}`).filter(d => d.endsWith(".ts"));
			for(let file of files) {
				import(`./events/${dir}/${file}`).then(instance => {
					const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const event: any = new instance[`${name}`](this);
					this._events.set(event.name, event);
					this.on(event.name, (...args) => event.invoke(...args));
				});
			}
		});
	}

	public get commands() { return this._commands; }
	public get events() { return this._events; }
	public get drafts() { return this._drafts; }
}