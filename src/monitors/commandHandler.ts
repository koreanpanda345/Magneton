import {Guild, Message, botID} from "discordeno";
import { bgBlack, bgYellow, black, red, green, white, bgGreen, bgMagenta, bgBlue } from "colors";
import {botCache} from "../../cache.ts";
import { getTime } from "../utils/helpers.ts";
import { Command } from "../types/commands.ts";
import {handleError} from "../utils/errors.ts";


//#region Parsers
/** Parses the prefix for the guild. */
export const parsePrefix = (guildId?: string) => {
	// This will be change once we add the database.
	const prefix = Deno.env.get("PREFIX");

	return prefix || Deno.env.get("PREFIX");
};

export const parseCommand = (commandName: string) => {
	const command = 
		botCache.commands.get(commandName)
		||
		botCache.commands.find((cmd: Command) => Boolean(cmd.aliases?.includes(commandName)));

	return command;
};



async function parseArguments (message: Message, command: Command, parameters: string[]) {
	const args: {[key: string]: unknown} = {};
	if(!command.arguments) return args;

	let missingRequiredArg = false;
	
	const params = [...parameters];

	for(const argument of command.arguments) {
		const resolver = botCache.arguments.get(argument.type || "string");
		if(!resolver) continue;

		const result = await resolver.invoke(argument, params, message, command);
		if(result !== undefined) {
			args[argument.name] = result;

			if(argument.type && ["...string", "...roles"].includes(argument.type)) {
				break;
			}

			params.shift();
			continue;
		}

		if(Object.prototype.hasOwnProperty.call(argument, "defaultValue"))
			args[argument.name] = argument.defaultValue;
		else if(command.subcommands?.has(parameters[0]))
			continue;
		else if(argument.required !== false) {
			missingRequiredArg = true;
			argument.missing?.(message);
			break;
		}
	}

	return missingRequiredArg ? false : args;

};
//#endregion

export const logCommand = (message: Message, guildName: string, type: "Failure" | "Success" | "Trigger" | "Slowmode" | "Missing", commandName: string) => {
	const command = `[COMMAND: ${bgYellow(black(commandName))} - ${
		bgBlack(
			["Failure", "Slowmode", "Missing"].includes(type) ?
				red(type) :
				type === "Success" ?
					green(type) :
					white(type)
		)
	}]`;

	const user = bgGreen(black(`${message.author.username}#${message.author.discriminator}(${message.author.id})`));
	const guild = bgMagenta(black(`${guildName}${message.guildID ? `(${message.guildID})` : ""}`));

	console.log(`${bgBlue(`${getTime()}`)} => ${command} by ${user} in ${guild}`);
};

async function commandAllowed(message: Message, command: Command, guild?: Guild) {
	const inhibtorResults = await Promise.all(
		botCache.inhibitors.map(async (inhibitor, name) => {
			const inhibited = await inhibitor(message, command, guild);
			return [name, inhibited];
		})
	);

	let allowed = true;

	for(const result of inhibtorResults) {
		const [name, inhibited] = result;
		if(inhibited) {
			allowed = false;
			logCommand(message, guild?.name || "DM", "Failure", command.name);
			console.log(`[Inhibitor] ${name} on ${command.name} for ${message.author.username}#${message.author.discriminator}`);
		}
	}

	return allowed;
};

async function executeCommand(message: Message, command: Command, parameters: string[], guild?: Guild) {
	try {
		const args = (await parseArguments(message, command, parameters)) as 
			| { [key: string]: unknown; }
			| false;
		if(!args) return logCommand(message, guild?.name || "DM", "Missing", command.name);

		const [argument] = command.arguments || [];

		let subcommand = argument ? (args[argument.name] as Command) : undefined;

		if(!argument || argument.type !== "subcommand" || !subcommand) {
			if(!(await commandAllowed(message, command, guild))) return;
			await command.invoke?.(message, args, guild);
			return logCommand(message, guild?.name || "DM", "Success", command.name);
		}

		if(!subcommand?.name)
			subcommand = command?.subcommands?.get((subcommand as unknown) as string) as Command;
		
		if(![subcommand.name, ...(subcommand.aliases || [])].includes(parameters[0]))
			executeCommand(message, subcommand, parameters, guild);
		else {
			const subParameters = parameters.slice(1);
			executeCommand(message, subcommand, subParameters, guild);
		}
	} catch(error) {
		logCommand(message, guild?.name || "DM", "Failure", command.name);
		console.error(error);
		handleError(message, error);
	}
};


botCache.monitors.set("commandHandler", {
	name: "commandHandler",
	ignore: {
		dm: false
	},

	invoke: async (message: Message) => {
		if(message.author.bot) return;

		let prefix = parsePrefix(message.guildID);
		const botMention = `<@${botID}>`;

		if(message.content === botMention)
			return message.reply(`My prefix is ${prefix}`);
		else if(message.content.startsWith(botMention)) prefix = botMention;
		else if(!message.content.startsWith(prefix!)) return;

		const [commandName, ...parameters] = message.content.substring(prefix!.length).split(" ");

		const command = parseCommand(commandName);
		if(!command) return;

		logCommand(message, message.guild?.name || "DM", "Trigger", commandName);

		return executeCommand(message, command, parameters, message.guild);
	}
})

