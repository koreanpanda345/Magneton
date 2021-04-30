using MongoDB.Bson;

namespace Magneton.Bot.Core.Database.Schemas
{
    public class BaseSchema
    {
        private readonly BsonDocument _document;

        public BaseSchema(BsonDocument document) => _document = document;


        public BsonDocument Document
        {
            get { return _document; }
        }

        public override string ToString()
        {
            return _document.ToString();
        }
    }
}