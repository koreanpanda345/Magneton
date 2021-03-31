import { MessageEmbed } from "discord.js";
import moment from "moment";
import { CallbackError } from "mongoose";

import { client } from "../..";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CommandContext } from "../../types/commands";
import { createCommand } from "../../utils/helpers";

createCommand({
	name: "draft",
	aliases: ["d"],
	description:
		"Displays all the players picks currently for a draft, by the league prefix.",
	usages: ["m!draft <league prefix>", "m!d <league prefix>"],
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
				embed.setTitle(`Draft: ${record.league_name}`);
				const time = moment(record.timer);
				embed.setDescription(
					`League Prefix: ${record.prefix}\nTimer: ${
						record.pause === true
							? "Timer is Off"
							: time.minutes() > 60
							? `${time.hours()} hours`
							: `${time.minutes()} minutes`
					}\nTotal Skips: ${record.total_skips}\nOn pick ${
						record.players.find((x) => x.user_id === record.current_player)
							?.order
					} of ${record.round} / ${record.max_rounds} Rounds`
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
						`Player ${(await client.users.fetch(player.user_id)).username}`,
						`Pokemon:\n${desc}`
					);
				}

				ctx.sendMessage(embed);
			}
		);
	},
});
