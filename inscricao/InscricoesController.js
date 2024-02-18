const express = require('express');
const axios = require('axios');
const router = express.Router();
const Empresa = require('./Empresa');
const Inscricao = require('./Inscricao');
const authApi = require('../middlewares/authApi');
const debitRequest = require('../users/UsersController').debitRequest;


router.post('/cnpjfront',(req, res) => {
    var cnpjInjected = req.body.cnpj;

    if(cnpjInjected != undefined){
        if(!isNaN(cnpjInjected)){

            axios.get(`https://minhareceita.org/${cnpjInjected}`)
            .then(companyReturned => {

                Inscricao.findAll({
                    where: {
                        cnpj: cnpjInjected
                    },
                    attributes: {exclude: ['createdAt','updatedAt','cnpj']}
                }).then((results) => {
                    let resultado = {
                        rfbRazaoSocial: companyReturned.data.razao_social,
                        rfbSituacaoCadastral: companyReturned.data.situacao_cadastral,
                        inscricoes: results
                    }

                    res.statusCode = 200;
                    res.json(resultado);
                    
                }).catch((err)=> {
                    res.json(err);
                });
            })
            .catch((err)=> {
                res.statusCode = err.response.status;
                res.json(err);
            })

            
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