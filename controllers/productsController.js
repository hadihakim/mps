const mysql = require('mysql');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
//const { connect } = require('../routes/products-routes');

var multer = require('multer');
var upload = multer();

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONLIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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
exports.getProducts = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from products p, categories c where p.CategoryId = c.CategoryId', (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }
            if (!err) {
                res.status(200).render('home', { rows, home: 'home' });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

            //console.log('the data from user table: \n', rows);
        })
    })
}

//Find Product by Search 
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)

        const searchTerm = req.body.search;
        connection.query('select * from products p, categories c where (p.productName like ? or p.Title like ? or p.Brand like ? or c.CategoryName like ? or p.Description like ?) and (p.categoryId = c.categoryId)', ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            connection.release() // return the connection to pool
            /*if(!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }*/
            if (!err) {
                res.status(200).render('home', { rows, home:'it is home page.' });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

            //console.log('the data from user table: \n', rows);

        })
    })
}


//Get add form
exports.getAddForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from categories', (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Products", 404));
            }
            if (!err) {
                return res.status(200).render('add-product', { rows });
            } else {
                return res.status(502).send({fail: `Bad Gateway !`});
            }
        })
    })
}

exports.getTest = (req, res) => {
    res.status(200).render('testapi');
}


// Get a Product by Id 
exports.getProduct = (req, res, next) => {

    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        //console.log(`connected through thread id ${connection.threadId}`)
        connection.query(`select * from products where ProductId = ?`, [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool
            const ob = JSON.parse(`"${rows}"`);
            if (!ob) {
                return next(new HttpError("Could not find product of the provided id.", 404));
            }
            if (!err) {
                res.send(rows)
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

        })
    })
}

//delete product by id
exports.deleteProduct = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        connection.query('delete from products where ProductId = ?', [req.params.id], (err, row) => {
            connection.release();
            //console.log("deleted product with id: "+ req.params.id)
            if (err) {
                return res.status(422).send({ fail: 'Cannot delete the product.' })
            }
            if (!err) {
                return res.status(200).send({ alert: 'Product deleted successfully.' })
            }
            return res.status(502).send(`Bad Gateway !`);
        })
    })
}


exports.addPriceMarketProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' }
        )
    }
    else {
        pool.getConnection((err, connection) => {
            if (err) return next(new Error());
            const {ProductId, SupermarketAddressId, price} = req.body;
            dateTime = getCurrentDate();
            connection.query(`INSERT INTO supermarketsproducts SET ProductId = ?, SupermarketAddressId = ?, price = ?, SpLastUpdate = ?`, [ProductId, SupermarketAddressId, price, dateTime], (err, row) => {
                if (!err) {
                    connection.query(`select * from regions r, supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and r.RegionId = a.RegionId and r.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? and sp.SupermarketAddressId = ? order by sp.SpId desc limit 1`, [ProductId, SupermarketAddressId], (err, rows) => {
                        connection.release();
                    if (!JSON.parse(`"${rows}"`)) {
                        return res.status(200).send({ alert: 'Price added successfully.' });
                    } else if (!err) {
                        return res.status(200).send({ rows, alert: 'Price added successfully.' })
                    } else {
                        return res.status(200).send({ alert: 'Price added successfully.' });
                    }
                    })
                } else {
                    connection.release();
                    return res.status(502).send({ fail: 'Can not add new price.' })
                }

            })
        })
    }
}


//delete updated prices of a product in a Supermarket by id
exports.deleteProductMarketPrice = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        connection.query('delete from supermarketsproducts where SpId = ?', [req.params.id], (err, row) => {
            //connection.release();
            if (err) {
                connection.release();
                return res.status(422).send({ fail: 'Cannot delete price.' })
            }
            else if (!err) {
                connection.query('select * from regions r, supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.RegionId = r.RegionId and r.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? and sp.SupermarketAddressId = ? order by sp.SpId desc limit 1', [req.params.productId, req.params.marketId], (err, rows) => {
                    connection.release();
                    if (!JSON.parse(`"${rows}"`)) {
                        return res.status(200).send({ alert: 'Price deleted successfully.' });
                    } else if (!err) {
                        return res.status(200).send({ rows, alert: 'Price deleted successfully.' })
                    } else {
                        return res.status(200).send({ alert: 'Price deleted successfully.' });
                    }
                })
            } else {
                connection.release();
                return res.status(502).send(`Bad Gateway !`);
            }

        })
    })
}


