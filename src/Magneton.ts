import { Client, Collection, PresenceStatusData } from "discord.js";
import { Command } from "./types/commands";
import { Monitor } from "./types/monitors";
import { Events } from "./types/events";
import { readdirSync } from "fs";
import { DraftSystem } from "./systems/DraftSystem";
export class Magneton extends Client {
	private _cache: {
		commands: Collection<string, Command>;
		events: Collection<string, Events>;
		drafts: Collection<string, DraftSystem>;
		monitors: Collection<string, Monitor>;
	};
	private _state: "Development" | "Production" = "Development";
	private _status: PresenceStatusData;
	constructor() {
		super();

		this._cache = {
			commands: new Collection<string, Command>(),
			events: new Collection<string, Events>(),
			drafts: new Collection<string, any>(),
			monitors: new Collection<string, Monitor>(),
		};
		this._status = "online";
	}

	public changeState = (state: "Development" | "Production") =>
		(this._state = state);
	public runEvents = async () => {
		this.cache.events.forEach((event) => {
			this.on(event.name, (...args) => event.invoke(...args));
		});
	};
	public loadFiles = async () => {
		const state = this._state;
		const dirs = ["commands", "events", "monitors"];
		dirs.forEach((dir: string) => {
			const folders = readdirSync(
				`./${state === "Development" ? "src" : "dist"}/${dir}`
			);
			folders.forEach(async (folder) => {
				if (folder.endsWith(state === "Development" ? ".ts" : ".js")) {
					await import(`./${dir}/${folder}`);
				} else {
					const files = readdirSync(
						`./${state === "Development" ? "src" : "dist"}/${dir}/${folder}`
					);
					files.forEach(async (file) => {
						await import(`./${dir}/${folder}/${file}`);
					});
				}
			});
		});
	};

	//#region Getters
	public get cache() {
		return this._cache;
	}
	public get state() {
		return this._state;
	}
	public get status() {
		return this._status;
	}
	//#endregion
}
