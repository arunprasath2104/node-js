const express = require('express')
const { open } = require('sqlite')
const path = require('path')
const fetch = require('node-fetch')
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
        price FLOAT,
        description TEXT,
        category TEXT,
        image TEXT,
        sold BOOLEAN,
        date_of_sale DATET
        );
    `

    try {
        await db.run(table)
        
        const values = data.map((each)=>{
           return `(${each.id}, "${each.title}", ${each.price}, "${each.description}", "${each.category}", "${each.image}", ${each.sold}, "${each.dateOfSale}")`
        }).join(', ')
        const insert_values = `
          INSERT INTO 
            product(
                id, title, price, description, category, image, sold, date_of_sale
            )
          VALUES
            ${values}
        ;`

        await db.run(insert_values)
        console.log('Products table created successfully')

    } catch (error) {
        console.log("Already product table exists")
    }
}

getData()



app.get("/", async(req,res) => {
    const SQL_QUERRY = `SELECT * FROM product;`
    const dbResponse = await db.all(SQL_QUERRY)
    res.send(dbResponse)

    const deleteTableQuery = `DROP TABLE product;`
    db.run(deleteTableQuery)
})

app.get('/statistics/:month', async(req,res)=>{
    const {month} = req.params

    const quary = `
        SELECT 
        COUNT(
            CASE
                WHEN sold = true THEN 1
                END 
        ) as sold_items,
        COUNT(
            CASE
                WHEN sold <> true THEN 1
                END 
        ) as unsold_items,
        SUM(
            CASE
                WHEN sold = true THEN price
                END 
        ) as total_sale_price
        FROM product
        WHERE strftime('%m',date_of_sale) = "${month}"
    ;`;

    const need_data = await db.get(quary)

    res.send(need_data)
})

