import type {Message, Collection, Guild, Permission} from "discordeno";

export interface Command {
	name: string;
	aliases?: string[];
	dmOnly?: boolean;
	guildOnly?: boolean;
	permissionLevels?:
		| PermissionLevels[]
		| ((message: Message, command: Command, guild?: Guild) => boolean | Promise<boolean>);
	permissions?: {
		server?: {
			self?: Permission[],
			user?: Permission[]
		},
		channel?: {
			self?: Permission[],
			user?: Permission[]
		}
	};
	description: string;
	arguments?: CommandArgument[];
	subcommands?: Collection<string, Command>;

	invoke?: (message: Message, args: any, guild?: Guild) => unknown;
}

export interface CommandArgument {
	/** Name of the argument */
	name: string;
	/** Type of the argument. Defaults to string */
	type?: 
		| "string"
		| "member"
		| "role"
		| "number"
		| "...string"
		| "...roles"
		| "boolean"
		| "textchannel"
		| "subcommand"
		| "guild";

	missing?: (message: Message) => unknown;
	/** This determineds if the argument is required or not. */
	required?: boolean;
	/** If the type is a string, then this force the string to be lowercase */
	lowercase?: boolean;
	/** If the type is string or subcommand you can provid literals. */
	literals?: string[];
	/** The default value for this argumet/subcommand */
	defaultValue?: string | boolean | number;
}

export interface Argument {
	name: string;
	invoke: (arg: CommandArgument, parameters: string[], message: Message, command: Command) => unknown;
}

export interface Args {
	[key: string]: unknown;
}

export enum PermissionLevels {
	MEMBER,
	MODERATOR,
	ADMIN,
	SERVER_OWNER,
	BOT_DEVS,
	BOT_OWNER
}