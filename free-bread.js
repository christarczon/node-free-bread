require('node-extjs');
var http = require('http');
var url = require('url');
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var mongo;
MongoClient.connect('mongodb://127.0.0.1:27017/test', { db: { native_parser: true } }, function (err, db) {
  if (err) {
    throw err;
  }
  
  mongo = db;
});

var root =
 {
  handlers:
 {
    users:
 {
      collection: 'users', // default
      projection2: {
 // optional
        _id: 0,
        name: 1
      },
      // singleProjection optional
      model: 'Pricer.model.User',
      restful: 'crud', // or true
      key: '_id'
    },
    'claim-sets':
 {
      restful: false,
      handlers:
 {
        preview:
 {
          get: function previewClaimSet(req, res) {
            res.end('Preview!');
          }
        }
      }
    }
  }
};

http.createServer(function (req, res) {
  var parts = url.parse(req.url).pathname.split('/');
  
  var handler = root;
  var pathParams = {};
  var restful;
  var collection;
  if (parts.length === 1) {
    handler = root.handlers['/'];
  }
  else {
    for (var i = 1; i < parts.length; i++) {
      restful = false;
      var lastHandler = handler;
      var handler = lastHandler.handlers && lastHandler.handlers[parts[i]];
      if (!handler) {
        pathParams[lastHandler.key || (parts[i - 1] + '-key')] = parts[i];
        if (lastHandler.restful) {
          handler = lastHandler;
          restful = parts[i];
        }
      }
      else {
        collection = handler.collection || parts[i];
      }
    }
  }
  
  if (handler && handler.restful === true) {
    handler.restful = 'crud';
  }
  
  if (!handler || (restful && !handler.restful.match(/[rud]/))) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  if (req.method === 'GET') {
    if (handler.get) {
      handler.get(req, res, pathParams);
    }
    else if (restful) {
      if (!handler.restful.match(/r/)) {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
      }
			// mongo findOne
    }
    else if (handler.restful !== false) {
      mongo.collection(collection).find({}, handler.projection || {}).toArray(function (err, results) {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify(err));
          return;
        }
        
        res.end(JSON.stringify(results));
      });
    }
    else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
  else if (req.method === 'POST') {
    if (handler.post) {
      handler.post(req, rest, pathParams);
    }
    else if (restful) {
      res.writeHead(405);
      res.end('Method Not Allowed');
    }
    else {
      var body = '';
      req.on('data', function (chunk) {
        body += chunk;
      });
      req.on('end', function () {
        try {
          var json = JSON.parse(body);
        }
				catch (e) {
          res.writeHead(400);
          res.end('Unable to parse body.');
          console.dir(e);
          return;
        }
        
        json.created = new mongodb.Timestamp();
        
        mongo.collection(collection).insert(json, function (err, docs) {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }
          
          res.writeHead(201);
          res.end(JSON.stringify(docs));
        });
      });
    }
  }
}).listen(80, '127.0.0.1');

console.log('Ready.');
