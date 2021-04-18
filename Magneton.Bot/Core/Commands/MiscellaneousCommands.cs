using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity.Extensions;
using Magneton.Bot.Core.Handlers.Dialogue;
using Magneton.Bot.Core.Handlers.Dialogue.Steps;

namespace Magneton.Bot.Core.Commands
{
    public class MiscellaneousCommands : BaseCommandModule
    {
        [Command("latency")]
        [Aliases("ping")]
        [Description("Displays my latency")]
        public async Task LatencyCommand(CommandContext ctx)
        {
            await ctx.Channel.SendMessageAsync("Pong").ConfigureAwait(false);
        }
    }
}