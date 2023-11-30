const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'sql.wpc-is.online',
    user: 'ctfrost',
    password: 'ctfr0667',
    database: 'db_test_ctfrost',
});

con.connect();

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

// This is the request for accessing the orders table and then inserting the order data into the table.
app.post('/orders', (req, res) => {
    const { first_name, last_name, email, phone, address, payment, totalCostValue, message} = req.body;

    console.log('Request body: ', req.body);

    con.query(
        'INSERT INTO orders (first_name, last_name, email, phone, address, payment_method, totalCostValue, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, phone, address, payment, totalCostValue, message ],
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

const port = 8200;
app.listen(port, () => {
    console.log(`The web server is alive! \nListening on http://localhost:${port}`);
});
