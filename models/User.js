Ext.define('User', {
  extend: 'Ext.data.Model',
  fields: [
    { name: '_id',     type: 'string', persist: true },
    { name: 'name',    type: 'string' },
    { name: 'created', type: 'string' },
    { name: 'nope',    type: 'string', persist: false }
  ],

  validations: [
    { field: 'name', type: 'presence', message: 'A name is required.' }
  ]
});
