const express = require('express')
const AWS = require('aws-sdk')
const DynamoDB = AWS.DynamoDB

const app = express()
const port = 3000

const dynamoDbClient = new DynamoDB.DocumentClient({ region: 'us-east-1' })

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/query', (req, res) => {
    const params = {
        TableName: 'logseq-templates-test',
        KeyConditionExpression: '#id = :value',
        ExpressionAttributeNames: {
            "#id": "user-id"
        },
        ExpressionAttributeValues: {
            ':value': req.query.id,
        },
    };
      
    dynamoDbClient.query(params, (error, data) => {
        if (error) {
            console.log("DynamoDB query error", error);
            res.status(500).send(error)
        } else {
            res.send(data.Items)
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})