require('dotenv').config();

const Sequelize = require('sequelize');

const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
    host: process.env.DB_HOST,
    dialect: 'postgres',
    timezone: '-03:00',
    define: {
        freezeTableName: true
    }
});

module.exports = connection;