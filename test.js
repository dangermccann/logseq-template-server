/*
delete require.cache[require.resolve('./data-access.js')]
data = require('./data-access')
*/

const dataAccess = require('./data-access')

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
