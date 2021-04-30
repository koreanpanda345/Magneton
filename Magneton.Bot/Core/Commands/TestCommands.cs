using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using Magneton.Bot.Core.Database;
using Magneton.Bot.Core.Database.Schemas;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Commands
{
    public class TestCommands : BaseCommandModule
    {
        [Command("test")]
        public async Task TestCommand(CommandContext ctx)
        {
            await ctx.Channel.SendMessageAsync("Starting test").ConfigureAwait(false);
            var filter = Builders<BsonDocument>.Filter.Eq("channel_id", ctx.Channel.Id.ToString());
            var data = await MongoHelper.Draft.GetAsync(filter);

            var model = new DraftSchema(data);

            model.Id = 100;
            await ctx.Channel.SendMessageAsync("Successful").ConfigureAwait(false);
        }

    }
}