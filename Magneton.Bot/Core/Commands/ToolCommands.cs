using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using Magneton.Bot.Core.Utils;
using PokeApiNet;

namespace Magneton.Bot.Core.Commands
{
    public class ToolCommands : BaseCommandModule
    {
        [Command("dex")]
        public async Task DexCommand(CommandContext ctx, params string[] search)
        {
            var pokeClient = new PokeApiClient();
            var str = string.Empty;
            foreach (var word in search)
            {
                str += word + " ";
            }

            str = str.Trim();
            var name = PokemonUtils.ResolveName(str);
            Console.WriteLine(name);
            var pokemon = await pokeClient.GetResourceAsync<Pokemon>(name).ConfigureAwait(false);
            var specie = await pokeClient.GetResourceAsync<PokemonSpecies>(pokemon.Species.Name).ConfigureAwait(false);
            Console.WriteLine(pokemon.Name);
            var builder = new DiscordEmbedBuilder();

            builder.WithImageUrl(pokemon.Sprites.FrontDefault);
            builder.WithTitle(pokemon.Name);
            builder.WithDescription($"Type: {(pokemon.Types.Count > 1 ? $"{pokemon.Types[0].Type.Name} | {pokemon.Types[1].Type.Name}" : $"{pokemon.Types[0].Type.Name}")}\n" +
               $"Dex Entry: {specie.FlavorTextEntries.Find(x => x.Language.Name == "en").FlavorText}");

            builder.AddField("Base Stats",
                $"**__HP__: {pokemon.Stats[0].BaseStat}**\n" +
                $"**__ATK__: {pokemon.Stats[1].BaseStat}**\n" +
                $"**__DEF__: {pokemon.Stats[2].BaseStat}**\n" +
                $"**__SPATK__: {pokemon.Stats[3].BaseStat}**\n" +
                $"**__SPDEF__: {pokemon.Stats[4].BaseStat}**\n" +
                $"**__SPE__: {pokemon.Stats[5].BaseStat}**", true);

            await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
        }
    }
}