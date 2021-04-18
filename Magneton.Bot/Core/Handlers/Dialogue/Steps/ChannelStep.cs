using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.Interactivity.Extensions;

namespace Magneton.Bot.Core.Handlers.Dialogue.Steps
{
    public class ChannelStep : DialogueStepBase
    {
        private IDialogueStep _nextStep;

        public ChannelStep(
            string content,
            IDialogueStep nextStep
            ) : base(content)
        {
            _nextStep = nextStep;
        }

        public Action<DiscordChannel> OnValidResult { get; set; } = delegate { };

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

                DiscordChannel _channel;
                if (messageResult.Result.MentionedChannels.Count > 0)
                    _channel = messageResult.Result.MentionedChannels.FirstOrDefault();
                else if (ulong.TryParse(messageResult.Result.Content, out ulong id))
                    _channel = channel.Guild.GetChannel(id);
                else
                    _channel = channel.Guild.Channels.Values.FirstOrDefault(x =>
                        x.Name.ToLower() == messageResult.Result.Content.ToLower());

                if (_channel is null)
                {
                    await TryAgain(channel, "The requested channel doesn't seem to exist.");
                    continue;
                }

                OnValidResult(_channel);
                
                return false;
            }
        }
    }
}