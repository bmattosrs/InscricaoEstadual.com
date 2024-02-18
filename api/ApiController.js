const express = require('express');
const router = express.Router();

const Empresa = require('../inscricao/Empresa');
const Inscricao = require('../inscricao/Inscricao');

const authApi = require('../middlewares/authApi');
const debitRequest = require('../users/UsersController').debitRequest;


//LISTA A RESPECTIVA INSCRIÇÃO ESTADUAL via *API*
router.get('/api/cnpj/:cnpj', authApi, (req, res) => {
    var cnpjInjected = req.params.cnpj;

    if(cnpjInjected != undefined){
        if(!isNaN(cnpjInjected)){
            Inscricao.findAll({
                where: {
                    cnpj: cnpjInjected
                },
                attributes: {exclude: ['createdAt','updatedAt','cnpj']}
            }).then((results) => {
                if(results.length > 0){
                    debitRequest(req.body.user);
                    res.statusCode = 200;
                    res.json(results);
                }else{
                    res.statusCode = 404;
                    res.json({err: 'Nenhum resultado encontrado'});
                }
            }).catch((err)=> {
                res.json({err: 'Descrição do erro '+ err});
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




//CRIA INSCRIÇÃO ESTADUAL
router.post('/api/ie',(req,res) =>{
    var {ie,cnpj,status} = req.body;
    StateNumber.create({
        ienumber: ie,
        cnpjId: cnpj,
        active: parseInt(status)
    }).then(()=> {
        res.send(`Cadastrado com sucesso ${ie} - ${cnpj} - ${status}`);
    }).catch(() => {
        res.send('Erro no cadastro');
    })
});



module.exports = router;