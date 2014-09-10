require('node-extjs');
var fs = require('fs');
var vm = require('vm');

module.exports = function (cfg) {
  fs.readdirSync(cfg.modelDir).forEach(function (filename) {
    console.log('Loaded model: ' + filename);
    filename = cfg.modelDir + '/' + filename;
    vm.runInThisContext(fs.readFileSync(filename), filename);
  });

  return function (obj, model) {
    var record = Ext.create(model, obj);
    var errors = record.validate();
    return errors.length === 0 || errors.items;
  };
};
