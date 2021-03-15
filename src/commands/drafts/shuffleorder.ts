/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { MessageEmbed } from "discord.js";
import { CallbackError } from "mongoose";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";

createCommand({
	name: "shuffleorder",
	aliases: ["shuffle"],
	description:
		"Randomizes the Draft order. use this in the channel that you set up the draft in.",
	usages: ["m!shuffleorder", "m!shuffle"],
	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			(err: CallbackError, record: IDraftTimer) => {
				if (!record)
					return ctx.sendMessage(
						`Please set up the draft, by using the \`setdraft\` command.`
					);
				const players: string[] = [];
				record.players.forEach((x) => players.push(x.userId));
				const shuffled = shuffle(players);

				shuffled.forEach((id) => {
					const player = record.players.find((x) => x.userId === id);
					if (player?.order !== null)
						player!.order = shuffled.findIndex((x) => x === id) + 1;
				});
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				record.currentPlayer = record.players.find(
					(x) => x.order === 1
				)?.userId!;
				const embed = new MessageEmbed()
					.setTitle(`Randomized Order`)
					.setDescription(`This is now the new draft order.`);

				record.save().catch((error) => console.error(error));

				record.players
					.sort((a, b) => a.order - b.order)
					.forEach((x) =>
						embed.addField(
							`Player ${ctx.guild?.member(x.userId)?.user.username}`,
							`Draft Order: ${x.order}`
						)
					);
				ctx.sendMessage(embed);
			}
		);
	},
});

function shuffle(arr: string[]) {
	let currentIndex = arr.length,
		temp,
		random;
	while (0 !== currentIndex) {
		random = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temp = arr[currentIndex];
		arr[currentIndex] = arr[random];
		arr[random] = temp;
	}

	return arr;
}
