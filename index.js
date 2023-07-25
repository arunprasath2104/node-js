const express = require('express')
const { open } = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'studend.db')

console.log('aaa')

//hello
let db = null

const initialiseServerAdDatabase = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(1234, () => console.log('success'))
    } catch (e) {
        console.log(e.message)
        proccess.exit(1)
    }
}

initialiseServerAdDatabase()

app.get('/', (request, response) => {
    response.send('Vetri')
})


