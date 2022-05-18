const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./api/routes/apiRouter.js']

swaggerAutogen(outputFile, endpointsFiles, {schemes: ['https'],basePath: "/api", host: "lava-jato-api.herokuapp.com"}).then(() => {
    require('./server.js')
})