//const { json } = require('body-parser');
const express = require('express');
const {engine} = require('express-handlebars');

//const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();
/*const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const User = require('./models/user');
const path = require('path');*/


const HttpError = require('./models/http-error');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));

app.use(express.json());
/*app.use(morgan('dev'));
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'somesecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));*/
// Static Files
app.use(express.static('public'));

// Templating Engine 
app.engine('hbs', engine( {extname: '.hbs'}));
app.set('view engine', 'hbs');


/*// Router (Rendering layouts ?!)
app.get('', (req, res) => {
    res.render('home');
});*/   

const loginRoutes = require('./routes/login-routes');
const signupRoutes = require('./routes/signup-routes');
const countriesRoutes = require('./routes/countries-routes');
const productsRoutes = require('./routes/products-routes');
const usersRoutes = require('./routes/users-routes');
const productMarketRoutes = require('./routes/product-market-routes');
const supermarketsRoutes = require('./routes/supermarkets-routes');

/*app.use((req, res, next) => {
    if(req.cookies.user_sid && !req.session.user){
        res.clearCookie('user_sid');
    }
    next()
})

const hbsContent = {userName: '', loggedin: false, title: 'You are not logged in today', body: 'Hello World'};

const sessionChecker = (req, res, next) => {
    if(req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};*/

/*app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});*/

app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes); 
app.use('/api/productMarket', productMarketRoutes);
app.use('/api/markets', supermarketsRoutes);


app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
})


app.use((error, req, res, next) => {
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500).send({message: error.message || 'An unkown error occured!'});
});



// Listen on environment port or 5000
app.listen(port, () => console.log(`listen on port ${port}`));

