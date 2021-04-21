using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Database.Schemas
{

    public class DraftSchema : BaseSchema
    {
        public DraftSchema(BsonDocument document): base(document){}

        public FilterDefinition<BsonDocument> Filter
        {
            get { return Builders<BsonDocument>.Filter.Eq("channel_id", Document["channel_id"]); }
        }
        public string LeagueName
        {
            get { return Document["league_name"].AsString; }
            set
            {
                Document["league_name"] = value;
                MongoHelper.Draft.UpdateAsync(Filter,Document).GetAwaiter().GetResult();
            }
        }

        public List<string> Pokemons
        {
            get
            {
                var list = new List<string>();
                foreach (var pokemon in Document["pokemons"].AsBsonArray)
                {
                    list.Add(pokemon.AsString);
                }

                return list;
            }
            set
            {
                Document["pokemons"] = BsonValue.Create(value);
                MongoHelper.Draft.UpdateAsync(Filter,Document).GetAwaiter().GetResult();
            }
        }

        public int Id
        {
            get { return Document["id"].AsInt32; }
            set
            {
                Document["id"] = value;
                MongoHelper.Draft.UpdateAsync(Filter,Document).GetAwaiter().GetResult();
            }
        }

        public int MaxRounds
        {
            get { return Document["max_rounds"].AsInt32;}
            set
            {
                Document["max_rounds"] = value;
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }

        public int TotalSkips
        {
            get { return Document["total_skips"].AsInt32;}
            set
            {
                Document["total_skips"] = value;
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }

        public int Round
        {
            get { return Document["round"].AsInt32;}
            set
            {
                Document["round"] = value;
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }

        public ulong? CurrentPlayer
        {
            get { return ulong.Parse(Document["current_player"].AsString);}
            set
            {
                Document["current_player"] = value.ToString();
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }

        public string SheetId
        {
            get { return Document["sheet_id"].AsString;}
            set
            {
                Document["sheet_id"] = value;
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }

        public ulong ChannelId
        {
            get { return ulong.Parse(Document["channel_id"].AsString);}
            set
            {
                Document["channel_id"] = value.ToString();
                MongoHelper.Draft.UpdateAsync(Filter, Document).GetAwaiter().GetResult();
            }
        }
        
    }
    public class DraftTimerSchema : BaseSchema
    {
        public DraftTimerSchema(BsonDocument document) : base (document){}
        public string _Id
        {
            get { return Document["_id"].AsString; }
        }
        public string LeagueName
        {
            get { return Document["league_name"].AsString; }
            set { Document["league_name"] = value; }
        }
        public List<string> Pokemons
        {
            get
            {
                var list = new List<string>();
                foreach (var pokemon in Document["pokemons"].AsBsonArray)
                {
                    list.Add(pokemon.AsString);
                }

                return list;
            }
            set { Document["pokemon"] = BsonValue.Create(value); }
        }
        public string Id
        {
            get { return Document["id"].AsString; }
            set { Document["id"] = value; }
        }
        public int MaxRounds
        {
            get { return Document["max_rounds"].AsInt32; }
            set { Document["max_rounds"] = value; }
        }

        public int TotalSkips
        {
            get { return Document["total_skips"].AsInt32; }
            set { Document["total_skips"] = value; }
        }

        public int Round
        {
            get { return Document["round"].AsInt32; }
            set { Document["round"] = value; }
        }

        public ulong? CurrentPlayer
        {
            get { return ulong.Parse(Document["current_player"].AsString); }
            set { Document["current_player"] = value.ToString(); }
        }

        public string SheetId
        {
            get { return Document["sheet_id"].AsString; }
            set { Document["sheet_id"] = value; }
        }

        public ulong ChannelId
        {
            get { return ulong.Parse(Document["channel_id"].AsString); }
            set { Document["channel_id"] = value.ToString(); }
        }

        public ulong DraftingRoleId
        {
            get { return ulong.Parse(Document["drafting_role_id"].AsString); }
            set { Document["drafting_channel_id"] = value.ToString(); }
        }

        public ulong DraftingChannelId
        {
            get { return ulong.Parse(Document["drafting_channel_id"].AsString); }
            set { Document["drafting_channel_id"] = value.ToString(); }
        }

        public ulong GuildId
        {
            get { return ulong.Parse(Document["server_id"].AsString); }
            set { Document["server_id"] = value.ToString(); }
        }

        public uint Timer
        {
            get { return uint.Parse(Document["timer"].AsString); }
            set { Document["timer"] = Int32.Parse(value.ToString()); }
        }

        public ModeData Modes
        {
            get
            {
                var data = new ModeData
                {
                    Dm = Document["modes"]["dm"].AsBoolean,
                    Skips = Document["modes"]["skips"].AsBoolean,
                    Text = Document["modes"]["text"].AsBoolean
                };

                return data;
            }
            set
            {
                Document["modes"]["dm"] = value.Dm;
                Document["modes"]["skips"] = value.Skips;
                Document["modes"]["text"] = value.Text;
            }
        }

        public bool Pause
        {
            get { return Document["pause"].AsBoolean; }
            set { Document["pause"] = value; }
        }

        public List<TierData> Tiers
        {
            get
            {
                var list = new List<TierData>();
                foreach (var tier in Document["tiers"].AsBsonArray)
                {
                }
                return list;
            }
        }

        public List<PlayerData> Players
        {
            get
            {
                var list = new List<PlayerData>();
                foreach (var player in Document["players"].AsBsonArray)
                {
                    var data = new PlayerData
                    {
                        UserId = ulong.Parse(player.AsBsonArray["user_id"].AsString),
                        Order = player.AsBsonArray["order"].AsInt32,
                        Skips = player.AsBsonArray["skips"].AsInt32,
                        Done = player.AsBsonArray["done"].AsBoolean,
                        Pokemon = new List<string>(),
                        Queue = new List<string>()
                    };
                    
                    foreach (var pokemon in player.AsBsonArray["pokemon"].AsBsonArray)
                    {
                        data.Pokemon.Add(pokemon.AsString);
                    }

                    foreach (var pokemon in player.AsBsonArray["queue"].AsBsonArray)
                    {
                        data.Pokemon.Add(pokemon.AsString);
                    }
                }
                return list;
            }
        }
    }

    public struct PlayerData
    {
        public List<string> Pokemon { get; set; }
        public List<string> Queue { get; set; }
        public ulong UserId { get; set; }
        public int Order { get; set; }
        public int Skips { get; set; }
        public bool Done { get; set; }
    }

    public struct ModeData
    {
        public bool Dm { get; set; }
        public bool Skips { get; set; }
        public bool Text { get; set; }
    }

    public struct TierData
    {
        public string Name { get; set; }
        public int Points { get; set; }
        public List<string> Pokemons { get; set; }
    }
}