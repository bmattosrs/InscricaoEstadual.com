//IMPORTANDO EXPRESS
const express = require('express');
const app = express();
const session = require('express-session');
require('dotenv').config();

//IMPORTANDO MODEL DO BANCO
const connection = require('./database/database');

//IMPORTANDO CONTROLLERS E 
const InscricoesController = require('./inscricao/InscricoesController');
const Inscricao = require('./inscricao/Inscricao');
const UsersController = require('./users/UsersController');
const User = require('./users/User');
const ApiController = require('./api/ApiController');

//SESSIONS
app.use(session({
    secret: process.env.SECRET_SESSION,
    cookie: { maxAge: 999999},
    resave: true,
    saveUninitialized: true
}));

//DEFINIÇÃO DO SERVIDOR
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use('/', InscricoesController);
app.use('/', UsersController);
app.use('/', ApiController);

app.get('/',(req,res)=> {
    res.render('index');
});

connection.authenticate()
.then(() => {
    console.log('Conexão realizada com sucesso!');
}).catch(err => {
    console.log(err);
});

app.listen(process.env.PORT, err => {
    if(err){
        console.log('Erro no servidor');
    }else{
        console.log('Servidor em execução');
    }
});