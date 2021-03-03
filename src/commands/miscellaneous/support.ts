import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/CommandContext";
import { MessageEmbed } from "discord.js";


export class Support implements ICommand {
	name = "support";
	aliases = ["server"];
	description = "Gives you the server link to the support server.";
	category = "miscellaneous";

	invoke = async(ctx: CommandContext) => {
		let embed = new MessageEmbed();
		embed.setTitle("Support Server");
		embed.setImage(ctx.client.user?.avatarURL()! || ctx.client.user?.defaultAvatarURL!);
		embed.setURL("https://discord.gg/EPjF2JbhkZ");
		embed.setColor("RANDOM");

		ctx.sendMessage(embed);
	}
}