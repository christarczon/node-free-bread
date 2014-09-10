var http = require('http');
var url = require('url');

function handleErr (res, fn, msg) {
  return function (err, arg) {
    if (err) {
      res.writeHead(500);
      res.end(msg || 'Internal Server Error: ' + err.message);
      console.log(err.stack);
    }
    else {
      fn(arg);
    }
  }
}

function notFound (res) {
  res.writeHead(404);
  res.end('Not Found');
}

function notAllowed (res) {
  res.writeHead(405);
  res.end('Method Not Allowed');
}

module.exports = function (cfg) {
  var db = cfg.db;
  var validate = cfg.validator;
  db.connect(function (err) {
    if (err) {
      console.dir(err);
      return;
    }

    console.log('Connected to database.');
  
    http.createServer(function (req, res) {
      var parts = url.parse(req.url).pathname.split('/');
      
      var handler = { handlers: cfg.handlers };
      var pathParams = {};
      var restful;
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
              console.log('Using restful handler for ' + parts[i - 1] + '/' + parts[i]);
              handler = lastHandler;
              restful = parts[i];
            }
            else {
              console.log('No handler for ' + parts[i]);
            }
          }
          else {
            console.log('Found handler for ' + parts[i]);
            handler.collection = handler.collection || parts[i];
          }
        }
      }
      
      if (handler && handler.restful === true) {
        handler.restful = 'bread';
      }
      
      if (!handler || (restful && !handler.restful.match(/[red]/))) {
        return notFound(res);
      }
      
      if (req.method === 'GET') {
        if (handler.get) {
          handler.get(req, res, db.client, pathParams);
        }
        else if (restful) {
          if (!handler.restful.match(/r/)) {
            return notAllowed(res);
          }

          db.read(handler, restful, handleErr(res, function (obj) {
            res.end(JSON.stringify(obj));
          }));
        }
        else if (handler.restful !== false) {
          db.browse(handler, handleErr(res, function (data) {
            res.end(JSON.stringify(data));
          }));
        }
        else {
          notFound(res);
        }
      }
      else if (req.method === 'POST') {
        if (handler.post) {
          handler.post(req, rest, db.client, pathParams);
        }
        else if (restful) {
          notAllowed(res);
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

            var validationResult = validate(json, handler.model);
            if (validationResult !== true) {
              res.writeHead(400);
              res.end(JSON.stringify(validationResult))
            }
            else {
              db.add(handler, json, handleErr(res, function (docs) {
                res.writeHead(201);
                res.end(JSON.stringify(docs));
              }));
            }
          });
        }
      }
    }).listen(cfg.port || 54313, cfg.host || cfg.public ? null : '127.0.0.1');
    
    console.log('Ready.');
  });
};
