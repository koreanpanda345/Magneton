using System.Collections.Generic;
using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity;
using DSharpPlus.Interactivity.Extensions;
using Magneton.Bot.Core.Docs;

namespace Magneton.Bot.Core.Commands
{
    [Group("doc")]
    [Aliases("man", "manual", "manuals", "docs")]
    [Description("These sub commands are documentation for the different parts of the bot.")]
    public class DocumentationCommands : BaseCommandModule
    {
        [GroupCommand]
        [Description("Displays all of the documentations available.")]
        public async Task DocCommand(CommandContext ctx)
        {
            var builder = new DiscordEmbedBuilder
            {
                Title = "All available documentations.",
                Description = "- drafts [5 pages]"
            };

            await ctx.Channel.SendMessageAsync(embed: builder.Build()).ConfigureAwait(false);
        }
        
        [Command("draft")]
        [Aliases("d")]
        [Description(
            "This is like a wiki for the draft commands. This will explain how to do things, or explain what something is.")]
        public async Task DraftHelpCommand(CommandContext ctx)
        {
            var interactivity = ctx.Client.GetInteractivity();

            var pages = new List<Page>
            {
                {new Page(null, DraftDocumentation.FirstPage())},
                {new Page(null, DraftDocumentation.SecondPage())},
                {new Page(null, DraftDocumentation.ThirdPage())},
                {new Page(null, DraftDocumentation.FourthPage())},
                {new Page(null, DraftDocumentation.LastPage())}
            };

            await interactivity.SendPaginatedMessageAsync(ctx.Channel, ctx.User, pages);
        }
    }
}