using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.Entities;
using DSharpPlus.EventArgs;
using DSharpPlus.Interactivity;
using DSharpPlus.Interactivity.Enums;
using DSharpPlus.Interactivity.Extensions;
using Magneton.Bot.Core.Commands;
using Magneton.Bot.Core.Database;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Magneton.Bot.Core
{
    public class MagnetonClient
    {
        public DiscordClient Client { get; private set; }
        public InteractivityExtension Interactivity { get; private set; }
        public CommandsNextExtension Commands { get; private set; }
        public async Task RunAsync()
        {
            var json = string.Empty;
            using(var fs = File.OpenRead("Resources/config.json"))
            using (var sr = new StreamReader(fs, new UTF8Encoding(false)))
                json = await sr.ReadToEndAsync().ConfigureAwait(false);

            var configJson = JsonConvert.DeserializeObject<ConfigJson>(json);
            
            var config = new DiscordConfiguration
            {
                Token = configJson.Token,
                TokenType = TokenType.Bot,
                AutoReconnect = true,
                MinimumLogLevel = LogLevel.Information,
                Intents = DiscordIntents.GuildMessages | DiscordIntents.DirectMessages | DiscordIntents.Guilds | DiscordIntents.GuildMessageReactions | DiscordIntents.DirectMessageReactions
            };
            MongoHelper.MongoConnection = configJson.MongoConnection;
            MongoHelper.MongoDatabase = "data";
            Client = new DiscordClient(config);
            
            Client.Ready += ClientOnReady;
            Client.SocketErrored += (sender, args) =>
            {
                Client.Logger.Log(LogLevel.Error, args.Exception, args.Exception.Message);
                return Task.CompletedTask;
            };

            Client.Resumed += (sender, args) =>
            {
                Client.Logger.Log(LogLevel.Information, "Client is resuming now.");
                return Task.CompletedTask;
            };
            
            Client.UseInteractivity(new InteractivityConfiguration
            {
                Timeout = TimeSpan.FromMinutes(2),
                PaginationBehaviour = PaginationBehaviour.WrapAround,
                PaginationDeletion = PaginationDeletion.DeleteMessage,
                PollBehaviour = PollBehaviour.KeepEmojis,
            });
            
            var commandsConfig = new CommandsNextConfiguration
            {
                StringPrefixes = new string[] { configJson.Prefix},
                EnableMentionPrefix = true,
                EnableDms = true,
                IgnoreExtraArguments = true,
                CaseSensitive = false
            };
            
            MongoHelper.ConnectToMongoService();
            
            Commands = Client.UseCommandsNext(commandsConfig);
            Commands.RegisterCommands<MiscellaneousCommands>();
            Commands.RegisterCommands<DraftCommands>();
            Commands.RegisterCommands<DocumentationCommands>();
            //Commands.RegisterCommands<DraftPlayerCommands>();
            Commands.RegisterCommands<ToolCommands>();
            await Client.ConnectAsync();

            await Task.Delay(-1);
        }

        private async Task ClientOnReady(DiscordClient sender, ReadyEventArgs e)
        {
            Client.Logger.Log(LogLevel.Information, "Bot is online");
            await Client.UpdateStatusAsync(new DiscordActivity
            {
                Name = $"In {Client.Guilds.Count} Servers"
            }, UserStatus.DoNotDisturb);
        }
    }
}