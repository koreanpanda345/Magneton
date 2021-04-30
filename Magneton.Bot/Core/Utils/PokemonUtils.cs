using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using DSharpPlus;
using PokeApiNet;

namespace Magneton.Bot.Core.Utils
{
    public static class PokemonUtils
    {

        public static string ResolveName(string name)
        {
            // For pokemon.
            if (name.Contains(" ")) name = name.Replace(" ", "-");
            // For Megas
            if (name.Contains("mega")) name = name.Replace("mega", "") + "-mega";
            // For White Kyurem and Black Kyurem
            if (name.Contains("white") | name.Contains("black"))
                name = name.Contains("white")
                    ? name.Replace("white", "") + "-white"
                    : name.Replace("black", "") + "-black";
            // For Necromza Dusk Man and Necormza Dawn Wings.
            if (name.Contains("dusk-mane") || name.Contains("dawn-wings"))
                name = name.Contains("dusk-mane")
                    ? name.Replace("dusk-mane", "") + "-dusk-mane"
                    : name.Replace("dawn-wings", "") + "-dawn-wings";
            // For Lycanroc Dusk, Lycanroc Midday, and Lycanroc Midnight
            if (name.Contains("dusk") || name.Contains("midnight") || name.Contains("midday"))
                name = name.Contains("dusk")
                    ? name.Replace("dusk", "") + "-dusk"
                    : name.Contains("midday") 
                        ? name.Replace("midday", "") + "-midday"
                        : name.Replace("midnight", "") + "-midnight";

            if (name.Contains("Therian")) name = name.Replace("therian", "") + "-therian";
            return name.TrimStart('-');
        }
        
        public static async Task<bool> DoesPokemonExist(string name)
        {
            // Since PokeApiNet doesn't actually handle when a pokemon doesn't exist, means I have to make my own.
            var client = new HttpClient();
            // https://pokeapi.co/api/v2/pokemon/ditto
            client.BaseAddress = new Uri("https://pokeapi.co/api/v2/");
            var version = typeof(PokeApiClient).Assembly.GetName().Version;
            var userAgent = new ProductHeaderValue("PokeApiNet", $"{version.Major}.{version.Minor}");
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue(userAgent));
            var result = await client.GetAsync($"pokemon/{ResolveName(name)}", CancellationToken.None);
            if (result.Content.ReadAsStringAsync().Result.Equals("Not Found")) return false;
            return true;
        }
    }
}