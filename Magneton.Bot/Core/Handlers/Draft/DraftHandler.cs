using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity.Extensions;
using Magneton.Bot.Core.Database;
using Magneton.Bot.Core.Database.Schemas;
using Magneton.Bot.Core.Utils;
using MongoDB.Bson;
using MongoDB.Driver;
using PokeApiNet;

namespace Magneton.Bot.Core.Handlers.Draft
{
    public class DraftHandler
    {
        private DiscordClient _client;
        private DiscordChannel _draftingChannel;
        private DiscordChannel _draftChannel;
        private DiscordMember _currentPlayer;
        private DiscordRole _role;

        private FilterDefinition<BsonDocument> Filter;

        public DraftHandler(DiscordClient client, DiscordChannel draftingChannel, DiscordChannel draftChannel, DiscordMember currentPlayer, BsonDocument draft, DiscordRole role)
        {
            _client = client;
            _draftingChannel = draftingChannel;
            _draftChannel = draftChannel;
            _currentPlayer = currentPlayer;
            _role = role;
            Filter = Builders<BsonDocument>.Filter.Eq("channel_id", _draftChannel.Id.ToString());
        }

        public async Task<BsonDocument> GetData()
        {
            return await MongoHelper.Draft.GetAsync(Filter);
        }

        public async Task StopDraft(CommandContext ctx)
        {
            await _draftChannel.SendMessageAsync("Draft stopped. you can pick up from where you last left off on.")
                .ConfigureAwait(false);
            await UpdateField((doc) =>
            {
                doc["stop"] = false;
                return doc;
            });
        }

        public async Task UpdateField(Func<BsonDocument, BsonDocument> callback)
        {
            Data = callback(Data);
        }

        public BsonDocument Data
        {
            get
            {
                return GetData().GetAwaiter().GetResult();
            }
            
            set
            {
                MongoHelper.Draft.UpdateAsync(Filter, value).GetAwaiter().GetResult();
            }
        }
        
        public async Task StartDraft(CommandContext ctx)
        {
            if (Data["stop"].AsBoolean)
            {
                await StopDraft(ctx);
                return;
            }

            if (Data["round"].AsInt32 == 0) await UpdateField((doc) =>
            {
                doc["round"] = doc["round"].AsInt32 + 1;
                return doc;
            });
            var onClockEmbed = new DiscordEmbedBuilder()
            {
                Description = $"{_currentPlayer.Mention} is on the clock.\nTimer: {(await GetData())["timer"]} minutes.",
                Color = DiscordColor.Orange,
                //Footer =
                //{
                //    Text = $"Pick {_draft["players"].AsBsonArray.FirstOrDefault(x => x.AsBsonDocument["user_id"] == _draft["current_player"])?.AsBsonDocument["order"].AsInt32} of Round {_draft["round"]} / {_draft["max_rounds"]}"
                //}
            };
            await _draftChannel.SendMessageAsync(embed: onClockEmbed.Build()).ConfigureAwait(false);
            var current = Data["players"].AsBsonArray
                .FirstOrDefault(x => x.AsBsonDocument["user_id"] == Data["current_player"]);
            if (current?["order"].AsInt32 == Data["players"].AsBsonArray.Count || current?["order"].AsInt32 == 1)
                await GetPick(ctx);
            else
                await GetWheelPick(ctx);
        }

        public async Task<Pokemon> GetPokemon(string name)
        {
            var pokeClient = new PokeApiClient();
            var pokemon =
                await pokeClient.GetResourceAsync<Pokemon>(
                    PokemonUtils.ResolveName(name)).ConfigureAwait(false);
            return pokemon;
        }
        public async Task<bool> DoesPokemonExist(string name)
        {
            // Since PokeApiNet doesn't actually handle when a pokemon doesn't exist, means I have to make my own.
            var client = new HttpClient();
            // https://pokeapi.co/api/v2/pokemon/ditto
            client.BaseAddress = new Uri("https://pokeapi.co/api/v2/");
            var version = typeof(PokeApiClient).Assembly.GetName().Version;
            var userAgent = new ProductHeaderValue("PokeApiNet", $"{version.Major}.{version.Minor}");
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue(userAgent));
            var result = await client.GetAsync($"pokemon/{PokemonUtils.ResolveName(name)}", CancellationToken.None);
            if (result.Content.ReadAsStringAsync().Result.Equals("Not Found")) return false;
            return true;
        }

