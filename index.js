const express = require('express')
const { open } = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'products.db')

//initialize database
let db = null

const initialiseServerAdDatabase = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(1234, () => console.log('Server is running at http://localhost:1234'))
    } catch (e) {
        console.log(e.message)
        proccess.exit(1)
    }
}

initialiseServerAdDatabase()

const getData = async () => {
    const response = await fetch("https://s3.amazonaws.com/roxiler.com/product_transaction.json")
    const data = await response.json()

    let table = `
     CREATE TABLE product(
        id  NOT NULL PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        image TEXT,
        sold BOOLEAN,
        date_of_sale DATET
        );
    `

    try {
        await db.run(table)
        const each = data[0]
        const insert_values = `
          INSERT INTO 
            product(
                id, title, description, category, image, sold, date_of_sale
            )
          VALUES
          (${each.id}, "${each.title}", "${each.description}", "${each.category}", "${each.image}", ${each.sold}, "${each.dateOfSale}")  
        ;`

        await db.run(insert_values)
        console.log('Products table created successfully')

    } catch (error) {
        console.log(error)
    }
}

getData()



app.get("/", async(req,res) => {
    const SQL_QUERRY = `SELECT * FROM product;`
    const dbResponse = await db.all(SQL_QUERRY)
    
    res.send(dbResponse)
})

