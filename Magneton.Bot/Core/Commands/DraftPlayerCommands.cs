using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using Magneton.Bot.Core.Database;
using Magneton.Bot.Core.Utils;
using MongoDB.Bson;
using MongoDB.Driver;
using PokeApiNet;

namespace Magneton.Bot.Core.Commands
{
    public class DraftPlayerCommands : BaseCommandModule
    {
        [Group("queue"), Aliases("q")]
        public class QueueCommands : BaseCommandModule
        {
            [GroupCommand]
            [RequireDirectMessage]
            public async Task QueueCommand(CommandContext ctx, int id)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("id", id);
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                var player = draft["players"].AsBsonArray.FirstOrDefault(x => x["user_id"] == ctx.User.Id.ToString())
                    ?.AsBsonDocument;
                if (player is null)
                {
                    await ctx.Channel.SendMessageAsync("Sorry, but you are not in the draft.");
                    return;
                }

                var queue = player["queue"].AsBsonArray;
                var pokemons = new List<string>();
                foreach (var pokemon in queue)
                {
                    pokemons.Add(pokemon.AsString);
                }

                var builder = new DiscordEmbedBuilder
                {
                    Title = $"Your queue for {draft["league_name"]}",
                    Color = DiscordColor.Green,
                    Description = "You can remove, and add pokemon to your queue."
                };

                foreach (var pokemon in pokemons)
                {
                    builder.AddField($"- {pokemon}", "\u200b", false);
                }

                await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
            }

            [Command("add")]
            [Description("Adds a pokemon to the queue.")]
            [Aliases("a")]
            [RequireDirectMessage]
            public async Task AddPokemonToQueueCommand(CommandContext ctx, int id, params string[] pokemon)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("id", id);
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);

                var player = draft["players"].AsBsonArray.FirstOrDefault(x => x["user_id"] == ctx.User.Id.ToString())
                    ?.AsBsonDocument;
                if (player is null)
                {
                    await ctx.Channel.SendMessageAsync("Sorry, but you are not in the draft.");
                    return;
                }

                var queue = player["queue"].AsBsonArray;

                var pokeClient = new PokeApiClient();
                var str = string.Empty;
                foreach (var word in pokemon)
                {
                    str += word + " ";
                }

                str = str.Trim();
                var name = PokemonUtils.ResolveName(str);
                Console.WriteLine(name);

                var result = await PokemonUtils.DoesPokemonExist(name);
                if (!result)
                {
                    await ctx.Channel.SendMessageAsync("That doesn't seem to be a pokemon. Try again.")
                        .ConfigureAwait(false);
                    return;
                }

                var poke = await pokeClient.GetResourceAsync<Pokemon>(name);

                if (queue.Contains(poke.Name))
                {
                    await ctx.Channel.SendMessageAsync("That pokemon is already in the queue.");
                    return;
                }

                if (draft["pokemons"].AsBsonArray.Contains(poke.Name))
                {
                    await ctx.Channel.SendMessageAsync("That pokemon has already been drafted").ConfigureAwait(false);
                    return;
                }

                queue.Add(poke.Name);
                await MongoHelper.Draft.UpdateAsync(filter, draft);

                await ctx.Channel.SendMessageAsync("Added pokemon to the queue");
            }

            [Command("remove")]
            [Aliases("r")]
            [Description("Removes a pokemon from the queue.")]
            [RequireDirectMessage]
            public async Task RemovePokemonFromQueueCommand(CommandContext ctx, int id, params string[] pokemon)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("id", id);
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);

                var player = draft["players"].AsBsonArray.FirstOrDefault(x => x["user_id"] == ctx.User.Id.ToString())
                    ?.AsBsonDocument;
                if (player is null)
                {
                    await ctx.Channel.SendMessageAsync("Sorry, but you are not in the draft.");
                    return;
                }

                var queue = player["queue"].AsBsonArray;

                var pokeClient = new PokeApiClient();
                var str = string.Empty;
                foreach (var word in pokemon)
                {
                    str += word + " ";
                }

                str = str.Trim();
                var name = PokemonUtils.ResolveName(str);
                Console.WriteLine(name);

                var result = await PokemonUtils.DoesPokemonExist(name);
                if (!result)
                {
                    await ctx.Channel.SendMessageAsync("That doesn't seem to be a pokemon. Try again.")
                        .ConfigureAwait(false);
                    return;
                }

                var poke = await pokeClient.GetResourceAsync<Pokemon>(name);

                if (!queue.Contains(poke.Name))
                {
                    await ctx.Channel.SendMessageAsync("That pokemon is not in the queue.").ConfigureAwait(false);
                    return;
                }

                queue.Remove(poke.Name);
                await MongoHelper.Draft.UpdateAsync(filter, draft);

                await ctx.Channel.SendMessageAsync("Removed pokemon from the queue");
            }

        }
    }
}