        public async Task GetWheelPick(CommandContext ctx)
        {
            // Asks for the first pick, then the second pick.
            var pokemon1 = string.Empty;
            var pokemon2 = string.Empty;
            // Pick 1
            while (true)
            {
                var response = await WaitForPick(ctx);
                if (response.TimedOut)
                {
                    break;
                }
                else
                {
                    if (await DoesPokemonExist(PokemonUtils.ResolveName(response.Content)).ConfigureAwait(false))
                    {
                        await _draftingChannel.SendMessageAsync(
                                "The requested pokemon doesn't seem to exist. Please pick a valid pokemon.")
                            .ConfigureAwait(false);
                        continue;
                    }
                    else
                    {
                        if (CheckIfPokemonHasAlreadyBeenDrafted(PokemonUtils.ResolveName(response.Content)))
                        {
                            await _draftingChannel.SendMessageAsync(
                                "That pokemon is already drafted. Please pick another pokemon.").ConfigureAwait(false);
                            continue;
                        }
                        else
                        {
                            pokemon1 = PokemonUtils.ResolveName(response.Content);
                            break;
                        }
                    }
                }
            }

            await _draftChannel.SendMessageAsync("What is your second pick?").ConfigureAwait(false);
            // Pick 2
            while (true)
            {
                var response = await WaitForPick(ctx);
                if (response.TimedOut)
                {
                    break;
                }
                else
                {
                    if (await DoesPokemonExist(PokemonUtils.ResolveName(response.Content)).ConfigureAwait(false))
                    {
                        await _draftingChannel.SendMessageAsync(
                                "The requested pokemon doesn't seem to exist. Please pick a valid pokemon.")
                            .ConfigureAwait(false);
                        continue;
                    }
                    else
                    {
                        if (CheckIfPokemonHasAlreadyBeenDrafted(PokemonUtils.ResolveName(response.Content)))
                        {
                            await _draftingChannel.SendMessageAsync(
                                "That pokemon is already drafted. Please pick another pokemon.").ConfigureAwait(false);
                            continue;
                        }
                        else
                        {
                            pokemon2 = PokemonUtils.ResolveName(response.Content);
                            break;
                        }
                    }
                }
            }

            await UpdateField(doc =>
            {
                var current = doc["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["user_id"] == doc["current_player"])?.AsBsonDocument;
                current?["pokemon"].AsBsonArray.Add(pokemon1);
                current?["pokemon"].AsBsonArray.Add(pokemon2);
                return doc;
            }).ConfigureAwait(false);
            
            var embed1 = new DiscordEmbedBuilder
            {
                Description = $"{_currentPlayer.Mention}, has drafted {pokemon1}",
                Color = DiscordColor.Green,
                ImageUrl = $"https://pokemonshowdown.com/sprites/ani/{pokemon1}.gif"
            };

            await _draftChannel.SendMessageAsync(embed: embed1.Build()).ConfigureAwait(false);
            
            var embed2 = new DiscordEmbedBuilder
            {
                Description = $"{_currentPlayer.Mention}, has drafted {pokemon2}",
                Color = DiscordColor.Green,
                ImageUrl = $"https://pokemonshowdown.com/sprites/ani/{pokemon2}.gif"
            };

            await _draftChannel.SendMessageAsync(embed: embed2.Build()).ConfigureAwait(false);
            await NextPlayer(ctx);
        }

        public async Task<PickResult> WaitForPick(CommandContext ctx)
        {
            var interactivity = _client.GetInteractivity();
            var response = await interactivity.WaitForMessageAsync(x =>
            {
                return x.Author == _currentPlayer && x.Channel == _draftingChannel;
            });

            if (response.TimedOut) return new PickResult {Content = string.Empty, TimedOut = true};
            return new PickResult {Content = response.Result.Content, TimedOut = false};
        }

        public bool CheckIfPokemonHasAlreadyBeenDrafted(string name)
        {
            var pokemons = Data["pokemons"].AsBsonArray;
            var drafted = false;
            foreach (var pokemon in pokemons)
            {
                if (pokemon.AsString == name) drafted = true;
            }

            return drafted;
        }



        public async Task GetPick(CommandContext ctx)
        {
            // Asks for one pick.
            await _draftingChannel.SendMessageAsync(
                $"{_currentPlayer.Mention}, its your turn. type your pick in this channel.").ConfigureAwait(false);
            var next = false;
            var pokemon = "";
            while (true)
            {
                var result = await WaitForPick(ctx);
                if (result.TimedOut)
                {
                    break;
                }
                else
                {
                    var doesExist = await DoesPokemonExist(result.Content);
                    if (!doesExist)
                    {
                        await _draftingChannel.SendMessageAsync(
                            "The pokemon you requested doesn't seem to exist. Please pick a valid pokemon.");
                        continue;
                    }
                    else
                    {
                        pokemon = PokemonUtils.ResolveName(result.Content);
                        if (CheckIfPokemonHasAlreadyBeenDrafted(pokemon))
                        {
                            await _draftingChannel.SendMessageAsync(
                                "That pokemon has already been drafted. Please pick another pokemon.");
                            continue;
                        }
                        else
                        {
                            break;
                        }

                    }
                }
            }

            await UpdateField(doc =>
            {
                var current = doc["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["user_id"] == doc["current_player"]);
                current?.AsBsonDocument["pokemon"].AsBsonArray.Add(pokemon);
                doc["pokemons"].AsBsonArray.Add(pokemon);
                return doc;
            }).ConfigureAwait(false);
            
            var embed = new DiscordEmbedBuilder
            {
                Description = $"{_currentPlayer.Mention}, has drafted {pokemon}",
                Color = DiscordColor.Green,
                ImageUrl = $"https://pokemonshowdown.com/sprites/ani/{pokemon}.gif"
            };

            await _draftChannel.SendMessageAsync(embed: embed.Build()).ConfigureAwait(false);
            await NextPlayer(ctx).ConfigureAwait(false);
        }

        public async Task NextPlayer(CommandContext ctx)
        {
            var order = 0;
            await UpdateField((doc) =>
            {
                Console.WriteLine(doc["players"].AsBsonArray.Count);
                if (doc["players"].AsBsonArray.Count == 1)
                {
                    doc["round"] = doc["round"].AsInt32 + 1;
                    order = 1;
                }
                // UP = 1 -> 16
                // DOWN = 16 -> 1
                else if (doc["direction"].AsString.ToUpper().Equals("UP"))
                {
                    Console.WriteLine("Something");
                    var currentPlayer = doc["players"].AsBsonArray
                        .FirstOrDefault(y => y.AsBsonDocument["user_id"] == _currentPlayer.Id.ToString());
                    Console.WriteLine(currentPlayer?.AsBsonDocument["order"].AsInt32);
                    if (currentPlayer?.AsBsonDocument["order"].AsInt32 == doc["players"].AsBsonArray.Count)
                    {
                        doc["direction"] = "down";
                        order = currentPlayer.AsBsonDocument["order"].AsInt32;
                        doc["round"] = doc["round"].AsInt32 + 1;
                    }
                    else
                    {
                        Console.WriteLine("Current Player");
                        if (currentPlayer is null) order = 1;
                        else order = currentPlayer.AsBsonDocument["order"].AsInt32 + 1;
                    }
                    
                }
                else if (doc["direction"].AsString.ToUpper().Equals("DOWN"))
                {
                    var currentPlayer = doc["players"].AsBsonArray
                        .FirstOrDefault(y => y.AsBsonDocument["user_id"] == _currentPlayer.Id.ToString());
                    if (currentPlayer?.AsBsonDocument["order"].AsInt32 == 1)
                    {
                        doc["direction"] = "up";
                        order = currentPlayer.AsBsonDocument["order"].AsInt32;
                        doc["round"] = doc["round"].AsInt32 + 1;
                    }
                    else
                    {
                        if (currentPlayer is null) order = 1;
                        else order = currentPlayer.AsBsonDocument["order"].AsInt32 - 1;
                    }
                }

                doc["current_player"] = doc["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["order"].AsInt32 == order)?.AsBsonDocument["user_id"];
                return doc;
            });
            
            var member = await ctx.Guild.GetMemberAsync(_currentPlayer.Id);
            await member.RevokeRoleAsync(_role);
            Console.WriteLine(order);
            Console.WriteLine(Data["current_player"]);
            _currentPlayer = await ctx.Guild.GetMemberAsync(ulong.Parse(Data["current_player"].AsString));
            
            member = await ctx.Guild.GetMemberAsync(_currentPlayer.Id);
            await member.GrantRoleAsync(_role);
            
            await StartDraft(ctx);
           
        }
    }

    public struct PickResult
    {
        public bool TimedOut { get; set; }
        public string Content { get; set; }
    }
}