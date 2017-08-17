var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var builtinTypes = require('comparable-storable-types')

module.exports = FixedGridPointStore

function FixedGridPointStore (dir, pointType, valueType, opts) {
  if (!(this instanceof FixedGridPointStore)) return new FixedGridPointStore(dir, pointType, valueType, opts)
  if (!pointType) throw new Error('must provide "pointType" parameter')
  if (!valueType) throw new Error('must provide "valueType" parameter')
  opts = opts || {}

  this.dir = dir
  this.pointType = builtinTypes(pointType)
  this.valueType = builtinTypes(valueType)

  // OSM-style zoom level: http://wiki.openstreetmap.org/wiki/QuadTiles
  this.zoomLevel = opts.zoomLevel || 16
  this.mapSize = Math.pow(2, this.zoomLevel) - 1

  // Let it throw if 'dir' is no good. Doing this sync ensures the store is
  // ready to go immediately after it's created.
  mkdirp.sync(dir)
}

// TODO: use a subdir for each row
FixedGridPointStore.prototype.insert = function (pt, value, cb) {
  if (!Array.isArray(pt) || pt.length !== 2) throw new Error('param "pt" must be a 2d array')

  var y = Math.floor(((pt[1] + 180) / 360) * this.mapSize)
  var x = Math.floor(((pt[0] + 85.0511) / 170.1022) * this.mapSize)

  if (x < 0 || x > this.mapSize || y < 0 || y > this.mapSize) {
    return process.nextTick(cb, new Error('point falls outside of map!'))
  }

  var filename = path.join(this.dir, y + ',' + x)
}

