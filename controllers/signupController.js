const mysql = require('mysql');
const request = require('request')
const bcrypt = require('bcryptjs');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
//const { connect } = require('../routes/products-routes');

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

exports.getSignupForm = (req, res) => {
    return res.status(200).render('signup', { users: 'It is users page.' });
}

/*const validEmail = async (url) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        console.log(this.responseText);
        return;
    }
    xhr.send();
}*/

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).send({ fail: 'Invalid inputs passed, please check your data' })
    } else {
        const { Name, Email, Password, RepeatPassword, Role, } = req.body;
        let hashedPassword;
        if (Name.length < 3) {
            return res.status(422).send({ fail: 'Name must be at least of 3 characters.' })
        }
        if (Password != RepeatPassword) {
            return res.status(422).send({ fail: 'Password does not match.' })
        }
        if (Password.length < 6) {
            return res.status(422).send({ fail: 'Password must be at least of 6 characters.' })
        }
        request.get({ url: `https://app.verify-email.org/api/v1/fOz1gSqEEo34nytmEfFfOgo7LU8XzuZM7gkfaThuZGUeJREQZY/verify/${Email}` }, async function optionalCallback(err, httpResponse, body) {
            if (err) {
                return res.status(502).send({ fail: 'Unexpected Error occured. Please try again later.' })
            }
            obj = JSON.parse(body);
            /*if(!obj.smtp_log) {
                return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
            }
            else if (obj.smtp_log != "Success") {
                return res.status(422).send({ fail: 'Email does not exists. Please try a valid Email.' })
            }*/
            try {
                hashedPassword = await bcrypt.hash(Password, 12);
            } catch (err) {
                return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
            }
            pool.getConnection((err, connection) => {
                if (err) return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
                // console.log(`connected through thread id ${connection.threadId}`)
                connection.query('select * from users where Email = ?', [Email], (err, rows) => {
                    if (JSON.parse(`"${rows}"`)) {
                        connection.release() // return the connection to pool
                        return res.status(500).send({ fail: 'Email already registered. Please try another valid email.' })
                    }
                    if (!err) {
                        pool.getConnection((err, connection) => {
                            if (err) return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
                            connection.query(`INSERT INTO users SET Email = ?,
                            PasswordHash = ?, RoleId = ?, Name = ?`, [Email, hashedPassword, Role, Name], (err, rows) => {
                                connection.release() // return the connection to pool
                                if (!err) {
                                    return res.status(200).send({ alert: 'success.' })
                                } else {
                                    return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
                                }
                            })
                        })
                    } else {
                        connection.release() // return the connection to pool
                        return res.status(500).send({ fail: 'Something went wrong. Please try again later.' })
                    }
                })
            })
        });
    }
}