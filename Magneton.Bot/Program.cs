
using Magneton.Bot.Core;

namespace Magneton.Bot
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            var bot = new MagnetonClient();
            bot.RunAsync().GetAwaiter().GetResult();
        }
    }
}