//Add a Product
exports.addProduct = (req, res, next) => {
    //console.log("req add")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    } else {
        pool.getConnection((err, connection) => {
            if (err) return next(new Error());
            //console.log(`connected through thread id ${connection.threadId}`)
            /////const params = req.body;
            const { productCategory, productName, productTitle, productBrand, productWeight, productDescription } = req.body;
            dateTime = getCurrentDate();
            //res.send(params)
            connection.query(`INSERT INTO Products SET CategoryId = ?, productName = ?, Title = ?, Brand = ?, Weight = ?, Description = ?, LastUpdate = ?`, [productCategory, productName, productTitle, productBrand, productWeight, productDescription, dateTime], (err, rows) => {
                //connection.release() // return the connection to pool
                if (!err) {
                    return res.status(200).send({ alert: 'Product added successfully.' });
                } else if (err) {
                    return res.status(422).send({ fail: 'Product failed to be added.' })
                }
                else {
                    return res.status(502).send(`Bad Gateway !`);
                }
            })
        })
    }
}


// GET Update a product
exports.getUpdate = (req, res, next) => {
    let contents = [];
    //return res.render('update-product');
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        // console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from products p, categories c where p.CategoryId = c.CategoryId and p.ProductId = ?', [req.params.id], (err, rows) => {
            //connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Product", 404));
            }
            if (!err) {
                rows.forEach(function (elem) {
                    contents.push(elem);
                });
                // console.log("here: "+contents[0].CategoryId)
                connection.query('select * from categories where CategoryId != ?', [contents[0].CategoryId], (err, category) => {
                    connection.release() // return the connection to pool
                    if (!JSON.parse(`"${rows}"`)) {
                        return next(new HttpError("Could not found Product", 404));
                    }
                    if (!err) {
                        res.status(200).render('update-product', { id: [req.params.id], rows, category });
                    } else {
                        return res.status(502).send(`Bad Gateway !`);
                    }

                    //console.log('the data from user table: \n', rows);

                })
                //res.render('update-product', { rows });
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
        })
    })
}



// POST Update a Product
/*exports.updateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return next(new HttpError("Invalid inputs passed, please check your data.", 422));
        //return res.status(422).render('add-product', { fail: 'Invalid inputs passed, please check your data.'} );
        pool.getConnection((err, connection) => {
            connection.query('select * from products p, categories c where p.CategoryId = c.CategoryId and ProductId = ?', [req.params.id], (err, rows) => {
                //connection.release() // return the connection to pool
                if (!JSON.parse(`"${rows}"`)) {
                    return next(new HttpError("Could not found Products", 404));
                }
                if (!err) {
                    connection.query('select * from categories where CategoryId != ?', [req.body.productCategory], (err, category) => {
                        connection.release() // return the connection to pool
                        if (!JSON.parse(`"${rows}"`)) {
                            return next(new HttpError("Could not found Products", 404));
                        }
                        if (!err) {
                            // return res.status(422).render('add-product', { fail: 'Invalid inputs passed, please check your data.', rows} );
                            return res.status(422).render('update-product', { id: [req.params.id], rows, category, fail: 'Invalid inputs passed, please check your data.' });
                        } else {
                            return res.status(502).send(`Bad Gateway !`);
                        }

                    })
                    //res.render('update-product', { rows });
                } else {
                    return res.status(502).send(`Bad Gateway !`);
                }
            })
        })
    } else {
        pool.getConnection((err, connection) => {
            if (err) return next(new Error());
            // console.log(`connected through thread id ${connection.threadId}`)
            connection.query('select * from products p, categories c where p.CategoryId = c.CategoryId and ProductId = ?', [req.params.id], (err, rows) => {
                //connection.release() // return the connection to pool
                if (!JSON.parse(`"${rows}"`)) {
                    return next(new HttpError("Could not found Products", 404));
                }
                if (!err) {
                    connection.query('select * from categories where CategoryId != ?', [req.body.productCategory], (err, category) => {
                        //connection.release() // return the connection to pool
                        if (!JSON.parse(`"${rows}"`)) {
                            return next(new HttpError("Could not found Products", 404));
                        }
                        if (!err) {
                            const { productCategory, productName, productTitle, productBrand, productWeight, productDescription } = req.body;
                            dateTime = getCurrentDate();
                            const ProductId = req.params.id;
                            //res.send(CountryName)
                            connection.query(`UPDATE Products SET productName = ?, LastUpdate = ?, Description = ?, Weight = ?, CategoryId = ?, Brand = ?, Title = ? WHERE ProductId = ?`, [productName, dateTime, productDescription, productWeight, productCategory, productBrand, productTitle, ProductId], (err, row) => {
                                connection.release() // return the connection to pool

                                if (!err) {
                                    res.status(200).render('update-product', { id: [req.params.id], rows, category, alert: 'Product updated successfully.' });
                                    //res.status(200).send(`Product with the Name ${productName} has been Updated.`)
                                } else {
                                    return res.status(502).send(`Bad Gateway !`);
                                }
                            })
                        } else {
                            return res.status(502).send(`Bad Gateway !`);
                        }
                    })
                    //res.render('update-product', { rows });
                } else {
                    return res.status(502).send(`Bad Gateway !`);
                }

                console.log('the data from user table: \n', rows);

            })
        })
    }
}*/

