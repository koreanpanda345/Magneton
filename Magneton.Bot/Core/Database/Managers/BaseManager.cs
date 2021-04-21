using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Database.Managers
{
    public class BaseManager
    {
        private IMongoClient _client { get; set; }
        public IMongoDatabase _database { get; set; }
        public IMongoCollection<BsonDocument> _collection { get; private set; }
        public BaseManager(IMongoClient client, IMongoDatabase database)
        {
            _client = client;
            _database = database;
            _collection = _database.GetCollection<BsonDocument>("drafttimers");
        }

        
        
        
    }
}