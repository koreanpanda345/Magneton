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
        [Command("draft")]
        [Aliases("d")]
        [Description("This is like a wiki for the draft commands. This will explain how to do things, or explain what something is.")]
        public async Task DraftHelpCommand(CommandContext ctx)
        {
            var interactivity = ctx.Client.GetInteractivity();
            
                        var pages = new List<Page>
            {
                {new Page(null, DraftDocumentation.FirstPage())},
                {new Page(null, DraftDocumentation.SecondPage())},
                {new Page(null, DraftDocumentation.ThirdPage())}
            };
            
            await interactivity.SendPaginatedMessageAsync(ctx.Channel, ctx.User, pages);
        }
    }
}