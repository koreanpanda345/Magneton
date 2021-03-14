import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";
import moment from "moment";
import { client } from "../..";

createCommand({
	name: "draft",
	aliases: ["d"],
	description:
		"Displays all the players picks currently for a draft, by the league prefix.",
	invoke: async (ctx: CommandContext) => {
		const prefix = ctx.args.join(" ").trim();
		DraftTimer.findOne(
			{ prefix },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						"There doesn't seem like there is a draft under that prefix."
					);
				const embed = new MessageEmbed();
				embed.setTitle(`Draft: ${record.leagueName}`);
				const time = moment(record.timer);
				embed.setDescription(
					`League Prefix: ${record.prefix}\nTimer: ${
						record.pause === true
							? "Timer is Off"
							: time.minutes() > 60
							? `${time.hours()} hours`
							: `${time.minutes()} minutes`
					}\nTotal Skips: ${record.totalSkips}\nOn pick ${
						record.players.find((x) => x.userId === record.currentPlayer)?.order
					} of ${record.round} / ${record.maxRounds} Rounds`
				);
				embed.setColor("RANDOM");
				for (const player of record.players) {
					let desc = "";
					for (const pokemon of player.pokemon) {
						desc += `Round ${
							player.pokemon.findIndex((x) => x === pokemon) + 1
						} - ${pokemon}\n`;
					}
					embed.addField(
						`Player ${(await client.users.fetch(player.userId)).username}`,
						`Pokemon:\n${desc}`
					);
				}

				ctx.sendMessage(embed);
			}
		);
	},
});
