const AWS = require('aws-sdk')
const DynamoDB = AWS.DynamoDB

class Infra {
    constructor(region, table, userLovesTable) {
        this.dynamoDbClient = new DynamoDB({ region: region || 'us-east-1' })
        this.table = table || 'logseq-templates';
        this.userLovesTable = userLovesTable || 'logseq-templates-user-loves';
    }

    async createTables() {
        await this.createMainTable()
        await this.createUserLovesTable()
    }

    async deleteTables() {
        await this.deleteMainTable()
        await this.deleteUserLovesTable()
    }

    async describeTable(name) {
        return new Promise((resolve, reject) => { 
            const params = {
                TableName: name
            }

            this.dynamoDbClient.describeTable(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    resolve(data)
                }
            });
        })
    }

    async createMainTable() {
        var params = {
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [ 
                {
                    AttributeName: 'User',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'Template',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'Status',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'Popularity',
                    AttributeType: 'N'
                },
                {
                    AttributeName: 'Timestamp',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'User',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'Template',
                    KeyType: 'RANGE'
                }
            ],
            TableName: this.table,
            StreamSpecification: {
                StreamEnabled: false
            },
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'Status-Popularity-index',
                    KeySchema: [
                        {
                            AttributeName: 'Status',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'Popularity',
                            KeyType: 'RANGE'
                        }                        
                    ],
                    Projection: {
                        NonKeyAttributes: ['Content', 'Template', 'User', 'Description', 'SearchTerm'],
                        ProjectionType: 'INCLUDE'
                    }
                },
                {
                    IndexName: 'Status-Timestamp-index',
                    KeySchema: [
                        {
                            AttributeName: 'Status',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'Timestamp',
                            KeyType: 'RANGE'
                        }                        
                    ],
                    Projection: {
                        NonKeyAttributes: ['Content', 'Template', 'User', 'Popularity', 'Description', 'SearchTerm'],
                        ProjectionType: 'INCLUDE'
                    }
                }
            ],
            Tags: [ 
                { 
                   Key: "logseq",
                   Value: ""
                }
            ]
        };
        
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.createTable(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    console.log("Table Created", data);
                    resolve(data)
                }
            });
        })
    }

    async createUserLovesTable() {
        var params = {
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [ 
                {
                    AttributeName: 'User',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'LovedTemplate',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'User',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'LovedTemplate',
                    KeyType: 'RANGE'
                }
            ],
            TableName: this.userLovesTable,
            StreamSpecification: {
                StreamEnabled: false
            },
            Tags: [ 
                { 
                   Key: "logseq",
                   Value: ""
                }
            ]
        };
        
        return new Promise((resolve, reject) => { 
            this.dynamoDbClient.createTable(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    console.log("Table Created", data);
                    resolve(data)
                }
            });
        })
    }

    async deleteMainTable() {
        return new Promise((resolve, reject) => { 
            const params = {
                TableName: this.table
            }

            this.dynamoDbClient.deleteTable(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    console.log("Table Deleted", data);
                    resolve(data)
                }
            });
        })
    }

    async deleteUserLovesTable() {
        return new Promise((resolve, reject) => { 
            const params = {
                TableName: this.userLovesTable
            }
            
            this.dynamoDbClient.deleteTable(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    console.log("Table Deleted", data);
                    resolve(data)
                }
            });
        })
    }
}


module.exports = new Infra()