exports.updateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data.' });
    } else {
        pool.getConnection((err, connection) => {
            if (err) return next(new Error());
            //console.log(req.body.testname)
            const { productCategory, productName, productTitle, productBrand, productWeight, productDescription } = req.body;
            //console.log(productName)
            dateTime = getCurrentDate();
            const ProductId = req.params.id;
            //console.log(ProductId)
            //res.send(CountryName)
            connection.query(`UPDATE Products SET productName = ?, LastUpdate = ?, Description = ?, Weight = ?, CategoryId = ?, Brand = ?, Title = ? WHERE ProductId = ?`, [productName, dateTime, productDescription, productWeight, productCategory, productBrand, productTitle, ProductId], (err, row) => {
                connection.release() // return the connection to pool
                if (!err) {
                    return res.status(200).send({ alert: 'Product updated successfully.' });
                    //res.status(200).send(`Product with the Name ${productName} has been Updated.`)
                } else if (err) {
                    return res.status(422).send({ fail: 'Product failed to update.' })
                }
                else {
                    return res.status(502).send({ fail: 'Bad Gateway !' });
                }
            })
        })
    }
}


// Get Product Recent Prices
exports.getPrices = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        //console.log('success')
        connection.query('select t.RegionName, t.SpId, t.SupermarketAddressId, t.SupermarketName, t.CountryName, t.CityName, t.Street, t.AddressDescription, t.price, t.SpLastUpdate, t.ProductId, t.productName, t.CategoryName, t.Brand, t.Weight from ( select RegionName, SupermarketAddressId, SupermarketName, CountryName, CityName, Street, AddressDescription, price, SpLastUpdate, sp.ProductId, productName, CategoryName, Brand, sp.SpId, Weight from regions r, supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.RegionId = r.RegionId and r.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? group by sp.SpId order by sp.SpId desc ) AS t group by t.SupermarketAddressId order by t.price asc', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool
            if (!JSON.parse(`"${rows}"`)) {
                return res.status(422).send({ fail: 'Prices not available.' });
            }
            if (!err) {
                res.status(200).render('recent-prices', { rows });
            } else {
                return res.status(502).send({ fail: 'Bad Gateway !' });
            }
        })
    })
}

/*// POST Filter Product Recent Prices by market
exports.FilterMarketPrices = (req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) return next(new Error());
        let filterTerm = req.body.filter;
        connection.query('select t.SupermarketAddressId, t.SupermarketName, t.CountryName, t.CityName, t.Street, t.AddressDescription, t.price, t.SpLastUpdate, t.ProductId, t.productName, t.CategoryName, t.Brand, t.Weight from ( select SupermarketAddressId, SupermarketName, CountryName, CityName, Street, AddressDescription, price, SpLastUpdate, sp.ProductId, productName, CategoryName, Brand, sp.SpId, Weight from supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? and s.SupermarketName LIKE ? group by sp.SpId order by sp.SpId desc ) AS t group by t.SupermarketAddressId order by t.price asc', [req.params.id, '%' + filterTerm + '%'], (err, rows) => {
            if (err)
            return connection.release(), res.status(502).send(`Bad Gateway !`);
            else if (rows && rows.length > 0) return connection.release(), res.status(200).render('recent-prices', { rows });
            connection.query('select t.SupermarketAddressId, t.SupermarketName, t.CountryName, t.CityName, t.Street, t.AddressDescription, t.price, t.SpLastUpdate, t.ProductId, t.productName, t.CategoryName, t.Brand, t.Weight from ( select SupermarketAddressId, SupermarketName, CountryName, CityName, Street, AddressDescription, price, SpLastUpdate, sp.ProductId, productName, CategoryName, Brand, sp.SpId, Weight from supermarketsproducts sp, products p, categories c, supermarketsaddress sa, supermarkets s, address a, cities ci, countries cu where sp.ProductId = p.ProductId and p.CategoryId = c.CategoryId and sp.SupermarketAddressId = sa.Id and sa.SupermarketId = s.SupermarketId and sa.AddressId = a.AddressId and a.CityId = ci.CityId and ci.CountryId = cu.CountryId and sp.ProductId = ? group by sp.SpId order by sp.SpId desc ) AS t group by t.SupermarketAddressId order by t.price asc', [req.params.id], (err, row) => {
                connection.release()
                if (err) return res.status(502).send(`Bad Gateway !`);
                if (row.length > 0) return res.render('recent-prices', { row });
            })
        })

    });
}*/