import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { MessageEmbed } from "discord.js";


export class Wiki implements ICommand {
	name = "wiki";
	description = "Gives you the wiki link";
	category = "miscellaneous";

	invoke = async(ctx: CommandContext) => {
		let embed = new MessageEmbed();
		embed.setTitle("Wiki");
		embed.setImage(ctx.client.user?.avatarURL()! || ctx.client.user?.defaultAvatarURL!);
		embed.setURL("https://koreanpanda345.gitbook.io/magneton/");
		embed.setColor("RANDOM");

		ctx.sendMessage(embed);
	}
}