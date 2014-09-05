var bread = require('./free-bread');

bread.init({
  handlers: {
    users: {
      collection: 'users', // default
      projections: { // optional
        browse: {
          name: 1
        },
        read: {
          _id: 0
        }
      },
      // singleProjection optional
      model: 'Pricer.model.User',
      restful: 'bread', // or true
      key: '_id'
    },
    'claim-sets': {
      restful: false,
      handlers: {
        preview: {
          get: function previewClaimSet(req, res) {
            res.end('Preview!');
          }
        }
      }
    }
  }
});
