import { botCache } from "../../cache.ts";
import {ActivityType, cache, editBotsStatus, StatusTypes} from "discordeno";

botCache.eventHandlers.ready = () => {
	editBotsStatus(StatusTypes.DoNotDisturb, `${Deno.env.get("PREFIX")}help`, ActivityType.Game);
	
	console.log(`Loaded ${botCache.arguments.size} Argument(s)`);
	console.log(`Loaded ${botCache.commands.size} Command(s)`);
	console.log(`Loaded ${Object.keys(botCache.eventHandlers).length} Event(s)`);
	console.log(`Loaded ${botCache.inhibitors.size} Inhibitor(s)`);
	console.log(`Loaded ${botCache.tasks.size} Task(s)`);

	console.log(`[READY] Bot is online and ready in ${cache.guilds.size} guild(s)!`);

}