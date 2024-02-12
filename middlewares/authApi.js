const User = require('../users/User');

async function authApi(req,res,next) {
    try{
        const apiKey = req.headers.apikey;

        if(!apiKey){
            sendError(res,'É necessário informar uma apikey no header da requisição.',401)
        }

        const resultUser = await User.findOne({
            where:{
                apiKey: apiKey
            }
        });

        if(!resultUser){
            sendError(res,'Nenhum usuário encontrado com essa apikey. Por favor forneça uma credencial válida',404)
        }

        if(resultUser.balance >= 0.05){
            req.body.user = resultUser;
            console.log('Logado com sucesso');
            next();
        } else{
            sendError(res,'Saldo insuficiente. Acesse o painel para adquirir novos créditos.',402);
        }
        

    } catch(err){
        sendError(res,'Erro ao autenticar API',500)
    }
    
    function sendError(res,message,statusCode = 400){
        res.status(statusCode).json({error:message});
    }
}

module.exports = authApi