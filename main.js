require('./free-bread')({
  port: 80,
  public: true,
  db: require('./fb-db-mongo')({
    database: 'test'
  }),
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
