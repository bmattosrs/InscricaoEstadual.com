const Sequelize = require('sequelize');
const connection = require('../database/database');
const Empresa = require('./Empresa');

const Inscricao = connection.define('inscricao', {
    ieNumber: {
        type: Sequelize.STRING, //7 NÚMEROS
        allowNull: false,
        primaryKey: true
    },
    ieUf:{
        type: Sequelize.STRING,
        allowNull: false
    },
    ieActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    }
});

Empresa.hasMany(Inscricao,{foreignKey: 'cnpj', as: 'inscricao'});
//Inscricao.belongsTo(Empresa);



module.exports = Inscricao;