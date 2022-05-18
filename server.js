const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const apiRouter = require('./api/routes/apiRouter') 
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

var app = express()
app.use(cors()) 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const port = 5000
 
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
 
app.use ('/api', apiRouter) 

app.use('/app', express.static (path.join (__dirname, '/public'))) 

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile))
 
app.use(function (req, res, next) {
    res.status(404);
    res.send("Essa página não foi encontrada (404)");
})

app.listen(process.env.PORT || port, () => {
    console.log(`Now listening on port ${port}`);
})
