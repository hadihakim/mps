const mysql = require('mysql');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
//const { connect } = require('../routes/products-routes');

var multer = require('multer');
//const { connect } = require('../routes/supermarkets-routes');
var upload = multer();

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONLIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

getCurrentDate = () => {
    var today = new Date();

    var month = (today.getMonth() + 1 <= 9) ? "0" + (today.getMonth() + 1) : "" + (today.getMonth() + 1);
    var day = (today.getDate() <= 9) ? "0" + (today.getDate()) : "" + (today.getDate());

    var date = today.getFullYear() + '-' + month + '-' + day;

    var hours = (today.getHours() <= 9) ? "0" + (today.getHours()) : "" + today.getHours();
    var minutes = (today.getMinutes() <= 9) ? "0" + (today.getMinutes()) : "" + today.getMinutes();
    var seconds = (today.getSeconds() <= 9) ? "0" + (today.getSeconds()) : "" + today.getSeconds();

    var time = hours + ":" + minutes + ":" + seconds;

    var dateTime = date + ' ' + time;
    return dateTime;
}

// Get All Products
exports.getMarkets = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)
        connection.query(`select * from supermarketsaddress sa, supermarkets sm, regions r,
        cities ci, countries cu, address a where sa.SupermarketId = sm.SupermarketId and 
        sa.AddressId = a.AddressId and a.RegionId = r.RegionId and r.CityId = ci.CityId and
        ci.CountryId = cu.CountryId`, (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Supermarkets", 404));
            }
            if (!err) {
                res.status(200).render('supermarkets', { rows, supermarkets: 'it is supermarkets page' });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
            //console.log('the data from user table: \n', rows);
        })
    })
}


exports.getAddForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        connection.query(`select * from countries`, (err, rows) => {
            connection.release();
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Can't add Supermarket, Please try again late.", 404));
            } else if (!err) {
                return res.status(200).render('add-supermarket', { rows, supermarkets: 'its supermarket page.' });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

        })
    })
}

exports.getAddBranchForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        connection.query(`select * from countries; select * from supermarkets`, (err, rows) => {
            connection.release();
            /*if (!JSON.parse(`"${rows[0]}"`)) {
                return next(new HttpError("Can't add Supermarket Branch, Please try again late.", 404));
            } else*/ if (!err) {
                return res.status(200).render('add-NewBranch', { rows, supermarkets: 'its supermarket page.' });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

        })
    })
}

exports.addSupermarket = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    }
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        const { CountryId, RegionId, Street, AddressDescription, SupermarketName, Description } = req.body;
        let AddressId = 0;
        let SupermarketId = 0;
        connection.query(`INSERT INTO address SET Street = ?, AddressDescription = ?, RegionId = ?; INSERT INTO supermarkets SET SupermarketName = ?, Description = ?;`, [Street, AddressDescription, RegionId, SupermarketName, Description], (err, rows) => {
            if (!err) {
                AddressId = rows[0].insertId;
                SupermarketId = rows[1].insertId;
                connection.query(`INSERT INTO supermarketsaddress SET SupermarketId = ?, AddressId = ?`, [SupermarketId, AddressId], (err, rows) => {
                    connection.release();
                    if (!err) {
                        return res.status(200).send({ alert: `Supermarket added successfully.` });
                    }
                    return res.status(502).send({ fail: `Bad Gateway !` });
                })
            } else {
                connection.release();
                return res.status(502).send({ fail: `Bad Gateway !` });
            }
        })
    })
}


