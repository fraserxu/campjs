const getMedia = require('getusermedia')
const recorder = require('media-recorder-stream')
const WebTorrent = require('webtorrent')

const client = new WebTorrent()

const mediaConstraints = {
  audio: true,
  video: true
}

const streamToWebmBuffer = (chunk, cb) => {
  const blob = new Blob([chunk], {
    type: 'video/webm'
  })
  const reader = new FileReader()

  reader.onload = () => {
    let buffer = new Buffer(reader.result)
    cb(buffer)
  }

  reader.readAsArrayBuffer(blob)
}

getMedia(mediaConstraints, (err, media) => {
  if (err) throw err

  let stream = recorder(media, {interval: 5000})

  stream.on('data', data => {
    streamToWebmBuffer(data, buffer => {
      client.seed(buffer, torrent => {
        console.log('Client is seeding: ', torrent)
      })

      client.on('error', error => {
        console.log('Torrent error: ', error)
      })
    })
  })

  // lets display the recorded video as well
  // let video = document.createElement('video')
  // video.src = URL.createObjectURL(stream.media)
  // video.autoplay = true
  // document.body.appendChild(video)
})
