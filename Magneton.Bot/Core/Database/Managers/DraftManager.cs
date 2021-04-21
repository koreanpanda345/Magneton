using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Magneton.Bot.Core.Database.Managers
{
    public class DraftManager : BaseManager
    {
        
        public DraftManager(IMongoClient client, IMongoDatabase database): base(client, database) {}
        
        public async Task<BsonDocument> GetAsync(FilterDefinition<BsonDocument> filter)
        {
            var data = await _collection.FindAsync(filter).ConfigureAwait(false);
            return data.FirstOrDefault();
        }

        public async Task UpdateAsync(FilterDefinition<BsonDocument> filter, BsonDocument update)
            => await _collection.ReplaceOneAsync(filter, update).ConfigureAwait(false);

        public async Task DeleteAsync(FilterDefinition<BsonDocument> filter)
            => await _collection.DeleteOneAsync(filter).ConfigureAwait(false);

        public async Task InsertAsync(BsonDocument model)
            => await _collection.InsertOneAsync(model).ConfigureAwait(false);
    }
}