const express = require('express');
const router = express.Router();
const User = require('./User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const axios = require('axios');



const authApi = require('../middlewares/authApi');
const authSession = require('../middlewares/authSession');

var salt = bcrypt.genSaltSync(10);

async function createUser(documentInjected, nameInjected, emailInjected, passInjected) {
    try{
        let resultCpfCnpj = await User.findOne({
            where: {
                cpfCnpj: documentInjected
            }
        });

        if (resultCpfCnpj) {
            throw new Error('Documento (CPF ou CNPJ) já cadastrado.')
        };

        let resultEmail = await User.findOne({
            where: {
                email: emailInjected
            }
        });

        if (resultEmail) {
            throw new Error('E-mail já cadastrado')
        };

        //geracao da api key
        let apiKeyTemp = crypto.randomUUID();

        //hash da senha
        let pass = await bcrypt.hash(passInjected,salt);    

        let resultApi = await User.findOne({
            where: {
                apiKey: apiKeyTemp
            }
        });

        while(resultApi != undefined){
            apiKeyTemp = crypto.randomUUID()
        };


        // INÍCIO ASAAS
        let access_token = process.env.ASAASKEY;

        //Verifica se o cliente já existe no ASAAS
        let userAsaasId = "";

        const optionsVerificaClienteAsaas = {
            method: 'GET',
            url: `${process.env.ASAASBASEURL}/customers?cpfCnpj=${documentInjected}`,
            headers: {
              'accept': 'application/json',
              'access_token': access_token
            }
          };

        let clienteAsaas = await axios.request(optionsVerificaClienteAsaas);

        if(clienteAsaas.data.totalCount >=1){
            userAsaasId = clienteAsaas.data.data[0].id;
        }else{
        //Se não existe, cria cliente no ASAAS
        let envioAsaas = {
            name: nameInjected,
            cpfCnpj: documentInjected,
            email: emailInjected
        }

        const optionsNovoClienteAsaas = {
            method: 'POST',
            url: `${process.env.ASAASBASEURL}/customers`,
            data: envioAsaas,
            headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': access_token
            }
        };

        let newAsaasCustomer = await axios.request(optionsNovoClienteAsaas);

        if(!newAsaasCustomer.data.id){
            throw new Error('Não foi possível cadastrar cliente no Asaas')
        }

        userAsaasId = newAsaasCustomer.data.id;
        }

        let createdUser = await User.create({
            cpfCnpj: documentInjected,
            name: nameInjected,
            email: emailInjected,
            password: pass,
            apiKey: apiKeyTemp,
            asaasId: userAsaasId
        });

        return createdUser;

    } catch(error){
        console.error(error.message || 'Erro desconhecido durante a criação do usuário');
        throw error;
    }
}

async function auth(cpfCnpj, password){
    try{
        let documentInjected = cpfCnpj;
        let passwordInjected = password;

        //Validação inicial: Se um dos campos CPF/CNJ ou senha não foram informados, já retorna o erro
        if(!documentInjected || !passwordInjected){
            if(!documentInjected){
                throw new Error('CPF/CNPJ deve ser preenchido');
            }

            if(!passwordInjected){
                throw new Error('Senha deve ser preenchida')
            }
        }

        //Procura no banco alguém com CPF ou CNPJ informados
        const resultUser = await User.findOne({
            where:{
                cpfCnpj: documentInjected
            }
        })

        //Se nada for encontrado, retorna o erro
        if(!resultUser){
            throw new Error('Nenhum usuário encontrado');
        }

        //Batimento da senha
        let matchCredentials = await bcrypt.compare(passwordInjected,resultUser.password);

        if(!matchCredentials){
            throw new Error('Senha incorreta');
        }

        let foundUser = {
            documentSession: resultUser.cpfCnpj,
            email: resultUser.email
        };

        return foundUser;
    }
    catch(err){
        throw err
    }
};


