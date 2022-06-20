const mysql = require('mysql');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const pool = mysql.createPool({
    connectionLimit : process.env.DB_CONLIMIT,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_NAME
});

// Get All Countries
exports.getCountries =  (req, res, next) => {

    pool.getConnection((err, connection) => {
        if(err) return next(new Error());
       // console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from countries', (err, rows) => {
            connection.release() // return the connection to pool
            if(!JSON.parse(`"${rows}"`)) {
                return next(new HttpError("Could not found Countries", 404));
            }
            if(!err) {
                return res.send(rows)
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
            
        })
    })
}


// Get a Country by Id 
exports.getCountry = (req, res, next) => {

    pool.getConnection((err, connection) => {
        if(err) return next(new Error());
        //console.log(`connected through thread id ${connection.threadId}`)
        connection.query(`select * from countries where CountryId = ?`, [req.params.id], (err, rows)  => {
            connection.release() // return the connection to pool
            const ob = JSON.parse(`"${rows}"`);
            if(!ob) {
                return next(new HttpError("Could not find country of the provided id.", 404));
            }
            if(!err) {
                res.send(rows)
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
            
        })
    })
}

//delete country by id
exports.deleteCountry = (req, res, next) => {

    pool.getConnection((err, connection) => {
        if(err) return next(new Error());
        //console.log(`connected through thread id ${connection.threadId}`)
        connection.query('select * from countries where CountryId = ?', [req.params.id], (er, rows) => {
            if(rows.length > 0) {
                connection.query(`delete from countries where CountryId = ?`, [req.params.id], (err, rows) => {
                    connection.release() // return the connection to pool
        
                    if(!err) {
                        res.send(`Country with the id ${req.params.id} has been deleted.`)
                    } else {
                        return res.status(502).send(`Bad Gateway !`);
                    }
                })
            } else return next(new HttpError(`Could not find Country with id: ${req.params.id}`, 404));
            
        })
        })
        
}

//Add a Country
exports.addCountry = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }

    pool.getConnection((err, connection) => {
        if(err) return next(new Error());
        //console.log(`connected through thread id ${connection.threadId}`)
        const params = req.body;
        //res.send(params)
        connection.query(`INSERT INTO Countries SET ?`, params , (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
               res.status(201).send(`Country with the Name ${params.countryName} has been Added.`)
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
        })
    })
}

// Update a Country 
exports.updateCountry = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }
    pool.getConnection((err, connection) => {
        if(err) return next(new Error());
        //console.log(`connected through thread id ${connection.threadId}`)
        const {countryName} = req.body;
        const CountryId = req.params.id;
        //res.send(CountryName)
        connection.query(`UPDATE Countries SET CountryName = ? WHERE CountryId = ?`, [countryName, CountryId], (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                res.status(200).send(`Country with the Name ${countryName} has been Updated.`)
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }
        })
    })
}