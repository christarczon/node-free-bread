module.exports = function (cfg) {
  if (!cfg) {
    throw new Error('fb-db-mongo: Configuration is required.');
  }

  if (!cfg.database) {
    throw new Error('fb-db-mongo: No database was specified.')
  }

  var mongodb = require('mongodb');
  var mongo;
  var api = {
    connect: function (callback) {
      var host = cfg.host || '127.0.0.1';
      var port = cfg.port || 27017;
      var url = 'mongodb://' + host + ':' + port + '/' + cfg.database;

      mongodb.MongoClient.connect(
        url,
        { db: { native_parser: cfg.nativeParser !== false } },
        function (err, db) {
          if (err) {
            console.log('Unable to connect to Mongo database @ ' + url);
          }
          else {
            mongo = api.client = db;
          }
        
          callback(err);
        }
      );
    },

    browse: function (handler, callback) {
      var projection = handler.projections && handler.projections.browse || {};
      mongo.collection(handler.collection)
           .find({}, projection)
           .toArray(callback);
    },

    read: function (handler, key, callback) {
      callback(new Error('Not implemented.'));
    },

    edit: function (handler, key, document, callback) {
      callback(new Error('Not implemented.'));
    },

    add: function (handler, document, callback) {
      document.created = new mongodb.Timestamp();
      mongo.collection(handler.collection).insert(document, callback);
    },

    del: function (handler, key, callback) {
      callback(new Error('Not implemented.'));
    }
  }

  return api;
}
