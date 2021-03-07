import { Intents, startBot } from "discordeno";
import "dotenv";
import { fileLoader, importDirectory } from "./src/utils/helpers.ts";
import { botCache } from "./cache.ts";
import {loadLanguages} from "./src/utils/i18next.ts";


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
// This will load the languages.
await loadLanguages();

// Starts the bot.
startBot({
	token: Deno.env.get("TOKEN") as string,
	intents: [Intents.GUILDS, Intents.GUILD_MESSAGES],
	eventHandlers: botCache.eventHandlers
});