import { botCache } from "../../cache.ts";
import { Command } from "../types/commands.ts";
import {Collection} from "discordeno";

/**
 * This will create the command.
 * @param command -Command to be created.
 */
export function createCommand(command: Command) {
	botCache.commands.set(command.name, command);
}
/**
 * This will create a subcommand.
 * @param commandName - command name
 * @param subcommand - subcommand to be create.
 * @param retries - the times it has retried the method.
 */
export function createSubcommand(commandName: string, subcommand: Command, retries = 0) {
	const names = commandName.split("-");

	let command = botCache.commands.get(commandName);

	if(names.length > 1) {
		for(const name of names) {
			const validCommand = command ?
				command.subcommands?.get(name) :
				botCache.commands.get(name);
			if(!validCommand) break;

			command = validCommand;
		}
	}

	if(!command) {
		if(retries === 20) {
			return console.error(`Subcommand ${subcommand} unable to be create for ${commandName}`);
		}

		setTimeout(() => createSubcommand(commandName, subcommand, retries++), 30000);
		return;
	}

	if(!command.subcommands) command.subcommands = new Collection();

	command.subcommands.set(subcommand.name, subcommand);
}


// This is to make sure files are not reloading more than once.
let uniqueFilePathCounter = 0;
let paths: string[] = [];

/**
 * This is used to import files in a directory for the bot to use.
 * @param path - the directory to import for the bot to use.
 */
export async function importDirectory(path: string) {
	const files = Deno.readDirSync(Deno.realPathSync(path));
	const folder = path.substring(path.indexOf("/src/"));
	
	if(!folder.includes("/")) console.log(`Loading ${folder}...`);

	for(const file of files) {
		if(!file.name) continue;

		const currentPath = `${path}/${file.name}`.replaceAll("\\", "/");
		if(file.isFile) {
			if(!currentPath.endsWith(".ts")) continue;
			paths.push(`import "${Deno.mainModule.substr(0, Deno.mainModule.lastIndexOf("/"))}/${currentPath.substring(currentPath.indexOf("src/"),)}#${uniqueFilePathCounter}";`);
			continue;
		}

		await importDirectory(currentPath);
	}

	uniqueFilePathCounter++;
}

/**
 * This will load everything in to a file called "fileloader.ts".
 */
export async function fileLoader() {
	await Deno.writeTextFile("fileloader.ts", paths.join("\n").replaceAll("\\", "/"));
	await import(`${Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))}/fileloader.ts#${uniqueFilePathCounter}`);
	paths = [];
}

/**
 * This will get the current time, and format it.
 */
export function getTime() {
	const now = new Date();
	const hours = now.getHours();
	const minute = now.getMinutes();

	let hour = hours;
	let amOrPm = "AM";
	if(hour > 12) {
		amOrPm = "PM";
		hour = hour - 12;
	}

	return `${hour >= 10 ? hour : `0${hour}`}:${minute >= 10 ? minute : `0${minute}`} ${amOrPm}`;
}