exports.addBranch = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    }
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        const { RegionId, Street, AddressDescription, SupermarketId } = req.body;
        let AddressId = 0;
        connection.query(`INSERT INTO address SET Street = ?, AddressDescription = ?, RegionId = ?`, [Street, AddressDescription, RegionId], (err, rows) => {
            if (!err) {
                AddressId = rows.insertId;
                connection.query(`INSERT INTO supermarketsaddress SET SupermarketId = ?, AddressId = ?`, [SupermarketId, AddressId], (err, rows) => {
                    connection.release();
                    if (!err) {
                        return res.status(200).send({ alert: `Supermarket Branch added successfully.` });
                    }
                    return res.status(502).send({ fail: `Bad Gateway !` });
                })
            } else {
                connection.release();
                return res.status(502).send({ fail: `Bad Gateway !` });
            }
        })
    })
}


exports.getRegions = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        connection.query(`select * from regions r, cities ci, countries cu where 
        r.CityId = ci.CityId and cu.CountryId = ci.CountryId and cu.CountryId = ?; 
        select * from cities ci, countries cu where 
        cu.CountryId = ci.CountryId and cu.CountryId = ?`, [req.params.cid, req.params.cid], (err, rows) => {
            connection.release();
            if (!err) {
                if(!JSON.parse(`"${rows[0]}"`)) {
                    return res.status(200).send({ rows, alert: 'Regions for this country not available, add new region.' });
                } else {
                    return res.status(200).send({ rows, alert: 'Choose region or add new one.' });
                }
                
            } else {
                return res.status(502).send({ fail: `Bad Gateway !` });
            }
        })
    })
}


//Find Product by Search 
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)

        let searchTerm = req.body.search;
        connection.query('select * from products p, categories c where (p.productName like ? or p.Title like ? or p.Brand like ? or c.CategoryName like ? or p.Description like ?) and (p.categoryId = c.categoryId)', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            connection.release() // return the connection to pool
            /*if(!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }*/
            if (!err) {
                res.render('home', { rows });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

            //console.log('the data from user table: \n', rows);

        })
    })
}

exports.addCountry = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    }
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        const { CountryName } = req.body;
        let CountryId = 0;
        connection.query(`INSERT INTO countries SET CountryName = ?;`, [CountryName], (err, rows) => {
            if (!err) {
                CountryId = rows.insertId;
                connection.query(`select * from countries where CountryId = ?`, [CountryId], (err, rows) => {
                    connection.release();
                    if (!err) {
                        return res.status(200).send({ alert: `Country added successfully.`, rows });
                    }
                    return res.status(502).send({ fail: `Country Added but cannot get now, Try again later.` });
                })
            } else {
                connection.release();
                return res.status(502).send({ fail: `Bad Gateway !` });
            }
        })
    })
}

exports.addRegion = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    } else {
        let CityId = 0;
        let CountryId = req.params.CountryId;
        const { RegionName, CityName, selectCity } = req.body;
        if (CityName != "") {
            pool.getConnection((err, connection) => {
                if (err) return next(new Error());
                connection.query('INSERT INTO cities SET CountryID = ?, CityName = ?', [CountryId, CityName], (err, rows) => {
                    if (err) {
                        return res.status(502).send({ fail: `Can not add new region, try again late.` });
                    } else {
                        CityId = rows.insertId;
                        connection.query(`INSERT INTO regions SET CityID = ?, RegionName = ?; 
                        select * from regions r, cities ci, countries cu where 
                        r.CityId = ci.CityId and cu.CountryId = ci.CountryId and cu.CountryId = ?;
                        select * from cities ci, countries cu where 
                        cu.CountryId = ci.CountryId and cu.CountryId = ?`,
                         [CityId, RegionName, CountryId, CountryId], (err, rows) => {
                            connection.release();
                            if (err) {
                                return res.status(502).send({ fail: `Can not add new region, try again late.` });
                            } else {
                                return res.status(200).send({ alert: `Region added successfully.`, rows } );
                            }
                        })
                    }

                })
            })

        } else {
            pool.getConnection((err, connection) => {
                if (err) return next(new Error());
                connection.query(`INSERT INTO regions SET CityID = ?, RegionName = ?; 
                select * from regions r, cities ci, countries cu where 
                r.CityId = ci.CityId and cu.CountryId = ci.CountryId and cu.CountryId = ?;
                select * from cities ci, countries cu where 
                cu.CountryId = ci.CountryId and cu.CountryId = ?`, [selectCity, RegionName, CountryId, CountryId], (err, rows) => {
                    connection.release();
                    if (err) {
                        return res.status(502).send({ fail: `Can not add new region, try again late.` });
                    } else {
                        return res.status(200).send({ alert: `Region added successfully.`, rows } );
                    }

                })
            })
        }
    }
}


