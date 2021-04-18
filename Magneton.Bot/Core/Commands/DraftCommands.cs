using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity;
using DSharpPlus.Interactivity.Extensions;
using Magneton.Bot.Core.Database;
using Magneton.Bot.Core.Database.Schemas;
using Magneton.Bot.Core.Handlers.Dialogue;
using Magneton.Bot.Core.Handlers.Dialogue.Steps;
using Magneton.Bot.Core.Handlers.Draft;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Commands
{
    [Group("draft"), Aliases("d")]
    public class DraftCommands : BaseCommandModule
    {
        [GroupCommand]
        [Description("Gets the information about the draft by the league prefix.")]
        public async Task DraftCommand(CommandContext ctx, int id)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("id", id);
            var data = MongoHelper.GetData(filter);

            var model = new DraftTimerSchema(data);
            Console.WriteLine(data["league_name"].AsString);
            var builder = new DiscordEmbedBuilder
            {
                Title = $"League: {data["league_name"].AsString}",
                Color = DiscordColor.Green,
                Description = $"Timer: {data["timer"].AsInt32} minutes"
            };

            foreach (var player in data["players"].AsBsonArray)
            {
                var desc = string.Empty;
                foreach (var pokemon in player.AsBsonDocument["pokemon"].AsBsonArray)
                {
                    desc += $"- {pokemon.AsString}\n";
                }

                builder.AddField($"Player: {(await ctx.Client.GetUserAsync(ulong.Parse(player.AsBsonDocument["user_id"].AsString))).Username}", string.IsNullOrWhiteSpace(desc) ? "\u200b" : desc);
            }

            await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
        }

        [Command("stop")]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageRoles)]
        [Description("Stops the draft.")]
        public async Task StopDraftCommand(CommandContext ctx)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
            var draft = MongoHelper.GetData(filter);

            draft["stop"] = true;

            await MongoHelper.UpdateDocument(filter, draft);
        }

        [Command("start")]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageRoles)]
        [Aliases("s")]
        [Description("Starts the draft")]
        public async Task StartDraftCommand(CommandContext ctx)
        {
            await ctx.Channel.TriggerTypingAsync().ConfigureAwait(false);

            var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
            var draft = MongoHelper.GetData(filter);
            Console.WriteLine(draft["league_name"]);
            Console.WriteLine(draft["current_player"].AsString);
            var currentPlayer = ulong.Parse(draft["current_player"].AsString);
            Console.WriteLine("something");
            var player = await ctx.Guild.GetMemberAsync(currentPlayer);
            var draftRole = ctx.Guild.GetRole(ulong.Parse(draft["drafting_role_id"].AsString));
            
            await player.GrantRoleAsync(draftRole);

            var draftingChannel = ctx.Guild.GetChannel(ulong.Parse(draft["drafting_channel_id"].AsString));
            var draftChannel = ctx.Guild.GetChannel(ulong.Parse(draft["channel_id"].AsString));
            
            var handler = new DraftHandler(ctx.Client, draftingChannel, draftChannel, player, draft, draftRole);
            await ctx.Channel.SendMessageAsync("Starting Draft").ConfigureAwait(false);
            await handler.StartDraft(ctx);


        }
        
        [Command("randomize")]
        [RequireGuild]
        [RequirePermissions(Permissions.ManageGuild)]
        [Aliases("random", "r")]
        [Description("Randomizes the order for the draft.")]
        public async Task RandomizeOrderCommand(CommandContext ctx)
        {
            await ctx.Channel.SendMessageAsync("Not yet implemented.").ConfigureAwait(false);
        }

        [Command("create")]
        [RequireGuild]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageChannels | Permissions.ManageRoles)]
        [Aliases("c")]
        [Description("This command will set the draft up. Follow the dialogue to set the draft up.")]
        public async Task CreateDraftCommand(CommandContext ctx)
        {
            var name = string.Empty;
            var id = 0;
            var round = 0;
            var skips = 0;
            var timer = 0;
            var hasRole = false;
            var hasChannel = false;
            var drafts = MongoHelper.database.GetCollection<BsonDocument>("drafttimers");
            var getChannelStep = new ChannelStep("What is the channel?", null);
            var hasChannelStep = new ReactionStep("Do you have a channel made? If not I will make one for you.",
                new Dictionary<DiscordEmoji, ReactionStepData>()
                {
                    {
                        DiscordEmoji.FromName(ctx.Client, ":thumbsup:"), new ReactionStepData()
                        {
                            Content = "This means you do have a channel made.",
                            NextStep = getChannelStep
                        }
                    },
                    {
                        DiscordEmoji.FromName(ctx.Client, ":thumbsdown:"), new ReactionStepData()
                        {
                            Content = "This means you don't have a channel made. I will make one for you.",
                            NextStep = null
                        }
                    }
                });
            var getRoleStep = new RoleStep("What is the role?", hasChannelStep);
            var hasRoleStep = new ReactionStep("Do you have a role made? If not I will make one for you.",
                new Dictionary<DiscordEmoji, ReactionStepData>()
                {
                    {
                        DiscordEmoji.FromName(ctx.Client, ":thumbsup:"), new ReactionStepData()
                        {
                            Content = "Yes you have one",
                            NextStep = getRoleStep
                        }
                    },
                    {
                        DiscordEmoji.FromName(ctx.Client, ":thumbsdown:"), new ReactionStepData()
                        {
                            Content = "This means you don't have one. So I will make the role.",
                            NextStep = hasChannelStep
                        }
                    }
                });
            var timerStep = new IntStep("How many mintues will timer be?", null);
            var skipStep = new IntStep("How many skips can a player have before going on auto skip?", null, 0, 5);
            var roundStep = new IntStep("How many rounds are there?", null, 9, 12);
            var searchNameList = new List<string>();

            foreach (var draft in drafts.Find(new BsonDocument()).ToList())
            {
                searchNameList.Add(draft["league_name"].AsString);
                Console.WriteLine(draft["league_name"].AsString);
            }

            id = drafts.Find(new BsonDocument()).ToList().Count + 1;
            var nameStep = new TextStep("What is the league's name?", null, 3, null, searchNameList.ToArray(),
                "There is already a league with that name.");
            var dialogue = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, nameStep);
            nameStep.OnValidResult += result =>
            {
                name = result;
                nameStep.SetNextStep(roundStep);
            };

            roundStep.OnValidResult += result =>
            {
                round = result;
                roundStep.SetNextStep(skipStep);
            };

            skipStep.OnValidResult += result =>
            {
                skips = result;
                skipStep.SetNextStep(timerStep);
            };

            timerStep.OnValidResult += result =>
            {
                timer = result;
                timerStep.SetNextStep(hasRoleStep);
            };

            hasRoleStep.OnValidResult += result => { Console.WriteLine(result.Name); };

            hasChannelStep.OnValidResult += result => { Console.WriteLine(result.Name); };

            DiscordRole role = null;
            getRoleStep.OnValidResult += result =>
            {
                role = result;
                hasRole = true;
            };

            DiscordChannel channel = null;
            getChannelStep.OnValidResult += result =>
            {
                channel = result;
                hasChannel = true;
            };

            bool succeeded = await dialogue.ProcessDialogue().ConfigureAwait(false);
            Console.WriteLine(succeeded);
            if (!succeeded) return;
            
            await ctx.Channel.TriggerTypingAsync().ConfigureAwait(false);

            if (!hasRole)
            {
                if (ctx.Guild.Roles.Values.FirstOrDefault(x => x.Name == $"{name} Draft Role") is null)
                {
                    await ctx.Guild.CreateRoleAsync($"{name} Draft Role");
                }

                role = ctx.Guild.Roles.Values.FirstOrDefault(x => x.Name == $"{name} Draft Role");
            }

            if (!hasChannel)
            {
                if (ctx.Guild.Channels.Values.FirstOrDefault(x =>
                    x.Name == $"{name.ToLower().Replace(" ", "-")}-drafting") is null)
                {
                    var overwrites = new List<DiscordOverwriteBuilder>();

                    foreach (var guildRole in ctx.Guild.Roles.Values)
                    {
                        if(guildRole != role)
                            overwrites.Add(new DiscordOverwriteBuilder().Deny(Permissions.SendMessages).For(guildRole));
                        else overwrites.Add(new DiscordOverwriteBuilder().Allow(Permissions.SendMessages).For(ctx.Guild.CurrentMember));
                    }

                    overwrites.Add(new DiscordOverwriteBuilder().Allow(Permissions.SendMessages).For(role));

                    channel = await ctx.Guild.CreateTextChannelAsync(
                        $"{name.ToLower().Replace(" ", "-")}-drafting",
                        ctx.Channel.Parent,
                        "Type your pick in when it is your turn.",
                        overwrites);
                }
            }

            var doc = new BsonDocument
            {
                {"league_name", name},
                {"id", id},
                {"max_rounds", round},
                {"total_skips", skips},
                {"server_id", ctx.Guild.Id.ToString()},
                {"channel_id", ctx.Channel.Id.ToString()},
                {"drafting_channel_id", channel.Id.ToString()},
                {"drafting_role_id", role.Id.ToString()},
                {
                    "modes", new BsonDocument
                    {
                        {"dm", true},
                        {"skips", true},
                        {"text", true}
                    }
                },
                {"players", new BsonArray()},
                {"pokemons", new BsonArray()},
                {"round", 0},
                {"pause", false},
                {"timer", timer},
                {"direction", "up"},
                {"current_player", ""},
                {"stop", false}
            };

            await MongoHelper.InsertDocument(doc);

            await ctx.Channel
                .SendMessageAsync(
                    $"Successfully made the draft. Your league's id is `{id}`. Use this id when you are using any draft command that is outside the draft/drafting channel.")
                .ConfigureAwait(false);


        }
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireGuild]
        [RequireBotPermissions(Permissions.ManageChannels | Permissions.ManageRoles)]
        [Command("delete")]
        [Aliases("d")]
        [Description("Deletes the draft, and everything related to it.")]
        public async Task DeleteDraftCommand(CommandContext ctx)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
            var draft = MongoHelper.GetData(filter);
            
            Console.WriteLine(draft["league_name"].ToString());
            var confirmationStep = new ReactionStep("Are you sure you want to delete the draft, and everything that is related to it?", new Dictionary<DiscordEmoji, ReactionStepData>()
            {
                {DiscordEmoji.FromName(ctx.Client, ":thumbsup:"), new ReactionStepData()
                {
                    Content = "Yes, I want to delete it.",
                    NextStep = null
                }},
                {
                    DiscordEmoji.FromName(ctx.Client, ":thumbsdown:"), new ReactionStepData()
                    {
                        Content = "No, I don't want to delete it.",
                        NextStep = null
                    } 
                }
            });
            var isYes = false;

            confirmationStep.OnValidResult += result =>
            {
                Console.WriteLine(result.GetDiscordName());
                if (result.GetDiscordName() == ":thumbsup:") isYes = true;
                else if (result.GetDiscordName() == ":thumbsdown:") isYes = false;
                else isYes = false;
            };
            
            
            var dialogue = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, confirmationStep);

            bool succeeded = await dialogue.ProcessDialogue().ConfigureAwait(false);
            
            if (!succeeded) return;

            if (isYes)
            {
                await ctx.TriggerTypingAsync();
                await ctx.Guild.GetRole(ulong.Parse(draft["drafting_role_id"].AsString)).DeleteAsync().ConfigureAwait(false);
                await ctx.Guild.GetChannel(ulong.Parse(draft["drafting_channel_id"].AsString)).DeleteAsync()
                    .ConfigureAwait(false);
                await ctx.Channel.SendMessageAsync($"Deleted the draft `{draft["league_name"].AsString}`!").ConfigureAwait(false);
                await MongoHelper.DeleteDocument(draft);
                return;
            }

            await ctx.Channel.SendMessageAsync("I will not delete the draft.").ConfigureAwait(false);
        }
        
        [Group("player")]
        [Aliases("p")]
        public class DraftPlayerCommands : BaseCommandModule
        {
            [GroupCommand]
            [Description("Gets all of the players in the draft.")]
            public async Task GetPlayersInDraftCommand(CommandContext ctx)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = MongoHelper.GetData(filter);
                
                var model = new DraftTimerSchema(draft);
                var builder = new DiscordEmbedBuilder
                {
                    Title = "Players in the draft.",
                    Color = DiscordColor.Green
                };

                foreach (var player in draft["players"].AsBsonArray)
                {
                    var _player = player.AsBsonDocument;
                    builder.AddField($"Player {(await ctx.Guild.GetMemberAsync(ulong.Parse(_player["user_id"].AsString))).Username}", $"Order: {_player["order"].AsInt32}");
                }

                await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
            }

            [Command("add")]
            [Aliases("a")]
            [RequirePermissions(Permissions.ManageGuild)]
            [Description("Adds a player to the draft.")]
            public async Task AddPlayerToDraftCommand(CommandContext ctx, DiscordUser user)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = MongoHelper.GetData(filter);
                
                var model = new DraftTimerSchema(draft);
                if (draft["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["user_id"].AsString == user.Id.ToString()) is null)
                {    
                    draft["players"].AsBsonArray.Add(new BsonDocument
                    {
                        {"user_id", user.Id.ToString()},
                        {"order", draft["players"].AsBsonArray.Count + 1},
                        {"queue", new BsonArray()},
                        {"pokemon", new BsonArray()},
                        {"done", false},
                        {"skips", 0}
                    });
                    Console.WriteLine("Something");
                    Console.WriteLine(draft["players"].AsBsonArray[0].ToJson());
                    if (string.IsNullOrWhiteSpace(draft["current_player"].AsString))
                        draft["current_player"] = user.Id.ToString();
                }
                else
                {
                    await ctx.Channel.SendMessageAsync("This player is already in the draft.").ConfigureAwait(false);
                    return;
                }
                Console.WriteLine(draft.ToJson());
                await MongoHelper.UpdateDocument(filter, draft);

                await ctx.Channel.SendMessageAsync("Added Player").ConfigureAwait(false);
            }

            [Command("remove")]
            [Aliases("r")]
            [RequirePermissions(Permissions.ManageGuild)]
            [Description("Removes a player from the draft.")]
            public async Task RemovePlayerFromDraft(CommandContext ctx, DiscordUser user)
            {

                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = MongoHelper.GetData(filter);
                var data = (BsonDocument) draft["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["user_id"].AsString == user.Id.ToString());
                if (!(draft["players"].AsBsonArray
                    .FirstOrDefault(x => x.AsBsonDocument["user_id"].AsString == user.Id.ToString()) is null))
                {
                    draft["players"].AsBsonArray.Remove(data);
                }
                else
                {
                    await ctx.Channel.SendMessageAsync("This player is already not in the draft.").ConfigureAwait(false);
                    return;
                }
                await MongoHelper.UpdateDocument(filter, draft).ConfigureAwait(false);

                await ctx.Channel.SendMessageAsync("Removed Player").ConfigureAwait(false);
            }
        }
    }
}