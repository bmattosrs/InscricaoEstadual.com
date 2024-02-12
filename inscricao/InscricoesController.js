const express = require('express');
const router = express.Router();
const cors = require('cors');
const Empresa = require('./Empresa');
const Inscricao = require('./Inscricao');
const authApi = require('../middlewares/authApi');
const debitRequest = require('../users/UsersController').debitRequest;


//LISTA A RESPECTIVA INSCRIÇÃO ESTADUAL via *Frontend*
const corsOptions = {
    origin: 'https://google.com',
    methods: ['POST'],
};

router.post('/cnpjfront',(req, res) => {
    var cnpjInjected = req.body.cnpj;

    if(cnpjInjected != undefined){
        if(!isNaN(cnpjInjected)){
            Empresa.findOne({
                where: {
                    cnpj: cnpjInjected
                },include: [{association: 'inscricao', attributes: ['ieNumber', 'ieUf','ieActive']}],
                attributes: {exclude: ['createdAt','updatedAt','cnpj']}
            }).then((results) => {
                
                res.statusCode = 200;
                res.json(results);
                
            }).catch((err)=> {
                res.json(err);
            });
        }else{
            res.statusCode = 401;
            res.json({err: 'Campo CNPJ deve conter 14 posições, conter apenas números e ser enviado como string'});
        }
    }else{
        res.statusCode = 401;
        res.json({err: 'Campo CNPJ é indefinido'});
    }
});




module.exports = router;