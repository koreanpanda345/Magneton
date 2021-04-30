using System.Collections.Generic;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity;

namespace Magneton.Bot.Core.Docs
{
    public static class DraftDocumentation
    {

        public static DiscordEmbedBuilder FirstPage()
        {
            var firstPage = new DiscordEmbedBuilder();
            firstPage.Title = "Documentation on the Draft Command Category.";
            firstPage.Description = "Pages: \n" +
                                    "1 - Table Of Contents\n" +
                                    "2 - Setting up the draft.\n" +
                                    "3 - Adding/Removing Players.\n" +
                                    "4 - Drafting a Pokemon.\n" +
                                    "5 - FAQ";
            return firstPage;
        }

        public static DiscordEmbedBuilder SecondPage()
        {
            var secondPage = new DiscordEmbedBuilder();



            secondPage.Title = "Settings up the draft.";
            secondPage.Description =
                "In order to set up the draft, you need to use the create subcommand of the draft command.\n" +
                "To use the command you can either do `m!draft create`, `m!d create`, `m!draft c`, or `m!d c`\n" +
                "Once you do this, you will be receive what is known as dialogue. It will prompt you for either text, number, role mentions, channel mentions, or reaction.\n" +
                "Follow the dialogue. Once you done this, give it some time, to clean up the messages for the dialogue, which can take some time to do, and to do the required actions.\n" +
                "If it doesn't do what it needs to do, then join the support server, or contact koreanpanda345#2878";

            secondPage.AddField("WARNING",
                "The bot needs to have 3 server permissions in order to function properly. These perms are `Manage Channels`, `Manage Messages`, and `Manage Roles`. These need to be enabled for the bot.",
                true);
            return secondPage;
        }

        public static DiscordEmbedBuilder ThirdPage()
        {
            var thirdPage = new DiscordEmbedBuilder();

            thirdPage.Title = "Adding/Removing Players";
            thirdPage.Description = "When you create the draft you will need to add players to the draft in order to start it.\n" +
                                    "To add players you will want to use the `draft player add` command. You can add an individual player, or multiply players to the draft.\n" +
                                    "You need to ping them in order for the bot to add them, because of how discord ids work, sometimes user's ids are missing a number for some odd reason, and doesn't register.\n\n" +
                                    "To remove players you will want to use the `draft player remove` command. You can remove an individual, or multiply players from the draft.\n" +
                                    "You need to ping them in order for the bot to remove them.";
            return thirdPage;
        }

        public static DiscordEmbedBuilder FourthPage()
        {
            var fourthPage = new DiscordEmbedBuilder
            {
                Title = "Drafting a pokemon",
                Description =
                    "When it is the player's turn, the bot will ping them in the drafting channel that it is their turn.\n" +
                    "It will manage timer for you, and timer will be in minutes, and was setup when you setup the draft.\n" +
                    "When the player is going to make their pick, they will need to say the pick in the drafting channel.\n" +
                    "Note: The bot will be playing with the drafting role. It will need to have the `Manage Roles` perms enabled.\n"
            };
            return fourthPage;
        }

        public static DiscordEmbedBuilder LastPage()
        {
            var finalPage = new DiscordEmbedBuilder();
            finalPage.Title = "FAQ";
            finalPage.AddField("What if I am done drafting pokemon, but the draft is still happening?", "" +
                "Once its your turn again, type in `done` in the drafting channel. anytime its your turn after that, will skip over you, and will not ping you.");
            return finalPage;
        }
    }
}