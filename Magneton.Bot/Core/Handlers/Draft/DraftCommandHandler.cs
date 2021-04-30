using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.Entities;
using Magneton.Bot.Core.Database;
using Magneton.Bot.Core.Handlers.Dialogue;
using Magneton.Bot.Core.Handlers.Dialogue.Steps;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Handlers.Draft
{

    public static class DraftCommandHandler
    {
        public static async Task DraftCommand(CommandContext ctx, int id)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("id", id);
            var data = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);

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

                builder.AddField(
                    $"Player: {(await ctx.Client.GetUserAsync(ulong.Parse(player.AsBsonDocument["user_id"].AsString))).Username}",
                    string.IsNullOrWhiteSpace(desc) ? "\u200b" : desc);
            }

            await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
        }

        public static class Administrative
        {
            public static async Task CreateDraftCommand(CommandContext ctx)
            {

                var drafts = MongoHelper.database.GetCollection<BsonDocument>("drafttimers");
                var result = await DraftMethods.HandleDialogue(ctx, drafts);
                if (!result.DialogueSucceeded) return;

                await ctx.Channel.TriggerTypingAsync().ConfigureAwait(false);

                if (result.DraftRole is null)
                {
                    if (ctx.Guild.Roles.Values.FirstOrDefault(x => x.Name == $"{result.Name} Draft Role") is null)
                    {
                        await ctx.Guild.CreateRoleAsync($"{result.Name} Draft Role");
                    }

                    result.DraftRole =
                        ctx.Guild.Roles.Values.FirstOrDefault(x => x.Name == $"{result.Name} Draft Role");
                }

                if (result.DraftingChannel is null)
                {
                    if (ctx.Guild.Channels.Values.FirstOrDefault(x =>
                        x.Name == $"{result.Name.ToLower().Replace(" ", "-")}-drafting") is null)
                    {
                        var overwrites = new List<DiscordOverwriteBuilder>();

                        foreach (var guildRole in ctx.Guild.Roles.Values)
                        {
                            if (guildRole != result.DraftRole)
                                overwrites.Add(new DiscordOverwriteBuilder().Deny(Permissions.SendMessages)
                                    .For(guildRole));
                            else
                                overwrites.Add(new DiscordOverwriteBuilder().Allow(Permissions.SendMessages)
                                    .For(ctx.Guild.CurrentMember));
                        }

                        overwrites.Add(new DiscordOverwriteBuilder().Allow(Permissions.SendMessages)
                            .For(result.DraftRole));

                        result.DraftingChannel = await ctx.Guild.CreateTextChannelAsync(
                            $"{result.Name.ToLower().Replace(" ", "-")}-drafting",
                            ctx.Channel.Parent,
                            "Type your pick in when it is your turn.",
                            overwrites);
                    }
                }

                var doc = new BsonDocument
                {
                    {"league_name", result.Name},
                    {"id", result.Id},
                    {"max_rounds", result.MaxRounds},
                    {"total_skips", result.TotalSkips},
                    {"server_id", ctx.Guild.Id.ToString()},
                    {"channel_id", ctx.Channel.Id.ToString()},
                    {"drafting_channel_id", result.DraftingChannel?.Id.ToString()},
                    {"drafting_role_id", result.DraftRole?.Id.ToString()},
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
                    {"timer", result.Timer},
                    {"direction", "up"},
                    {"current_player", ""},
                    {"stop", false}
                };

                await MongoHelper.Draft.InsertAsync(doc).ConfigureAwait(false);

                await ctx.Channel
                    .SendMessageAsync(
                        $"Successfully made the draft. Your league's id is `{result.Id}`. Use this id when you are using any draft command that is outside the draft/drafting channel.")
                    .ConfigureAwait(false);
            }

            public static async Task DeleteDraftCommand(CommandContext ctx)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = await MongoHelper.Draft.GetAsync(filter);

                Console.WriteLine(draft["league_name"].ToString());
                var confirmationStep = new ReactionStep(
                    "Are you sure you want to delete the draft, and everything that is related to it?",
                    new Dictionary<DiscordEmoji, ReactionStepData>()
                    {
                        {
                            DiscordEmoji.FromName(ctx.Client, ":thumbsup:"), new ReactionStepData()
                            {
                                Content = "Yes, I want to delete it.",
                                NextStep = null
                            }
                        },
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
                    await ctx.Guild.GetRole(ulong.Parse(draft["drafting_role_id"].AsString)).DeleteAsync()
                        .ConfigureAwait(false);
                    await ctx.Guild.GetChannel(ulong.Parse(draft["drafting_channel_id"].AsString)).DeleteAsync()
                        .ConfigureAwait(false);
                    await ctx.Channel.SendMessageAsync($"Deleted the draft `{draft["league_name"].AsString}`!")
                        .ConfigureAwait(false);
                    await MongoHelper.Draft.DeleteAsync(draft).ConfigureAwait(false);
                    return;
                }

                await ctx.Channel.SendMessageAsync("I will not delete the draft.").ConfigureAwait(false);
            }

            public static async Task EditDraftCommand(CommandContext ctx, string option = null)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                var drafts = MongoHelper.database.GetCollection<BsonDocument>("drafttimers");
                if (option is null)
                {
                    var builder = new DiscordEmbedBuilder
                    {
                        Title = $"{draft["league_name"]}'s Configurations",
                        Description = "If you want to edit one, you can use this command again, and pass the property's name that you want to change.\n" +
                                      "If the name has a * at the end, that means it can't be edited."
                    };

                    builder.AddField("League Name", draft["league_name"].AsString, true);
                    builder.AddField("Id*", $"{draft["id"].AsInt32}", true);
                    builder.AddField("Timer", $"{draft["timer"].AsInt32} Minutes", true);
                    var channel = ctx.Guild.GetChannel(ulong.Parse(draft["drafting_channel_id"].AsString));
                    builder.AddField("Drafting Channel", channel.Mention, true);
                    var role = ctx.Guild.GetRole(ulong.Parse(draft["drafting_role_id"].AsString));
                    builder.AddField("Drafting Role", role.Mention, true);
                    var _channel = ctx.Guild.GetChannel(ulong.Parse(draft["channel_id"].AsString));
                    builder.AddField("Draft Channel*", _channel.Mention, true);
                    builder.AddField("Maximum Rounds", $"{draft["max_rounds"].AsInt32} rounds", true);
                    builder.AddField("Total Skips", $"{draft["total_skips"].AsInt32} skips", true);
                    await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
                    return;
                }
                var result = await DraftMethods.HandleDialogueForEditDraft(ctx, option, drafts);
                switch (option.ToLower().Trim())
                {
                    case "name":
                        draft["league_name"] = result.Name;
                        await ctx.Channel.SendMessageAsync($"League name has been changed to {result.Name}").ConfigureAwait(false);
                        break;
                    case "timer":
                        draft["timer"] = result.Timer;
                        await ctx.Channel.SendMessageAsync($"Timer has been changed to {result.Timer} minutes.").ConfigureAwait(false);
                        break;
                    case "channel":
                        draft["drafting_channel_id"] = result.DraftingChannel.Id.ToString();
                        await ctx.Channel
                            .SendMessageAsync($"Drafting channel has been changed to {result.DraftingChannel.Mention}.")
                            .ConfigureAwait(false);
                        break;
                    case "role":
                        draft["drafting_role_id"] = result.DraftRole.Id.ToString();
                        await ctx.Channel.SendMessageAsync(
                            $"Draft role has been changed to {result.DraftRole.Mention}.").ConfigureAwait(false);
                        break;
                    case "rounds":
                        draft["max_rounds"] = result.MaxRounds;
                        await ctx.Channel.SendMessageAsync($"Max Rounds has been changed to {result.MaxRounds}.")
                            .ConfigureAwait(false);
                        break;
                    case "skips":
                        draft["total_skips"] = result.TotalSkips;
                        await ctx.Channel.SendMessageAsync($"Total Skips has been changed to {result.TotalSkips}.")
                            .ConfigureAwait(false);
                        break;
                }
                
                await MongoHelper.Draft.UpdateAsync(filter, draft);
            }

            public static async Task RandomizeDraftCommand(CommandContext ctx, int times = 3)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                var list = draft["players"].AsBsonArray.ToList();
                var shuffled = new List<BsonValue>();
                for (var i = 0; i < times; ++i)
                {
                    shuffled = list.OrderBy(x => Guid.NewGuid()).ToList();
                }

                draft["players"] = new BsonArray(shuffled.ToArray());
                var builder = new DiscordEmbedBuilder
                {
                    Title = "Draft Order",
                    Description = $"Randomized {times} times"
                };

                foreach (var player in draft["players"].AsBsonArray)
                {
                    var user = await ctx.Guild.GetMemberAsync(ulong.Parse(player.AsBsonDocument["user_id"].AsString));
                    builder.AddField($"Pick {player.AsBsonDocument["order"]}", $"{user.Mention}");
                }

                await MongoHelper.Draft.UpdateAsync(filter, draft).ConfigureAwait(false);
                await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
            }
            

            public static async Task StartDraftCommand(CommandContext ctx)
            {
                await ctx.Channel.TriggerTypingAsync().ConfigureAwait(false);

                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                Console.WriteLine(draft["league_name"]);
                Console.WriteLine(draft.ToJson());
                Console.WriteLine(string.IsNullOrWhiteSpace(draft["current_player"].AsString));
                if (string.IsNullOrWhiteSpace(draft["current_player"].AsString))
                    draft["current_player"] = draft["players"].AsBsonArray.FirstOrDefault(x => x["order"].AsInt32 == 1)
                        ?.AsBsonDocument["user_id"].AsString;
                Console.WriteLine(draft["players"].AsBsonArray.FirstOrDefault(x => x["order"].AsInt32 == 1)
                    ?.AsBsonDocument["user_id"].AsString);
                await MongoHelper.Draft.UpdateAsync(filter, draft).ConfigureAwait(false);
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

            public static async Task StopDraftCommand(CommandContext ctx)
            {
                var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);

                draft["stop"] = true;

                await MongoHelper.Draft.UpdateAsync(filter, draft).ConfigureAwait(false);
                await ctx.Channel.SendMessageAsync("We will stop the draft after the current pick.")
                    .ConfigureAwait(false);

            }

            public static class Players
            {
                public static async Task AddCommand(CommandContext ctx)
                {
                    var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                    var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                    foreach (var user in ctx.Message.MentionedUsers)
                    {

                        if (!(draft["players"].AsBsonArray
                            .FirstOrDefault(x => x.AsBsonDocument["user_id"] == user.Id.ToString()) is null))
                        {
                            await ctx.Channel.SendMessageAsync($"Player {user.Username} is already in the draft.")
                                .ConfigureAwait(false);
                        }

                        draft["players"].AsBsonArray.Add(new BsonDocument()
                        {
                            {"user_id", user.Id.ToString()},
                            {
                                "order",
                                draft["players"].AsBsonArray.Count == 0 ? 1 : draft["players"].AsBsonArray.Count + 1
                            },
                            {"queue", new BsonArray()},
                            {"pokemon", new BsonArray()},
                            {"done", false},
                            {"skips", 0}
                        });
                    }

                    await MongoHelper.Draft.UpdateAsync(filter, draft).ConfigureAwait(false);

                    await ctx.Channel.SendMessageAsync("Added Player(s).").ConfigureAwait(false);
                }

                public static async Task RemoveCommand(CommandContext ctx)
                {
                    var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                    var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);
                    foreach (var user in ctx.Message.MentionedUsers)
                    {
                        var data = (BsonDocument) draft["players"].AsBsonArray
                            .FirstOrDefault(x => x.AsBsonDocument["user_id"].AsString == user.Id.ToString());
                        // If player doesn't exist in the draft data.
                        if (data is null)
                        {
                            await ctx.Channel.SendMessageAsync("This player is not in the draft already.")
                                .ConfigureAwait(false);
                            return;
                        }

                        // else the player does exist, and we can remove it from the draft data.
                        draft["players"].AsBsonArray.Remove(data);

                        await MongoHelper.Draft.UpdateAsync(filter, draft).ConfigureAwait(false);

                        await ctx.Channel.SendMessageAsync("Removed Player(s).").ConfigureAwait(false);
                    }
                }

                public static async Task GetCommand(CommandContext ctx)
                {
                    var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
                    var draft = await MongoHelper.Draft.GetAsync(filter).ConfigureAwait(false);

                    var builder = new DiscordEmbedBuilder
                    {
                        Title = "Players in the draft.",
                        Color = DiscordColor.Green
                    };

                    foreach (var player in draft["players"].AsBsonArray)
                    {
                        var _player = player.AsBsonDocument;
                        builder.AddField(
                            $"Player {(await ctx.Guild.GetMemberAsync(ulong.Parse(_player["user_id"].AsString))).Username}",
                            $"Order: {_player["order"].AsInt32}");
                    }

                    await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
                }
            }
        }

        static class DraftMethods
        {

            public static async Task<DraftStruct.EditDraftDialogResult> HandleDialogueForEditDraft(CommandContext ctx,
                string option, IMongoCollection<BsonDocument> data)
            {
                var result = new DraftStruct.EditDraftDialogResult();
                switch (option.ToLower().Trim())
                {
                    case "name":
                        var searchNameList = new List<string>();

                        foreach (var draft in data.Find(new BsonDocument()).ToList())
                        {
                            searchNameList.Add(draft["league_name"].AsString);
                        }

                        var nameStep = new TextStep("What do you want to change the league name to?", null, 3, null,
                            searchNameList.ToArray(),
                            "There is already a league with that name.");

                        var dialogue = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, nameStep);

                        nameStep.OnValidResult += content => { result.Name = content; };
                        await dialogue.ProcessDialogue();
                        break;
                    case "timer":
                        var timerStep = new IntStep("What do you want to change the timer to?\nTimer is in minutes.", null);
                        var dialogue_1 = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, timerStep);

                        timerStep.OnValidResult += content => { result.Timer = content; };
                        await dialogue_1.ProcessDialogue();
                        break;
                    case "channel":
                        var channelStep = new ChannelStep("What do you want to change the Drafting channel to?", null);
                        var dialogue_2 = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, channelStep);

                        channelStep.OnValidResult += content => { result.DraftingChannel = content; };
                        await dialogue_2.ProcessDialogue();
                        break;
                    case"role":
                        var roleStep = new RoleStep("What do you want to change the Draft Role to be?", null);
                        var dialogue_3 = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, roleStep);

                        roleStep.OnValidResult += content => { result.DraftRole = content; };
                        await dialogue_3.ProcessDialogue();
                        break;
                    case "rounds":
                        var roundStep = new IntStep("What do you want to change the maximum rounds to?", null, 8, 12);
                        var dialogue_4 = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, roundStep);

                        roundStep.OnValidResult += content => { result.MaxRounds = content; };
                        await dialogue_4.ProcessDialogue();
                        break;
                    case "skips":
                        var skipStep = new IntStep("What do you want to change the total skips to?", null, 0, 5);
                        var dialogue_5 = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, skipStep);

                        skipStep.OnValidResult += content => { result.TotalSkips = content; };
                        await dialogue_5.ProcessDialogue();
                        break;
                }

                return result;
            }

            public static async Task<DraftStruct.CreateDraftDialogResult> HandleDialogue(CommandContext ctx,
                IMongoCollection<BsonDocument> drafts)
            {
                var data = new DraftStruct.CreateDraftDialogResult();
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
                var roundStep = new IntStep("How many rounds are there?", null, 8, 12);
                var searchNameList = new List<string>();

                foreach (var draft in drafts.Find(new BsonDocument()).ToList())
                {
                    searchNameList.Add(draft["league_name"].AsString);
                }

                data.Id = drafts.Find(new BsonDocument()).ToList().Count + 1;
                var nameStep = new TextStep("What is the league's name?", null, 3, null, searchNameList.ToArray(),
                    "There is already a league with that name.");
                var dialogue = new DialogueHandler(ctx.Client, ctx.Channel, ctx.User, nameStep);
                nameStep.OnValidResult += result =>
                {
                    data.Name = result;
                    nameStep.SetNextStep(roundStep);
                };

                roundStep.OnValidResult += result =>
                {
                    data.MaxRounds = result;
                    roundStep.SetNextStep(skipStep);
                };

                skipStep.OnValidResult += result =>
                {
                    data.TotalSkips = result;
                    skipStep.SetNextStep(timerStep);
                };

                timerStep.OnValidResult += result =>
                {
                    data.Timer = result;
                    timerStep.SetNextStep(hasRoleStep);
                };

                hasRoleStep.OnValidResult += result => { Console.WriteLine(result.Name); };

                hasChannelStep.OnValidResult += result => { Console.WriteLine(result.Name); };

                data.DraftRole = null;
                getRoleStep.OnValidResult += result => { data.DraftRole = result; };

                data.DraftingChannel = null;
                getChannelStep.OnValidResult += result => { data.DraftingChannel = result; };
                data.DialogueSucceeded = await dialogue.ProcessDialogue().ConfigureAwait(false);
                return data;
            }

            public static DraftStruct.GetTemplateResult GetTemplate(string name)
            {
                foreach (var template in DraftConstants.Templates)
                {
                    if (template.Key.Contains(name))
                        return new DraftStruct.GetTemplateResult
                        {
                            Success = true,
                            Document = template.Value,
                            TemplateName = template.Key[0]
                        };
                }

                return new DraftStruct.GetTemplateResult
                {
                    Success = false
                };
            }
        }

        static class DraftConstants
        {

            public static BsonDocument QuickStart = new BsonDocument
            {
                {"timer", 10},
                {"total_skips", 3},
                {"max_rounds", 11}
            };

            public static BsonDocument Default = new BsonDocument
            {
                {"timer", 10},
                {"total_skips", 3},
                {"max_rounds", 10}
            };

            public static Dictionary<List<string>, BsonDocument> Templates = new Dictionary<List<string>, BsonDocument>
            {
                {
                    new List<string>
                    {
                        "quickstart",
                        "quick start",
                        "qs",
                        "quick_start"
                    },
                    QuickStart
                },
                {
                    new List<string>
                    {
                        "default",
                        "d"
                    },
                    Default
                }
            };
        }

        static class DraftStruct
        {

            public struct GetTemplateResult
            {
                public bool Success { get; set; }
                public BsonDocument Document { get; set; }
                public string TemplateName { get; set; }
            }

            public struct EditDraftDialogResult
            {
                public string Name { get; set; }
                public int MaxRounds { get; set; }
                public int TotalSkips { get; set; }
                public int Timer { get; set; }
                public DiscordRole DraftRole { get; set; }
                public DiscordChannel DraftingChannel { get; set; }
                public bool DialogueSucceeded { get; set; }
                public int Id { get; set; }
                public DraftMode Mode { get; set; }
            }

            public struct DraftMode
            {
                public bool Dm { get; set; }
                public bool Skip { get; set; }
                public bool Text { get; set; }
            }

            public struct CreateDraftDialogResult
            {
                public string Name { get; set; }
                public int MaxRounds { get; set; }
                public int TotalSkips { get; set; }
                public int Timer { get; set; }
                public DiscordRole DraftRole { get; set; }
                public DiscordChannel DraftingChannel { get; set; }
                public bool DialogueSucceeded { get; set; }
                public int Id { get; set; }
            }
        }
    }
}