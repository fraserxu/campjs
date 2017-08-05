const hypercore = require('hypercore')
const hyperdiscovery = require('hyperdiscovery')

let feed = hypercore('./demo-dataset', { valueEncoding: 'utf-8' })

let swarm
feed.on('ready', () => {
  console.log('ready...')
  swarm = hyperdiscovery(feed, {live: true})
  swarm.on('connection', (peer, type) => {
    console.log('connected to', swarm.connections.length, 'peers')
  })
})

feed.append('hello')
feed.append('world', err => {
  if (err) throw err
  feed.get(0, console.log)
  feed.get(1, console.log)

  console.log(feed.key.toString('hex'))
})

setTimeout(() => {
  console.log('keep alive')
}, 100000)
