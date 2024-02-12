const Sequelize = require('sequelize');
const connection = require('../database/database');

const Empresa = connection.define('empresa',{
    cnpj: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    uf: {
        type: Sequelize.STRING,
        allowNull: false,
    }

});


module.exports = Empresa;