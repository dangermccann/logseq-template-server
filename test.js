/*
delete require.cache[require.resolve('./data-access.js')]
data = require('./data-access')
*/

const dataAccess = require('./data-access')
const infra = require('./infra')

exports.createItems = async function() {
    let count = 100;
    for(var i = 0; i < count; i++) {
        await dataAccess.insertTemplate(`user ${i}`, `Template Name ${i}`, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua')
    }
    console.log(`Created ${count} templates`)
}

exports.deleteItems = async function() {
    let count = 100;
    for(var i = 0; i < count; i++) {
        await dataAccess.deleteTemplate(`user ${i}`, `Template Name ${i}`)
    }
    console.log(`Deleted ${count} templates`)
}

exports.setup = async function() {
    await infra.createMainTable()
    console.log('Main table created')
    waitForTable(infra.table)
    console.log('Main table is ready')

    await infra.createUserLovesTable()
    console.log('UserLoves table created')
    await waitForTable(infra.userLovesTable)
    console.log('UserLoves table is ready')
}

exports.tearDown = async function() {
    await infra.deleteMainTable()
    await infra.deleteUserLovesTable()
}

async function waitForTable(name) {
    while(true) {
        await delay(1000);
        let poll = await infra.describeTable(name)
        if(poll.Table.TableStatus === 'ACTIVE')
            break;
    }
}

async function delay(amount) {
    return new Promise((resolve) => { 
        setTimeout(() => {
            resolve()
        }, amount);
    })
}