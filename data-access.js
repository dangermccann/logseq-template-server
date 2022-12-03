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
                Content: content,
                Loves: 0,
                Downloads: 0,
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

    async getMostLovedTemplates() {
        const params = {
            ProjectionExpression: "#user, Template, Content, Loves, Downloads",
            ExpressionAttributeNames: {
                "#user": "User"
            },
            TableName: this.table,
            IndexName: 'Loves-Template-index',
            Limit: 100
        };

        return this.scan(params)
    }

    async getMostDownloadedTemplates(filter) {
        const params = {
            ProjectionExpression: "#user, Template, Content, Loves, Downloads",
            ExpressionAttributeNames: {
                "#user": "User"
            },
            TableName: this.table,
            IndexName: 'Downloads-Template-index',
            Limit: 100
        };

        if(filter) {
            params.FilterExpression = `contains(Template, :template)`
            params.ExpressionAttributeValues = { ":template": filter }
        }

        return this.scan(params)
    }

    async getMostRecentTemplates() {
        const params = {
            ProjectionExpression: "#timestamp, #user, Template, Content, Loves, Downloads",
            ExpressionAttributeNames: {
                "#user": "User",
                "#timestamp": "Timestamp"
            },
            TableName: this.table,
            IndexName: 'Timestamp-index',
            Limit: 100
        };

        return this.scan(params)
    }

    async incrementDownloads(user, template) {
        return this.update({
            TableName: this.table,
            Key: { 
                User: user,
                Template: template
            },
            ExpressionAttributeValues: { ":inc": 1 },
            UpdateExpression: "ADD Downloads :inc"
        })
    }

    async incrementLoves(user, template) {
        return this.update({
            TableName: this.table,
            Key: { 
                User: user,
                Template: template
            },
            ExpressionAttributeValues: { ":inc": 1 },
            UpdateExpression: "ADD Loves :inc"
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
