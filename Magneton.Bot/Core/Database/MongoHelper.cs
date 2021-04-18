using System;
using System.Linq;
using System.Threading.Tasks;
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

        internal static BsonDocument GetData(FilterDefinition<BsonDocument> filter)
        {
            var collection = database.GetCollection<BsonDocument>("drafttimers");
            var result = collection.Find(filter).FirstOrDefault();
            return result;
        }

        internal static async Task UpdateDocument(FilterDefinition<BsonDocument> filter, BsonDocument update)
        {
            try
            {
                var collection = database.GetCollection<BsonDocument>("drafttimers");
                await collection.ReplaceOneAsync(filter, update).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Data);
                Console.WriteLine(ex.Message);
            }
        }

        internal static async Task DeleteDocument(FilterDefinition<BsonDocument> filter)
        {
            try
            {
                var collection = database.GetCollection<BsonDocument>("drafttimers");
                await collection.DeleteOneAsync(filter).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            
        }

        internal static async Task InsertDocument(BsonDocument document)
        {
            try
            {
                var collection = database.GetCollection<BsonDocument>("drafttimers");
                await collection.InsertOneAsync(document).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}