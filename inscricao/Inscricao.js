const Sequelize = require('sequelize');
const connection = require('../database/database');
const Empresa = require('./Empresa');

const Inscricao = connection.define('inscricao', {
    ienumber: {
        type: Sequelize.STRING, //7 NÚMEROS
        allowNull: false,
    },
    cnpj: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ieuf:{
        type: Sequelize.STRING,
        allowNull: false
    },
    ieactive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    }
});

//Inscricao.sync({force:true});
//Empresa.hasMany(Inscricao,{foreignKey: 'cnpj', as: 'inscricao'});
//Inscricao.belongsTo(Empresa);



module.exports = Inscricao;