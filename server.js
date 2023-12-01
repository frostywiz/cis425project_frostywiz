const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mysql = require('mysql');
const qs = require('querystring');
const { errorMonitor } = require('stream');
// Import the MongoClient from the MongoDB node.js driver
const { MongoClient } = require('mongodb');

// Our database table name.
const db = 'OrdersDB';

const con = mysql.createConnection({
    host: 'sql.wpc-is.online',
    // host: 'localhost',
    user: 'ctfrost',
    password: 'ctfr0667',
    database: 'db_test_ctfrost',
});

con.connect();

const uri = "mongodb+srv://calebfrost1:ShcgzzSXSPasfCXK@cluster0.sfoie59.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(client)

async function connectToMongoDB() {
    try {
        await client.connect();
        const database = client.db('OrdersDB');
        const collection = database.collection('orders');
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas');
    }
};

connectToMongoDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

// This gets request from the contact page after hitting submit.
app.post('/customer', (req, res) => {
    const { firstname, lastname, email, phone, address, reason, message } = req.body;

    console.log('Request body: ', req.body);

    con.query(
        'INSERT INTO contact (firstname, lastname, email, phone, address, reason, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstname, lastname, email, phone, address, reason, message],
        (error, results) => {
            if (error) {
                console.error('Error inserting data into the database: ', error);
                res.status(500).json({ error: 'Database error', details: error.message });
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ success: true });
            }
        }
    );
});

/*
This was the code I was using to connect directly to the database and then submit the data into
the table. It is no longer needed since we have the MongoDB now.
*/
// This is the request for accessing the orders table and then inserting the order data into the table.
// app.post('/orders', (req, res) => {
//     const { first_name, last_name, email, phone, address, payment, totalCostValue, orderItems, message} = req.body;

//     console.log('Request body: ', req.body);

//     con.query(
//         'INSERT INTO orders (first_name, last_name, email, phone, address, payment_method, totalCostValue, orderItems, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//         [first_name, last_name, email, phone, address, payment, totalCostValue, orderItems, message ],
//         (error, results) => {
//             if (error) {
//                 console.error('Error inserting data into the database: ', error);
//                 res.status(500).json({ error: 'Database error', details: error.message });
//             } else {
//                 console.log('Data inserted successfully');
//                 res.status(200).json({ success: true });
//             }
//         }
//     );
// });


    app.get('/products', (req, res) => {
        con.query('SELECT product_Name, product_Price, product_Desc FROM products;', (error, results) => {
            if (error) {
                console.error('Error fetching product data: ', error);
                res.status(500).json({ error: 'Database error', details: error.message });
            } else {
                res.status(200).json(results);
            }
        });
    });

    // use the existing MongoDB connection
client.connect().then(async () => {
    const database = client.db('OrdersDB');
    const collection = database.collection('orders');

    app.post('/orders', async (req, res) => {
        const { orderData } = req.body;

        console.log('Recevied order data: ', req.body);

        try {
            const existingCustomer = await collection.findOne({
                'customer.email': req.body.customer.email
            });
        
            if (existingCustomer) {
                // if the customer already exists, update their order details and cart items
                await collection.updateOne(
                    { 'customer.email' : req.body.customer.email },
                    {
                        $push: {
                            'orders': {
                                $each: [req.body.orders]
                            }
                        }
                    }
                );
            } else {
                // If the customer doesn't exist, insert a new customer record
                const result = await collection.insertOne(req.body);
                console.log(`Inserted order with _id: ${result.insertedId}`);
            
            }
            res.status(200).json({ success: true});
        } catch (error) {
            console.error('Error inserting data into the database', error);
            res.status(500).json({ error: 'Database error', details: error.message});
        }

    });
});

const port = 8200;
app.listen(port, () => {
    console.log(`The web server is alive! \nListening on http://localhost:${port}`);
});
