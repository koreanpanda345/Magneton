import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { Dex } from "@pkmn/dex";
import { MessageEmbed } from "discord.js";

createCommand({
	name: "queue",
	aliases: ["q"],
	description:
		"Allows you to add, remove a pokemon from your queue, or view what is in your queue",
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length) {
			return ctx.sendMessage("Please try again, but provide league prefix");
		}
		const embed = new MessageEmbed();
		switch (ctx.args[1]) {
			case "add":
				DraftTimer.findOne(
					{ prefix: ctx.args[0] },
					(error: CallbackError, record: IDraftTimer) => {
						if (!record)
							return ctx.sendMessage(
								"There doesn't seem to be a draft with that prefix."
							);
						const player = record.players.find((x) => x.userId === ctx.userId);
						if (!player) return ctx.sendMessage("You are not in this draft.");
						ctx.args.shift();
						ctx.args.shift();
						const poke = Dex.getSpecies(ctx.args.join(" "));
						if (!poke.exists)
							return ctx.sendMessage("That is not a valid pokemon.");
						player.queue.push(poke.name);
						ctx.sendMessage("Added pokemon to queue");
						record.save().catch((error) => console.error(error));
					}
				);
				break;
			case "remove":
				DraftTimer.findOne(
					{ prefix: ctx.args[0] },
					(error: CallbackError, record: IDraftTimer) => {
						if (!record)
							return ctx.sendMessage(
								"There doesn't seem to be a draft with that prefix."
							);
						const player = record.players.find((x) => x.userId === ctx.userId);
						if (!player) return ctx.sendMessage("You are not in this draft.");
						ctx.args.shift();
						ctx.args.shift();
						const poke = Dex.getSpecies(ctx.args.join(" "));
						if (!poke.exists)
							return ctx.sendMessage("That is not a valid pokemon.");
						player.queue.splice(
							player.queue.findIndex(
								(x) => x.toLowerCase() === poke.name.toLowerCase()
							),
							1
						);
						ctx.sendMessage("Removed pokemon to queue");
						record.save().catch((error) => console.error(error));
					}
				);
				break;
			default:
				DraftTimer.findOne(
					{ prefix: ctx.args[0] },
					(error: CallbackError, record: IDraftTimer) => {
						if (!record)
							return ctx.sendMessage(
								"There doesn't seem to be a draft with that prefix."
							);
						const player = record.players.find((x) => x.userId === ctx.userId);
						if (!player) return ctx.sendMessage("You are not in this draft.");
						embed.setTitle(`Your queue for ${record.leagueName}`);
						embed.setDescription(
							`To add a pokemon to queue, do \`m!q ${record.prefix} add <pokemon name>\`\n` +
								`To remove a pokemon from queue, do \`m!q ${record.prefix} remove <pokemon name>\``
						);
						for (let i = 0; i < player.queue.length; i++) {
							embed.addField(`${i + 1} - ${player.queue[i]}`, "\u200b");
						}
						embed.setColor("RANDOM");
						ctx.sendMessage(embed);
					}
				);
				break;
		}
	},
});
