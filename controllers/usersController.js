const mysql = require('mysql');
const HttpError = require('../models/http-error');
//const { connect } = require('../routes/countries-routes');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const pool = mysql.createPool({
    connectionLimit : process.env.DB_CONLIMIT,
    host            : process.env.DB_HOST,
    port: process.env.DB_PORT,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_NAME                        
});


exports.getUsers = async (req, res, next) => {

    pool.getConnection( async (err, connection) => {
        if(err) return next(new Error());

        connection.query('select * from users', (err, rows) => {
            connection.release()

            if(!err) {
                return res.status(200).send(rows)
            } else return res.status(502).send("Bad Gateway !");
        })
    })
}



// LOGIN USER
exports.signup =  async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }
    
    pool.getConnection( async (err, connection) => {
        if(err) return next(new Error());
        PasswordHash = req.body.password;
        
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        PasswordHash = await bcrypt.hash(PasswordHash, salt);
        const date = new Date();

        const obj = {
            Email: req.body.Email,
            EmailConfirm: 0,
            PasswordHash: PasswordHash,
            SecurityStamp: PasswordHash,
            PhoneNumber: "",
            PhoneNumberConfirm: 0,
            TwoFactorEnabled: 0,
            LockoutEndDateUtc: date,
            LockoutEnable: 0,
            AccessFailedCount: 0
        }

        connection.query('select Email from users where Email = ?', [obj.Email], (er, em) => {
            if(em.length < 1) {
                connection.query('insert into users SET ?', [obj], (err, rows) => {
                    connection.release()
                    if(!err) {
                        res.status(201).send(`Account with the Email ${obj.Email} has been created !.`)
                     } else {
                         return res.status(502).send(`Bad Gateway !`);
                     }
                })
            } else {
                return res.status(422).send(`Could not create user !`);
            }
            
            
        })
        
    })
}


exports.login =  async (req, res, next) => {
    
    pool.getConnection( async (err, connection) => {
        if(err) return next(new Error());
        Email = req.body.Email;
        password = req.body.password;
        
        connection.query('select * from users where Email = ?' , [Email], (err, rows) => {
            connection.release()
            if(!err) {
                if(rows.length > 0) {
                    // check user password with hashed password stored in the database
                    const validPassword =  bcrypt.compareSync(req.body.password, rows[0].PasswordHash);
                    if(validPassword) {
                       return  res.status(200).send(validPassword)
                    } else return next(new HttpError("Unsuccessfull login !", 400));
                    
                } else  return next(new HttpError("Unsuccessfull login !", 400));
            } else {
                return res.status(502).send(`Bad Gateway !`);
            }

        })
        
    })
}


