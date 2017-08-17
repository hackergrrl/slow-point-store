var builtinTypes = require('comparable-storable-types')

module.exports = FixedGridPointStore

function FixedGridPointStore (pointType, valueType) {
  if (!(this instanceof FixedGridPointStore)) return new FixedGridPointStore()
  if (!pointType) throw new Error('must provide "pointType" parameter')
  if (!valueType) throw new Error('must provide "valueType" parameter')

  this.pointType = builtinTypes(pointType)
  this.valueType = builtinTypes(valueType)
}

FixedGridPointStore.prototype.insert = function (pt, value, cb) {
}

