import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { TeamStorageSystem } from "../../systems/TeamStorageSystem";
import {
	Message,
	MessageEmbed,
	MessageReaction,
	ReactionEmoji,
	User,
} from "discord.js";

createCommand({
	name: "getteam",
	aliases: ["gt"],
	usages: ["m!getteam <team id>"],
	description: "Gets a team from your PC.",
	permissions: {
		self: ["MANAGE_MESSAGES", "ADD_REACTIONS"],
	},
	invoke: async (ctx: CommandContext) => {
		//We need to parse the arguments
		if (!ctx.args.length)
			return ctx.sendMessage("Please try again, but provide the team id.");
		const id = Number(ctx.args[0]);
		if (isNaN(id))
			return ctx.sendMessage("Please try again, but provide a valid team id.");
		const result = await new TeamStorageSystem(ctx).getTeam(id);
		console.debug(result);
		// If process is not successful.
		if (!result.success) {
			const embed = new MessageEmbed();
			embed.setTitle("There was an error trying to get this team.");
			embed.setDescription(result.reason);
			embed.setColor("RED");
			return ctx.sendMessage(embed);
		}
		// else we are assuming it was successful.
		else {
			const embed = new MessageEmbed();
			embed.setTitle(`${result.data?.name}`);
			embed.setDescription(`\`\`\`${result.data?.team.join("")}\`\`\``);
			embed.setColor("RANDOM");
			return ctx.sendMessage(embed).then((msg) => {
				// We need to use a reaction handler, as ios, doesn't allow people to copy text in a embed.
				const importReaction = "🔽";
				// Might as well make it were you can delete the message if you are done with it.
				const trashReaction = "🚮";
				msg.react(importReaction).then(() => {
					msg.react(trashReaction);
					const importFilter = (reaction: MessageReaction, user: User) =>
						user.id === ctx.userId && reaction.emoji.name === importReaction;
					const trashFilter = (reaction: MessageReaction, user: User) =>
						user.id === ctx.userId && reaction.emoji.name === trashReaction;
					const timeout = 24000000;
					const importCollector = msg.createReactionCollector(importFilter, {
						time: timeout,
						max: 1,
					});
					const trashCollector = msg.createReactionCollector(trashFilter, {
						time: timeout,
						max: 1,
					});

					importCollector.on("collect", () => {
						msg.delete();
						msg.channel.send(result.data?.team.join(""), { code: true });
						importCollector.stop();
					});
					trashCollector.on("collect", () => {
						msg.delete();
						trashCollector.stop();
					});
				});
			});
		}
	},
});
