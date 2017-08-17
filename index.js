var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var builtinTypes = require('comparable-storable-types')
var Readable = require('stream').Readable

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

FixedGridPointStore.prototype.insert = function (pt, value, cb) {
  if (!Array.isArray(pt) || pt.length !== 2) throw new Error('param "pt" must be a 2d array')

  // lat/lon to tile x/y
  var y = latToMercator(pt[0], this.mapSize)
  var x = lonToMercator(pt[1], this.mapSize)

  // check bounds
  if (x < 0 || x > this.mapSize || y < 0 || y > this.mapSize) {
    return process.nextTick(cb, new Error('point falls outside of map!'))
  }

  var filename = path.join(this.dir, y + ',' + x)

  // encode point
  var data = new Buffer(this.pointType.size * 2 + this.valueType.size)
  var pos = 0
  this.pointType.write(data, pt[0], pos); pos += this.pointType.size
  this.pointType.write(data, pt[1], pos); pos += this.pointType.size
  this.valueType.write(data, value, pos);

  // TODO: use a subdir for each row

  fs.appendFile(filename, data, 'binary', cb)
}

FixedGridPointStore.prototype.queryStream = function (q, opts) {
  var self = this

  var topLeftY = latToMercator(q[0][0], this.mapSize)
  var topLeftX = lonToMercator(q[0][1], this.mapSize)
  var bottomRightY = latToMercator(q[1][0], this.mapSize)
  var bottomRightX = lonToMercator(q[1][1], this.mapSize)

  var y = topLeftY
  var x = topLeftX

  var stream = new Readable({ objectMode: true })
  var done = false
  var pending = 1

  // read one point file at a time
  stream._read = function () {
    if (done) return

    var myX = x
    var myY = y
    var filename = path.join(self.dir, myY + ',' + myX)
      console.log(filename)
    nextPoint()

    pending++
    fs.readFile(filename, 'binary', function (err, data) {
      if (err && err.code === 'ENOENT') {
        pending--
        return stream._read()
      }
      else if (err) {
        return stream.emit('error', err)
      }
      else {
        // decode and push the points
        var pos = 0
        data = new Buffer(data)
        console.log('len', data.length)
        while (pos < data.length) {
          var y = self.pointType.read(data, pos); pos += self.pointType.size
          var x = self.pointType.read(data, pos); pos += self.pointType.size
          var value = self.valueType.read(data, pos); pos += self.valueType.size
          stream.push({ x: x, y: y, value: value })
        }
        if (!--pending) onDone()
      }
    })
  }

  function nextPoint () {
    if (done) return
    x++
    if (x > bottomRightX) {
      y++
      x = topLeftX
    }
    if (y > bottomRightY) {
      console.log('done')
      done = true
    }
  }

  function onDone () {
    stream.push(null)
  }

  return stream
}

function latToMercator (lat, mapSize) {
  var y = Math.floor(((lat + 180) / 360) * mapSize)
  return y
}

function lonToMercator (lon, mapSize) {
  var x = Math.floor(((lon + 85.0511) / 170.1022) * mapSize)
  return x
}
