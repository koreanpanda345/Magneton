import { IEvent } from "../../types/events";
import { CommandContext } from "../../types/CommandContext";
import {Message as Msg, MessageEmbed} from "discord.js";
import { Magneton } from "../../Magneton";
import {} from "timers"
import SettingsSchema, { ISettings } from "../../database/SettingsSchema";
import { CallbackError } from "mongoose";
export class Message implements IEvent {
	constructor(
		private _client: Magneton
	){}
	
	name = "message";
	
	async getPrefix(serverId: string): Promise<string> {
		return await new Promise((resolve) => {
			SettingsSchema.findOne({serverId}, (error: CallbackError, record: ISettings) => {
				if(!record) {
					const newConfig = new SettingsSchema({
						serverId,
						prefix: "m!"
					});

					newConfig.save().catch(error => console.error(error));
					return resolve(newConfig.prefix);
				}

				return resolve(record.prefix);
			});
		})
	}

	invoke = async(message: Msg) => {
		if(message.author.bot) return;
		let prefix: string = (message.channel.type !== "dm") ? await this.getPrefix(message.guild!.id!) : process.env.PREFIX!;
		if(message.mentions.users.has(message.client.user!.id)) {
			let embed = new MessageEmbed();
			embed.setDescription(`My prefix is ${prefix}`);

			embed.setColor("RANDOM");
			message.channel.send(embed);
		}
		if(message.content.toLowerCase().startsWith(prefix)) {
			const args = message.content.slice(prefix.length).trim().split(/ +/g);
			const commandName = args.shift()?.toLowerCase();

			const command = this._client.commands.get(commandName!) || this._client.commands.find(cmd => cmd.aliases! && cmd.aliases!.includes(commandName!));
			
			if(!command) return;

			let run = true;
			const ctx = new CommandContext(message, args, this._client);
			command.permission?.user?.forEach(permission => {
				if(!ctx.member?.hasPermission(permission)) {
					run = false;
					return ctx.sendMessage(`You can not use this command. You must have the permission of \`${permission}\` to do this.`);
				}
				run = true;
			});
			if(!run) return;
			command.permission?.self?.forEach(permission => {
				if(!ctx.me?.hasPermission(permission)) {
					run = false;
					return ctx.sendMessage(`I can not do this. I must have the permission of \`${permission}\` to do this.`);
				}
				run = false;
			});
			if(!run) return false;
			command.preconditions?.forEach(async condition => {
				const result = await condition(ctx);
				if(typeof result === 'boolean' && !result) {
					run = false;
					return ctx.sendMessage("You can not use this command.");
				}
				else if(typeof result === 'string') {
					run = false;
					return ctx.sendMessage(result);
				}
				else if(typeof result === 'undefined') {
					run = false;
					return ctx.sendMessage(`Something Happened when checking the preconditions of command ${command.name}`);
				}
				run = true;
			});

			if(!run) return;

			try {
				await command.invoke(ctx);
			} catch(error) {
				console.error(error);
			}
		}
	};
}