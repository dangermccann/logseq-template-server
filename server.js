const express = require('express')
const AWS = require('aws-sdk')
const cors = require('cors')
const DynamoDB = AWS.DynamoDB

const app = express()
const port = 3000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const data = require('./data-access')

// TODO: do this only for dev environment 
app.use(cors({
    origin: 'http://localhost:1234'
}));
app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));


app.get('/', (req, res) => {
    res.send('Server is alive')
})

app.get('/templates', async (req, res) => {
    try {
        if(req.query.user) {
            res.send(await data.getUserTemplates(decodeURIComponent(req.query.user)))
        }
        else if(req.query.new) {
            res.send(await data.getMostRecentTemplates(decodeURIComponent(req.query.filter)))
        }
        else if(req.query.popular) {
            res.send(await data.getMostPopularTemplates(decodeURIComponent(req.query.filter)))
        }
        else res.status(400).send('Invalid parameters')
    }
    catch(e) {
        handleError(res, e)
    }
})

app.put('/template', async (req, res) => {
    try {
        res.send(await data.insertTemplate(req.body.user, req.body.template, req.body.description, req.body.content))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.delete('/template', async (req, res) => {
    try {
        res.send(await data.deleteTemplate(decodeURIComponent(req.query.user), decodeURIComponent(req.query.template)))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.put('/templatePopularity', async (req, res) => {
    try {
        res.send(await data.incrementPopularity(req.body.user, req.body.template, req.body.amount || 1))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.get('/userLoves', async (req, res) => {
    try {
        res.send(await data.getUserLoves(decodeURIComponent(req.query.user)))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.put('/userLove', async (req, res) => {
    try {
        res.send(await data.addUserLove(req.body.user, req.body.lovedUser, req.body.lovedTemplate))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.delete('/userLove', async (req, res) => {
    try {
        res.send(await data.removeUserLove(decodeURIComponent(req.query.user), decodeURIComponent(req.query.lovedUser), decodeURIComponent(req.query.lovedTemplate)))
    }
    catch(e) {
        handleError(res, e)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function handleError(res, e) {
    res.status(e.statusCode || 500).send(e.message || 'Unknown failure')
}