function debitRequest(user){
    var updatedBalance = parseFloat(user.balance - 0.05);
    User.update({balance: updatedBalance},{
        where: {
            cpfCnpj: user.cpfCnpj
        }
    })
    console.log(`Seu saldo atual é de: ${updatedBalance.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}`);
}


router.get('/login', (req, res)=> {
    if(req.session.user){
        res.redirect('/painel');
    }else{
        let errorMsg = req.query.error;
        res.render('login',{errorMsg: errorMsg});
    }
});


router.post('/auth', (req, res) => {

    auth(req.body.cpfCnpj,req.body.password).then((result)=>{
        req.session.user = result;
        res.redirect('/painel');

    }).catch((err)=> {
        res.redirect('/login?error='+err.message);
    });
    
});


router.get('/painel', authSession, (req,res) => {

    let sessionUserDoc = req.session.user.documentSession

    User.findOne({
        where: {
            cpfCnpj: sessionUserDoc
        }
    }).then(loggedUser => {
        
        const optionsSearchPaymentsToUser = {
            method: 'GET',
            url: `${process.env.ASAASBASEURL}/payments?customer=${loggedUser.asaasId}`,
            headers: {
                accept: 'application/json',
                access_token: process.env.ASAASKEY
            }
        }
        
        axios.request(optionsSearchPaymentsToUser).then((response) => {
            if(response.status !== 200){
                console.error(response);
            }else{

                res.render('panel', {
                    panel: true,
                    userDoc: loggedUser.cpfCnpj,
                    userEmail: loggedUser.email,
                    userName: loggedUser.name,
                    userApiKey: loggedUser.apiKey,
                    userAsaasCode: loggedUser.asaasId,
                    userOrders: response.data.data,
                    userBalance: loggedUser.balance.toFixed(2),
                    userBalanceUnity: (loggedUser.balance / 0.05).toFixed(0)
                });
            }
        }).catch((err) => {
            console.error(err)
        })

       
    }).catch((err)=> {
        console.log(err);
        res.redirect('/')
    });

});


router.post('/addBalance', (req, res) => {
    let valueCredit = parseFloat(req.body.valueCredit);
    let asaasCode = req.body.asaasId;

    let reqUrlNewBilling = `${process.env.ASAASBASEURL}/payments`;
    let access_token = process.env.ASAASKEY;
    let dataAtual = new Date();
    let dataFutura = new Date();
    let dataFinal = new Date(dataFutura.setDate(dataAtual.getDate() + 2));
    let dataFinalFormatada = dataFinal.getFullYear()+ "-" + dataFinal.getMonth() + "-" + dataFinal.getDate(); 

    const optionsNewBilling = {
        method: 'POST',
        url: reqUrlNewBilling,
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'access_token': access_token
        },
        data: {
            customer: asaasCode,
            value: valueCredit,
            billingType: 'UNDEFINED',
            dueDate: dataFinal
        }
      };

      
      let newLinkCreated = axios.request(optionsNewBilling)
        .then(function (response) {
            if(!response.status==200){
                console.log(response.data.errors);
            }
            
            res.send(response.data.invoiceUrl);
        })
        .catch(function (error) {
          console.error(error);
        });
});


router.get('/logout',(req,res) => {
    req.session.user = undefined;
    res.redirect('/');
});


router.post('/admin/users/new',(req, res)=> {
    var cpfCnpj = req.body.cpfCnpj;
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;


    if(!cpfCnpj || !email || !password || !name){
        res.statusCode = 400;
        return res.json({err: 'Um ou mais campos estão vazios.'});
    }
    
    createUser(cpfCnpj, name, email,password).then((resultado) => {
        res.statusCode = 200;
        return res.send(resultado);
    }).catch((err)=> {
        res.statusCode = 500;
        return res.send({err: err.message});
    });
});

router.get('/api/balance', authApi, (req, res)=> {
    return res.json({balance: req.body.user.balance.toFixed(2)});
});

module.exports = router;
module.exports.debitRequest = debitRequest;