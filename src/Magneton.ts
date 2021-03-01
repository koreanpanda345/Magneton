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

	public start(type: "development" | "production") {
		this.loadFiles(type);
		this.login(process.env.TOKEN);
	}

	public loadFiles(type: "development" | "production") {
		this.loadCommands(type);
		this.loadEvents(type);
	}

	public loadCommands(type: "development" | "production") {
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

	public loadEvents(type: "development" | "production") {
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

	public get commands() { return this._commands; }
	public get events() { return this._events; }
	public get drafts() { return this._drafts; }
}