const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000
var bodyParser = require('body-parser')


// middleware
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello Espresso emporium')
})

app.listen(port, () => {
    console.log(`Espresso emporium app listening on port ${port}`)
})