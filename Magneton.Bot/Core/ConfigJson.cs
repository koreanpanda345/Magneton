using Newtonsoft.Json;

namespace Magneton.Bot.Core
{
    public struct ConfigJson
    {
        [JsonProperty("token")]
        public string Token { get; private set; }
        [JsonProperty("prefix")]
        public string Prefix { get; private set; }
        [JsonProperty("mongo_connection")]
        public string MongoConnection { get; private set; }
    }
}