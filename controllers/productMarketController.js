const mysql = require('mysql');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONLIMIT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Get Product Recent Prices
exports.getPrices = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        //
        // console.log(`connected through thread id ${connection.threadId}`)

        //
        connection.query('select RegionName, SupermarketAddressId, SupermarketName, CountryName, CityName, Street, AddressDescription, price, SpLastUpdate, sp.ProductId, productName, CategoryName, Brand, sp.SpId, Weight from regions r, supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.RegionId = r.RegionId and r.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? and sp.SupermarketAddressId = ?', [req.query.pid, req.query.sid], (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }
            if (!err) {
                res.status(200).render('product-market', { rows });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

            console.log(req.query);

        })
    })
}
