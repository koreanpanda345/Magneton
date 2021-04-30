using System;
using System.Linq;
using System.Threading.Tasks;
using Magneton.Bot.Core.Database.Managers;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Database
{
    public static class MongoHelper
    {
        private static IMongoClient client { get; set; }
        public static IMongoDatabase database { get; set; }
        public static string MongoConnection = string.Empty;
        public static string MongoDatabase = string.Empty;

        internal static void ConnectToMongoService()
        {
            try
            {
                client = new MongoClient(MongoConnection);
                database = client.GetDatabase(MongoDatabase);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        internal static DraftManager Draft
        {
            get { return new DraftManager(client, database); }
        }
    }
}