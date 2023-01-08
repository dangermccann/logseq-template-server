const AWS = require('aws-sdk');
const data = require('./data-access')

const dynamo = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    
    let body;
    let statusCode = '200';
    let method = event.requestContext.http.method
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
            
        let parts = event.rawPath.split('/');
        let path = parts[parts.length - 1];
        
        switch(path) {
            case 'templates':
                if(method == 'GET') {
                    if(event.queryStringParameters.user) {
                        body = await data.getUserTemplates(event.queryStringParameters.user)
                    }
                    else if(event.queryStringParameters.new) {
                        body = await data.getMostRecentTemplates(event.queryStringParameters.filter)
                    }
                    else if(event.queryStringParameters.popular) {
                        body = await data.getMostPopularTemplates(event.queryStringParameters.filter)
                    }
                    else {
                        statusCode = '400'
                        body = 'Invalid arguments'
                    }
                }
                else {
                    statusCode = '405'
                    body = 'Invalid method'
                }
                break;
            
            case 'template':
                if(method == 'PUT') {
                    let params = JSON.parse(event.body)
                    body = await data.insertTemplate(params.user, params.template, params.description, params.content)
                }
                else if(method == 'DELETE') {
                    let params = JSON.parse(event.body)
                    body = await data.deleteTemplate(params.user, params.template)
                }
                else {
                    statusCode = '405'
                    body = 'Invalid method'
                }
                break;
            
            case 'templatePopularity':
                if(method == 'PUT') {
                    let params = JSON.parse(event.body)
                    body = await data.incrementPopularity(params.user, params.template, params.amount || 1)
                }
                else {
                    statusCode = '405'
                    body = 'Invalid method'
                }
                break;
            
            case 'userLoves':
                if(method == 'GET') {
                    body = await data.getUserLoves(event.queryStringParameters.user)
                }
                else {
                    statusCode = '405'
                    body = 'Invalid method'
                }
                break;
            
            case 'userLove':
                if(method == 'PUT') {
                    let params = JSON.parse(event.body)
                    body = await data.addUserLove(params.user, params.lovedUser, params.lovedTemplate)
                }
                else if(method == 'DELETE') {
                    let params = JSON.parse(event.body)
                    body = await data.removeUserLove(params.user, params.lovedUser, params.lovedTemplate)
                }
                else {
                    statusCode = '405'
                    body = 'Invalid method'
                }
                break;
            
            default:
                body = 'Alive'
                break;
        }

    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
