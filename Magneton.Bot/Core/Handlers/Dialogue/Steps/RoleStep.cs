using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity.Extensions;

namespace Magneton.Bot.Core.Handlers.Dialogue.Steps
{
    public class RoleStep : DialogueStepBase
    {
        private IDialogueStep _nextStep;

        public RoleStep(
            string content,
            IDialogueStep nextStep
            ) : base(content)
        {
            _nextStep = nextStep;
        }

        public Action<DiscordRole> OnValidResult { get; set; } = delegate { };

        public override IDialogueStep NextStep => _nextStep;

        public void SetNextStep(IDialogueStep nextStep)
        {
            _nextStep = nextStep;
        }

        public override async Task<bool> ProcessStep(DiscordClient client, DiscordChannel channel, DiscordUser user)
        {
            var embedBuilder = new DiscordEmbedBuilder
            {
                Title = $"Please Respond Below",
                Description = $"{user.Mention}, {_content}",
            };

            embedBuilder.AddField("To Stop The Dialogue", "Use the ?cancel command");

            var interactivity = client.GetInteractivity();

            while (true)
            {
                var embed = await channel.SendMessageAsync(embed: embedBuilder).ConfigureAwait(false);

                OnMessageAdded(embed);

                var messageResult = await interactivity.WaitForMessageAsync(
                    x => x.ChannelId == channel.Id && x.Author.Id == user.Id).ConfigureAwait(false);

                OnMessageAdded(messageResult.Result);

                if (messageResult.Result.Content.Equals("m!cancel", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                DiscordRole role;
                if (messageResult.Result.MentionedRoles.Count > 0)
                    role = messageResult.Result.MentionedRoles.FirstOrDefault();
                else if (ulong.TryParse(messageResult.Result.Content, out ulong id))
                    role = channel.Guild.GetRole(id);
                else
                    role = channel.Guild.Roles.Values.FirstOrDefault(x =>
                        x.Name.ToLower() == messageResult.Result.Content.ToLower());

                if (role is null)
                {
                    await TryAgain(channel, "The requested role doesn't seem to exist.");
                    continue;
                }

                OnValidResult(role);
                return false;
            }
        }
    }
}