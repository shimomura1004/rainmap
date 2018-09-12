var Jimp = require('jimp')
var express = require('express')

const PORT = process.env.PORT || 8080
const [mapFromX, mapFromY] = process.env.MAP_FROM.split("_").map(n => parseInt(n))
const [mapToX, mapToY] = process.env.MAP_TO.split("_").map(n => parseInt(n))
const [rainMapFromX, rainMapFromY] = process.env.RAINMAP_FROM.split("_").map(n => parseInt(n))
const [rainMapToX, rainMapToY] = process.env.RAINMAP_TO.split("_").map(n => parseInt(n))

// todo: cache generated basemap
let generateBaseMap = () => {
    let base = new Jimp(128 * (mapToX - mapFromX + 1), 128 * (mapToY - mapFromY + 1))

    let coords = []
    for (var x = mapFromX; x <= mapToX; x++) {
        for (var y = mapFromY; y <= mapToY; y++) {
            coords.push([x,y])
        }    
    }

    let maps = coords.map(coord => Jimp.read(`https://cyberjapandata.gsi.go.jp/xyz/pale/15/${coord[0]}/${coord[1]}.png`))
    return Promise.all(maps).then(maps => {
        maps.map(map => map.resize(128, 128))
        for (var x = 0; x <= mapToX - mapFromX; x++) {
            for (var y = 0; y <= mapToY - mapFromY; y++) {
                base.composite(maps[x * (mapToY - mapFromY + 1) + y], 128 * x, 128 * y)
            }
        }
        return Promise.resolve(base)
    })
}

let generateCurrentRainMap = (date, time) => {
    return generateBaseMap().then(base => {
        let coords = []
        for (var x = rainMapFromX; x <= rainMapToX; x++) {
            for (var y = rainMapFromY; y <= rainMapToY; y++) {
                coords.push([x,y])
            }    
        }
    
        let rainmaps = coords.map(coord => Jimp.read(`https://dufgzh2t.user.webaccel.jp/radar/${date}${time}00/14/${coord[1]}/${coord[0]}.png`))
        return Promise.all(rainmaps).then(rains => {
            rains.map(rain => rain.opacity(0.6))
            for (var x = 0; x <= rainMapToX - rainMapFromX; x++) {
                for (var y = 0; y <= rainMapToY - rainMapFromY; y++) {
                    base.composite(rains[x * (rainMapToY - rainMapFromY + 1) + y],x * 256, y * 256)
                }
            }
            return Promise.resolve(base)
        })
    })
}

var app = express()
app.get('/:date/:time.png', (req, res) => {
    generateCurrentRainMap(req.params['date'], req.params['time']).then(rainmap => {
        rainmap.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
            res.set('Content-Type', Jimp.MIME_JPEG)
            res.send(buf)
        })
    })
})

app.listen(PORT)
