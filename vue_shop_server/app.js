const express = require('express')
const compression = require('compression')
const app = express()
// gzip压缩，一定要把这一行代码写到静态资源托管之前
app.use(compression())
app.use(express.static('./dist'))

app.listen(4000, () => {
    console.log('server running at http://localhost:4000')
})