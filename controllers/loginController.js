const mysql = require('mysql');
const request = require('request')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

var multer = require('multer');
//const { connect } = require('../routes/supermarkets-routes');
var upload = multer();

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONLIMIT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

exports.getLoginForm = (req, res) => {
    return res.status(200).render('login', { login: 'It is login page.' });
}



const checkValidation = async (row, isValidPassword, Password, res, err) => {
    if (!JSON.parse(`"${row}"`)) {
        return res.status(500).send({ fail: 'Invalid. Check your credentials.' })
    }
    if (!err) {
        try {
            isValidPassword = await bcrypt.compare(Password, row[0].PasswordHash)
        } catch (errors) {
            return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
        }
        if (!isValidPassword) {
            return res.status(500).send({ fail: 'Invalid. Check your credentials.' })
        } else {
            let token;
            try {
                token = jwt.sign({ UserId: row[0].UserId, Email: row[0].Email, Role: row[0].RoleId }, 'hadimps_itis_secret_key',
                    { expiresIn: '1h' }
                );
            } catch (error) {
                return res.status(500).send({ fail: 'Registration succeeded. Logging in failed, try to login with the same credentials.' });
            }
            /**/
            pool.getConnection((err, connection) => {
                if (err) return next(new Error());
                // console.log(`connected through thread id ${connection.threadId}`)
                connection.query('select * from products p, categories c where p.CategoryId = c.CategoryId', (err, rows) => {
                    connection.release() // return the connection to pool
                    if (!JSON.parse(`"${rows}"`)) {
                        return next(new HttpError("Could not found Products", 404));
                    }
                    if (!err) {
                        if(row[0].RoleId == 1) {
                            res.status(200).render('home', { rows, home: 'home', token });
                        }
                    } else {
                        return res.status(502).send(`Bad Gateway !`);
                    }

                    //console.log('the data from user table: \n', rows);

                })
            })
            /**/
            //return res.status(200).send({ alert: 'success' });
        }
    } else {
        return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
    }
}
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    } else {
        const { Email, Password } = req.body;
        let isValidPassword = false;
        pool.getConnection((err, connection) => {
            if (err) return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
            connection.query(`select * from users where Email = ?`, [Email], (err, row) => {
                connection.release() // return the connection to pool
                checkValidation(row, isValidPassword, Password, res, err);
            })
        })
    }
}