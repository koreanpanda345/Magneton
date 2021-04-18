using System.Collections.Generic;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity;

namespace Magneton.Bot.Core.Docs
{
    public static class DraftDocumentation
    {

        public static DiscordEmbedBuilder FirstPage()
        {
            var firstPage =  new DiscordEmbedBuilder();
            firstPage.Title = "Table Of Contents";
            firstPage.Description = "Pages: \n1 - Table Of Contents\n2 - Setting up the draft.";
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
            return secondPage;
        }

        public static DiscordEmbedBuilder ThirdPage()
        {
            var thirdPage = new DiscordEmbedBuilder();

            thirdPage.Title = "Adding Players";
            thirdPage.Description =
                "For now, you will need enter each player one by one. In future updates, this will be change to do a massive add of players.\n" +
                "But to add a player, simply use the player add sub command of the draft commands.\n" +
                "To use this command you can either do `m!draft player add <@who>`, `m!draft player a <@who>`, `m!draft p add <@who>`, `m!draft p a <@who>`, `m!d player add <@who>`, `m!d player a <@who>`, or `m!d p a <@who>`.\n" +
                "If you would like to remove a player, then you would need to use the player remove command.\n" +
                "To use this command you can either do `m!draft player remove <@who>`, `m!draft player r <@who>`, `m!draft p remove <@who>`, `m!draft p r <@who>`, `m!d player remove <@who>`, `m!d player r <@whp>`, or `m!d p r <@who>`.\n";
            return thirdPage;
        }

        public static DiscordEmbedBuilder LastPage()
        {
            var finalPage = new DiscordEmbedBuilder();

            return finalPage;
        }
    }
}