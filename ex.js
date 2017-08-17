var Store = require('.')

var db = Store('db', 'float64', 'int32', { zoomLevel: 16 })

// db.insert([-85.0511, -180], 0, function (err) {
// })
var n = 50000
var spread = 100
var pending = n
console.time('insert')
function insert () {
  if (!pending) return check()
  var x = Math.random() * spread - spread/2
  var y = Math.random() * spread - spread/2
  var loc = Math.floor(Math.random() * 1000)
  db.insert([x,y], loc, function (err) {
    pending--
    insert()
  })
}
insert()

function check () {
  console.timeEnd('insert')
}

// var q = db.queryStream([[-0.01,-0.01], [0.01,0.01]])
// q.on('data', console.log)
