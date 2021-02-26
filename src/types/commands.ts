import { CommandContext } from "./CommandContext";
import { PermissionString } from "discord.js";


export interface ICommand {
	name: string;
	aliases?: Array<string>;
	description?: string;
	usage?: Array<string>;
	category?: string;
	permission?: {
		user?: PermissionString[],
		self?: PermissionString[]
	};
	preconditions?: Array<(ctx: CommandContext) => boolean | string>;
	invoke: (ctx: CommandContext) => unknown;
}