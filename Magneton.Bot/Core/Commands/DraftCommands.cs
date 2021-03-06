﻿using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using Magneton.Bot.Core.Handlers.Draft;

namespace Magneton.Bot.Core.Commands
{
    [Group("draft"), Aliases("d")]
    [Description("These commands are used for the draft.")]
    public class DraftCommands : BaseCommandModule
    {
        [GroupCommand]
        [Description("Gets the information about the draft by the league prefix.")]
        public async Task DraftCommand(CommandContext ctx, 
            [Description("The draft's id that you want to look up.")]
            int id) => await DraftCommandHandler.DraftCommand(ctx, id);

        [Command("stop")]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageRoles)]
        [Description("Stops the draft.")]
        public async Task StopDraftCommand(CommandContext ctx) =>
            await DraftCommandHandler.Administrative.StopDraftCommand(ctx);

        [Command("start")]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageRoles)]
        [Aliases("s")]
        [Description("Starts the draft")]
        public async Task StartDraftCommand(CommandContext ctx) =>
            await DraftCommandHandler.Administrative.StartDraftCommand(ctx);

        [Command("edit")]
        [RequireGuild]
        [RequirePermissions(Permissions.ManageGuild)]
        [Aliases("e")]
        [Description("Edits the draft")]
        public async Task EditDraftCommand(CommandContext ctx, string option = null) =>
            await DraftCommandHandler.Administrative.EditDraftCommand(ctx, option);

        [Command("randomize")]
        [RequireGuild]
        [RequirePermissions(Permissions.ManageGuild)]
        [Aliases("random", "r")]
        [Description("Randomizes the order for the draft.")]
        public async Task RandomizeOrderCommand(CommandContext ctx,
            [Description("How many times you would like to randomize the order.")]
            int times = 3) =>
            await DraftCommandHandler.Administrative.RandomizeDraftCommand(ctx, times);

        [Command("create")]
        [RequireGuild]
        [RequirePermissions(Permissions.ManageGuild)]
        [RequireBotPermissions(Permissions.ManageChannels | Permissions.ManageRoles)]
        [Aliases("c")]
        [Description("This command will set the draft up. Follow the dialogue to set the draft up.")]
        public async Task CreateDraftCommand(CommandContext ctx)
            => await DraftCommandHandler.Administrative.CreateDraftCommand(ctx).ConfigureAwait(false);

        [RequirePermissions(Permissions.ManageGuild)]
        [RequireGuild]
        [RequireBotPermissions(Permissions.ManageChannels | Permissions.ManageRoles)]
        [Command("delete")]
        [Aliases("d")]
        [Description("Deletes the draft, and everything related to it.")]
        public async Task DeleteDraftCommand(CommandContext ctx)
            => await DraftCommandHandler.Administrative.DeleteDraftCommand(ctx).ConfigureAwait(false);

        [Group("player")]
        [Aliases("p")]
        [Description("These are commands handle the players for the draft, such as adding, and removing players from the draft.")]
        public class DraftPlayerCommands : BaseCommandModule
        {
            [GroupCommand]
            [Description("Gets all of the players in the draft.")]
            public async Task GetPlayersInDraftCommand(CommandContext ctx)
                => await DraftCommandHandler.Administrative.Players.GetCommand(ctx);

            [Command("add")]
            [Aliases("a")]
            [RequirePermissions(Permissions.ManageGuild)]
            [Description("Adds a player to the draft.")]
            public async Task AddPlayerToDraftCommand(CommandContext ctx)
                => await DraftCommandHandler.Administrative.Players.AddCommand(ctx);

            [Command("remove")]
            [Aliases("r")]
            [RequirePermissions(Permissions.ManageGuild)]
            [Description("Removes a player from the draft.")]
            public async Task RemovePlayerFromDraft(CommandContext ctx)
                => await DraftCommandHandler.Administrative.Players.RemoveCommand(ctx);
        }
    }
}