// Get Product Recent Prices
exports.getPrices = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        //console.log('success')
        connection.query(`select t.RegionName, t.SpId, t.SupermarketAddressId, t.SupermarketName, t.CountryName, t.CityName, t.Street, t.AddressDescription, t.price, t.SpLastUpdate, t.ProductId, t.productName, t.CategoryName, t.Brand, t.Weight from ( select RegionName, SupermarketAddressId, SupermarketName, CountryName, CityName, Street, AddressDescription, price, SpLastUpdate, sp.ProductId, productName, CategoryName, Brand, sp.SpId, Weight from regions r, supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.RegionId = r.RegionId and r.CityId = ci.CityId and ci.CountryId = cu.CountryId and sa.Id = ? group by sp.SpId order by sp.SpId desc ) AS t group by t.SupermarketAddressId, t.ProductId`, [req.params.id], (err, rows) => {
            if (!JSON.parse(`"${rows}"`)) {
                return res.status(200).render('market-products', { rows, SpId: req.params.id, supermarkets: 'it is supermarkets page'});
            }
            if (!err) {
                connection.release()
                return res.status(200).render('market-products', { rows, supermarkets: 'it is supermarkets page'});
            } else {
                connection.release()
                return res.status(502).send({ fail: 'Bad Gateway !' });
            }
        })
    })
}

exports.getProductHistory = (req, res, next) => {
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
                res.status(200).render('sm-product-history', { rows });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

            console.log(req.query);

        })
    })
}

//Get add form
exports.getAddProductForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from products', (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }
            if (!err) {
                return res.render('market-add-product', { rows, Id: req.params.Id });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

           // console.log('the data from user table: \n', rows);

        })
    })
}



exports.insertProduct = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    } else {
        pool.getConnection((err, connection) => {
            if(err) return next(new Error());
            let Id = req.params.Id;
           const SpLastUpdate = getCurrentDate();
            const {productId, Price} = req.body;
            connection.query(`INSERT INTO supermarketsproducts SET SupermarketAddressId = ?, ProductId = ?, price = ?, SpLastUpdate = ?`, [Id, productId, Price, SpLastUpdate], (err, rows) => {
                if(!err) {
                    return res.status(200).send({ alert: 'Product added successfully to the Supermarket.' })
                } else {
                    return res.status(502).send({ fail: 'Product add failed, try again later.' })
                }
            })

        })
    }

    /*pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        const { CountryId, RegionId, Street, AddressDescription, SupermarketName, Description } = req.body;
        let AddressId = 0;
        let SupermarketId = 0;
        connection.query(`INSERT INTO address SET Street = ?, AddressDescription = ?, RegionId = ?; INSERT INTO supermarkets SET SupermarketName = ?, Description = ?;`, [Street, AddressDescription, RegionId, SupermarketName, Description], (err, rows) => {
            if (!err) {
                AddressId = rows[0].insertId;
                SupermarketId = rows[1].insertId;
                connection.query(`INSERT INTO supermarketsaddress SET SupermarketId = ?, AddressId = ?`, [SupermarketId, AddressId], (err, rows) => {
                    connection.release();
                    if (!err) {
                        return res.status(200).send({ alert: `Supermarket added successfully.` });
                    }
                    return res.status(502).send({ fail: `Bad Gateway !` });
                })
            } else {
                connection.release();
                return res.status(502).send({ fail: `Bad Gateway !` });
            }
        })
    })*/
}
