import {Collection, Guild, Message} from "discordeno";
import { Command } from "./src/types/commands.ts";
import { Argument } from "./src/types/commands.ts";
import { Monitor } from "./src/types/monitors.ts";
import { Task } from "./src/types/tasks.ts";
import {CustomEvent} from "./src/types/events.ts";
import {MessageCollector, ReactionCollector} from "./src/types/collectors.ts";
import {Airtable} from "airtable";
// This is the bot's caching.
// everything that needs to be stored as an instance is setup here.
export const botCache = {
	arguments: new Collection<string, Argument>(),
	commands: new Collection<string, Command>(),
	databases: {
		draft: new Airtable({
			apiKey: Deno.env.get("AIRTABLE_API_KEY"),
			baseId: Deno.env.get("AIRTABLE_BASE_ID"),
			tableName: "Draft Timers"
		}),
		server: new Airtable({
			apiKey: Deno.env.get("AIRTABLE_API_KEY"),
			baseId: Deno.env.get("AIRTABLE_BASE_ID"),
			tableName: "Server Settings"
		})
	},
	eventHandlers: {} as CustomEvent,
	guildPrefixes: new Collection<string, any>(),
	guildLanguages: new Collection<string, any>(),
	messageCollectors: new Collection<string, MessageCollector>(),
	reactionCollectors: new Collection<string, ReactionCollector>(),
	inhibitors: new Collection<string, (message: Message, command: any, guild?: Guild) => Promise<boolean>>(),
	monitors: new Collection<string, Monitor>(),
	permissionLevels: new Collection<any, (message: Message, command: any, guild?: Guild) => Promise<boolean>>(),
	tasks: new Collection<string, Task>(),
	runningTasks: [] as number[],
}