const Sequelize = require('sequelize');
const connection = require('../database/database');

const User = connection.define('users', {
    cpfCnpj:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    apiKey: {
        type: Sequelize.STRING,
        allowNull: false
    },
    asaasId: {
        type: Sequelize.STRING,
    },
    balance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
});

User.sync();

module.exports = User;