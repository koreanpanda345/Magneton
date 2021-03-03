import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { MessageEmbed } from "discord.js";
import { TypeColors } from "../../utils/typeColors";
import Discord from "discord.js";

export class About implements ICommand {
	name = "about";
	aliases = ["info", "botinfo", "bot"];
	description = "Gives you information about me.";
	category = "miscellaneous";

	invoke = async(ctx: CommandContext) => {
		let embed = new MessageEmbed();
		embed.setAuthor(ctx.client.user?.username, ctx.client.user?.avatarURL()!);
		embed.setThumbnail(ctx.client.user?.avatarURL()!);
		embed.setColor(TypeColors["electric"][1]);
		embed.setDescription("Magneton is more than just a pokemon. Its a discord bot!!!");
		embed.addField("Libraries", `Discord.js Version: ${Discord.version}\nNode: ${process.version}\n`);
		embed.addField("Developer", `${await (await (ctx.client.users.fetch("304446682081525772"))).username}`);
		ctx.sendMessage(embed).then(async msg => {
			embed.addField("Base Stats", `HP: 1000000\nATK: 0\nDEF: 0\nSPA: 100000\nSPD: 1000000\nSPE: ${msg.createdTimestamp - Date.now()}`);
			msg.edit(embed);
		});
	}
}