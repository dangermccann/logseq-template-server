const AWS = require('aws-sdk')
const DynamoDB = AWS.DynamoDB

class DataAccess {
    constructor(region, table) {
        this.dynamoDbClient = new DynamoDB.DocumentClient({ region: region || 'us-east-1' })
        this.table = table || 'logseq-templates-test';
    }
    
    async insertTemplate(user, template, content) {
        const params = {
            TableName: this.table,
            Item: {
                User: user,
                Template: template,
                Status: "OK",
                Content: content,
                Popularity: 0,
                Timestamp: new Date().toISOString()
            }
        };

        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.put(params, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(data);
                }
                else {
                    resolve(err);
                }
            })
        });
    }

    async getUserTemplates(user) {
        const params = {
            TableName: this.table,
            KeyConditionExpression: '#user = :value',
            ExpressionAttributeNames: {
                "#user": "User"
            },
            ExpressionAttributeValues: {
                ':value': user,
            },
        };

        return this.query(params);
    }

    async getMostPopularTemplates(filter) {
        const params = {
            ProjectionExpression: "#status, #user, Template, Content, Popularity",
            TableName: this.table,
            IndexName: 'Status-Popularity-index',
            KeyConditionExpression: '#status = :value',
            ScanIndexForward: false,
            ExpressionAttributeNames: {
                "#status": "Status",
                "#user": "User",
            },
            ExpressionAttributeValues: {
                ':value': "OK",
            },
            Limit: 100
        };

        if(filter) {
            params.FilterExpression = `contains(Template, :template)`
            params.ExpressionAttributeValues[":template"] = filter;
        }

        return this.query(params)
    }

    async getMostRecentTemplates(filter) {
        const params = {
            ProjectionExpression: "#status, #timestamp, #user, Template, Content, Popularity",
            ExpressionAttributeNames: {
                "#status": "Status",
                "#user": "User",
                "#timestamp": "Timestamp"
            },
            ExpressionAttributeValues: {
                ':value': "OK",
            },
            ScanIndexForward: false,
            TableName: this.table,
            IndexName: 'Status-Timestamp-index',
            KeyConditionExpression: '#status = :value',
            Limit: 100
        };

        if(filter) {
            params.FilterExpression = `contains(Template, :template)`
            params.ExpressionAttributeValues[":template"] = filter;
        }

        return this.query(params)
    }

    async incrementPopularity(user, template, amount) {
        return this.update({
            TableName: this.table,
            Key: { 
                User: user,
                Template: template
            },
            ExpressionAttributeValues: { ":inc": amount },
            UpdateExpression: "ADD Popularity :inc"
        })
    }

    async updateStatus(user, template, status) {
        return this.update({
            TableName: this.table,
            Key: { 
                User: user,
                Template: template
            },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: { "#status": "Status" },
            ExpressionAttributeValues: { ":status": status }
        })
    }

    async deleteTemplate(user, template) {
        const params = {
            TableName: this.table,
            Key: { 
                User: user,
                Template: template
            }
        };
        
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.delete(params, (error, data) => {
                if (error) {
                    console.log("DynamoDB delete error", error);
                    reject(error)
                } else {
                    resolve(data)
                }
            });
        })
    }

    async scan(params) {
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.scan(params, async (error, data) => {
                if (error) {
                    console.log("DynamoDB scan error", error);
                    reject(error)
                } else {
                    if(data.LastEvaluatedKey) {
                        params.ExclusiveStartKey = data.LastEvaluatedKey
                        let more = await this.scan(params)
                        data.Items.concat(more)
                        resolve(data.Items)
                    }
                    else {
                        resolve(data.Items)
                    }
                }
            });
        })
    }

    async update(params) {
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.update(params, (error, data) => {
                if (error) {
                    console.log("DynamoDB update error", error);
                    reject(error)
                } else {
                    resolve(data)
                }
            });
        })
    }

    async query(params) {
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.query(params, (error, data) => {
                if (error) {
                    console.log("DynamoDB query error", error);
                    reject(error)
                } else {
                    resolve(data.Items)
                }
            });
        })
    }
}

module.exports = new DataAccess()
