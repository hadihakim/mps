const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_Name, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.PORT || 5000,
    dialect: process.env.DB_DIALECT,
    pool: {
        max: process.env.DB_MAX,
        min: process.env.DB_MIN,
        acquire: process.env.DB_ACQUIRE,
        idle: process.env.DB_IDLE
    },
    operatorsAliases: process.env.DB_OPERATOR_ALIASES
});

// set up User table
const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.beforeCreate((user, options) => {
    const salt = bcrypt.getSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
});

User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

// create all defined tables in the specified database
sequelize.sync()
    .then(() => console.log('user tables has been successfully created if one does not exists'))
    .catch(error => console.log('this error occured: ', error));

// export User module for using in other Files
module.exports = User;