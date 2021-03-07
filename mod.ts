import { Intents, startBot } from "discordeno";
import "dotenv";
import { fileLoader, importDirectory } from "./src/utils/helpers.ts";
import { botCache } from "./cache.ts";
import {Airtable} from "airtable";

console.log("Starting up the bot");

// this will import the directories
await Promise.all(
	[
		"./src/events",
		"./src/monitors",
		"./src/tasks",
		"./src/arguments",
		"./src/commands"
	].map((path) => importDirectory(Deno.realPathSync(path)))
);
// this will load the files.
await fileLoader();

export const draftTimer = new Airtable({
	apiKey: Deno.env.get("AIRTABLE_API_KEY"),
	baseId: Deno.env.get("AIRTABLE_BASE_ID"),
	tableName: "Draft Timers"
});

export const serverSettings = new Airtable({
	apiKey: Deno.env.get("AIRTABLE_API_KEY"),
	baseId: Deno.env.get("AIRTABLE_BASE_ID"),
	tableName: "Server Settings"
});
// Starts the bot.
startBot({
	token: Deno.env.get("TOKEN") as string,
	intents: [Intents.GUILDS, Intents.GUILD_MESSAGES],
	eventHandlers: botCache.eventHandlers
});