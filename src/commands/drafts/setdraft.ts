import { createCommand } from "../../utils/helpers";
import { CommandContext, Command } from "../../types/commands";
import { TextChannel, Message, MessageEmbed } from "discord.js";
import DraftTimer, { IDraftTimer } from "../../databases/DraftTimer";
import { CallbackError } from "mongoose";
import { client, logger } from "../..";
import moment from "moment";

createCommand({
	name: "setdraft",
	aliases: ["set"],
	permissions: {
		user: ["MANAGE_GUILD"],
	},
	description: "Sets up the draft.",

	invoke: async (ctx: CommandContext) => {
		DraftTimer.findOne(
			{ channelId: ctx.channelId },
			async (error: CallbackError, record: IDraftTimer) => {
				if (!record) {
					const data: {
						[key: string]: any;
					} = {
						players: [],
					};

					const embed = new MessageEmbed();
					embed.setColor("RANDOM");
					embed.setTitle("Setting up draft...");

					const embedMsg = await ctx.sendMessage(embed);
					return await setup(ctx, data, 0, embed, embedMsg);
				} else {
					return ctx.sendMessage("There is already a draft made.");
				}
			}
		);
	},
});

async function setup(
	ctx: CommandContext,
	data: { [key: string]: any },
	step: number,
	embed: MessageEmbed,
	embedMessage: Message
) {
	switch (step) {
		case 0:
			step = 1;
			await setup(ctx, data, step, embed, embedMessage);
			break;
		case 1:
			embed.setTitle("League Setup");
			embed.setDescription("What is the leagues name?");
			embed.setColor("RANDOM");
			embed.setFooter("To cancel type `m!cancel` at anytime.");
			embedMessage.edit(embed).then(async (msg) => {
				embedMessage = msg;
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");

							DraftTimer.findOne(
								{ leagueName: collected.first()?.content.trim() as string },
								async (error: CallbackError, record: IDraftTimer) => {
									if (error) logger.error(error.message);
									if (record) {
										ctx.sendMessage("That name is already taken");
										return process();
									}
									data[
										"leagueName"
									] = collected.first()?.content.trim() as string;
									step = 2;
									console.log("Set Name");
									return await setup(ctx, data, step, embed, embedMessage);
								}
							);
						});
				};
				process();
			});
			break;
		case 2:
			embed.setDescription(
				`League Name: __**${data["leagueName"]}**__\n` +
					"What is the leagues prefix?"
			);
			embedMessage.edit(embed).then(async (msg) => {
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");
							else {
								DraftTimer.findOne(
									{
										prefix: collected
											.first()
											?.content.toLowerCase()
											.trim() as string,
									},
									async (error: CallbackError, record: IDraftTimer) => {
										if (record) {
											ctx.sendMessage("That prefix is already taken");
											return process();
										} else {
											data[
												"prefix"
											] = collected.first()?.content.trim() as string;
											step = 3;
											return await setup(ctx, data, step, embed, embedMessage);
										}
									}
								);
							}
						});
				};
				process();
			});
			break;
		case 3:
			embed.setDescription(
				`League Name: __**${data["leagueName"]}**__\n` +
					`League Prefix: __**${data["prefix"]}**__\n` +
					"How many rounds are there?"
			);
			embedMessage.edit(embed).then(async (msg) => {
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");
							else {
								const rounds = Number(
									collected.first()?.content.toLowerCase().trim() as string
								);
								if (isNaN(rounds)) {
									ctx.sendMessage("That is not a number.");
									return process();
								} else {
									data["maxRounds"] = rounds;
									step = 4;
									return await setup(ctx, data, step, embed, embedMessage);
								}
							}
						});
				};
				process();
			});
			break;
		case 4:
			embed.setDescription(
				`League Name: __**${data["leagueName"]}**__\n` +
					`League Prefix: __**${data["prefix"]}**__\n` +
					`Total Rounds: __**${data["maxRounds"]}**__\n` +
					"How many skips can a player have befor going on auto skip?"
			);
			embedMessage.edit(embed).then(async (msg) => {
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");
							else {
								const skips = Number(
									collected.first()?.content.toLowerCase().trim() as string
								);
								if (isNaN(skips)) {
									ctx.sendMessage("That is not a number.");
									return process();
								} else {
									data["totalSkips"] = skips;
									step = 5;
									return await setup(ctx, data, step, embed, embedMessage);
								}
							}
						});
				};
				process();
			});
			break;

		case 5:
			embed.setDescription(
				`League Name: __**${data["leagueName"]}**__\n` +
					`League Prefix: __**${data["prefix"]}**__\n` +
					`Total Rounds: __**${data["maxRounds"]}**__\n` +
					`Total Skips: __**${data["totalSkips"]}**__\n` +
					"How long is timer? use `m` for minutes, and `h` for hours. example for 10 minutes, do `10m`, 1 hour do `1h`."
			);
			embedMessage.edit(embed).then(async (msg) => {
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");
							else {
								const time = collected.first()?.content.toLowerCase() as string;
								if (time.includes("m"))
									data["timer"] = Number.parseInt(time.split("m")[0]) * 60000;
								else if (time.includes("h"))
									data["timer"] = Number.parseInt(time.split("h")[0]) * 3600000;
								else if (!time.includes("m") || time.includes("h")) {
									ctx.sendMessage(
										"That is not a valid time. Please use m for minutes, and h for hours."
									);
									return process();
								}

								step = 6;
								return await setup(ctx, data, step, embed, embedMessage);
							}
						});
				};
				process();
			});
			break;
		case 6:
			embed.setDescription(
				`League Name: __**${data["leagueName"]}**__\n` +
					`League Prefix: __**${data["prefix"]}**__\n` +
					`Total Rounds: __**${data["maxRounds"]}**__\n` +
					`Total Skips: __**${data["totalSkips"]}**__\n` +
					`Timer: __**${
						Number.parseInt(data["timer"]) / 60000 >= 60
							? `${Number.parseInt(data["timer"]) / 3600000} hours`
							: `${Number.parseInt(data["timer"]) / 60000} minutes`
					}**__\n` +
					"Please ping all of the players that will be playing.\n" +
					"You can ping them all at once, or one at a time.\n" +
					"If you are done, type `save` to finsih setting up the league."
			);
			embedMessage.edit(embed).then(async (msg) => {
				const process = () => {
					msg.channel
						.awaitMessages(async (m: Message) => m.author.id === ctx.userId, {
							max: 1,
						})
						.then(async (collected) => {
							if (
								collected.first()?.content.toLowerCase().trim() === "m!cancel"
							)
								return ctx.sendMessage("Canceling");
							else {
								if (
									collected.first()?.content.toLowerCase().trim() === "save"
								) {
									step = 7;
									return await setup(ctx, data, step, embed, embedMessage);
								} else if (collected.first()?.mentions.users.size === 0) {
									ctx.sendMessage("Please ping a player.");
									return process();
								} else {
									collected.first()?.mentions.users.forEach((member) => {
										data.players.push({
											userId: member.id,
											pokemon: [],
											order: data.players.length + 1,
											skips: 0,
											queue: [],
										});
										embed.addField(
											`Player __**${member.username}**__`,
											`Order: **${data.players.length}**`
										);
										embedMessage.edit(embed);
									});
									return process();
								}
							}
						});
				};
				process();
			});
			break;
		case 7:
			embedMessage.edit(embed).then(async (msg) => {
				DraftTimer.create({
					leagueName: data["leagueName"],
					prefix: data["prefix"],
					maxRounds: data["maxRounds"],
					totalSkips: data["totalSkips"],
					pokemon: [],
					players: data["players"],
					round: 1,
					currentPlayer: data.players[0].userId,
					sheetId: "none",
					direction: "down",
					channelId: ctx.channelId,
					serverId: ctx.guildId,
					timer: data["timer"],
					modes: {
						dm: true,
						skips: true,
						text: true,
					},
				})
					.then(() => {
						embed = new MessageEmbed();
						embed.setColor("GREEN");
						embed.setTitle("Created draft.");
						embed.setDescription(
							"You can now start the draft by using the `startdraft` command."
						);
						embedMessage.edit(embed);
					})
					.catch((error) => {
						embed = new MessageEmbed();
						embed.setColor("RED");
						embed.setTitle("An error has occured when creating your draft.");
						embed.setDescription(
							"Please screen shot this message, and paste it into #bug-and-reports channel of my support server.\n" +
								`\`\`\`${error}\`\`\``
						);

						embedMessage.edit(embed);
					});
			});
			break;
	}
}
