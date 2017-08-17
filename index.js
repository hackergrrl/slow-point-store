var builtinTypes = require('comparable-storable-types')

module.exports = FixedGridPointStore

function FixedGridPointStore (pointType, valueType) {
  if (!(this instanceof FixedGridPointStore)) return new FixedGridPointStore()
  if (!types) throw new Error('must provide "types" parameter')

  this.pointType = builtinTypes(pointType)
  this.valueType = builtinTypes(valueType)
}

FixedGridPointStore.prototype.insert = function (pt, value, cb) {
}

