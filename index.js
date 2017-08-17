var fs = require('fs')
var mkdirp = require('mkdirp')
var builtinTypes = require('comparable-storable-types')

module.exports = FixedGridPointStore

function FixedGridPointStore (dir, pointType, valueType) {
  if (!(this instanceof FixedGridPointStore)) return new FixedGridPointStore()
  if (!pointType) throw new Error('must provide "pointType" parameter')
  if (!valueType) throw new Error('must provide "valueType" parameter')

  this.dir = dir
  this.pointType = builtinTypes(pointType)
  this.valueType = builtinTypes(valueType)

  // Let it throw if 'dir' is no good. Doing this sync ensures the store is
  // ready to go immediately after it's created.
  mkdirp.sync(dir)
}

FixedGridPointStore.prototype.insert = function (pt, value, cb) {
}

