import { createCommand } from "../../utils/helpers";
import { CommandContext } from "../../types/commands";
import { TeamStorageSystem } from "../../systems/TeamStorageSystem";
import { PokemonSet, Sets } from "@pkmn/sets";
import { MessageEmbed } from "discord.js";

createCommand({
	name: "addteam",
	aliases: ["at"],
	description: "Allows you to store a team in your PC.",
	usages: ["m!addteam <team paste>", "m!addteam <pokepast>"],
	invoke: async (ctx: CommandContext) => {
		if (!ctx.args.length)
			return ctx.sendMessage(
				"Please try again, but provide the team paste, or pokepaste url."
			);
		const team = new TeamStorageSystem(ctx);
		let data: PokemonSet[] = [];
		let name = "";
		// test url: https://pokepast.es/afe6dc1114e50762
		// if the argument is a pokepaste url.
		if (ctx.args[0].startsWith("https://pokepast.es")) {
			const url = ctx.args[0];
			const result = await team.getDataFromPokePaste(url);
			if (result.success) {
				data = result.paste!;
				name = result.name!;
			} else {
				const embed = new MessageEmbed();
				embed.setTitle(
					"There was an error when trying to parse this team from pokepaste."
				);
				embed.setDescription(result.reason!);
				embed.setColor("RED");
				return ctx.sendMessage(embed);
			}
			console.debug(data);
		}
		// assuming that the argument is a raw team paste.
		else {
			const name = ctx.args.join(" ").split(",").shift();
			const str = ctx.args.join(" ");
			const pokemons = str.split("\n\n");
			data = [];
			pokemons.forEach((pokemon) => {
				data.push(Sets.fromString(pokemon));
			});
		}
		console.debug(name);
		console.debug(data);
		await team.newTeam(data, name);
	},
});
