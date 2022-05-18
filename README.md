Link: https://anny-walker-nodejs.herokuapp.com

Segui o tutorial do Exercicio 03.pdf e adicionei o banco de dados nos endpoints necessários.

Configurei a SECRET_KEY usando: heroku config:set SECRET_KEY=... (onde "..." é minha chave secreta)

Adicionei os usuários "admin" e "user" que foi passado no tutorial, mas não consegui descobrir a senha criptografada (que não consta no material) então também criei um usuário admin próprio:
login: anny_admin
senha: teste

Fiz os testes usando o PostMan

E utilizei o cliente do postgres PgAdmin para Mac

Início:
GET https://anny-walker-nodejs.herokuapp.com/app

Lista de endpoints:
POST https://anny-walker-nodejs.herokuapp.com/api/seguranca/login
BODY: login; senha

POST https://anny-walker-nodejs.herokuapp.com/api/seguranca/register
BODY: nome; login; senha; email; roles

GET https://anny-walker-nodejs.herokuapp.com/api/produtos
GET https://anny-walker-nodejs.herokuapp.com/api/produtos/:id

POST https://anny-walker-nodejs.herokuapp.com/api/produtos
BODY: { produto = {
        descricao: "",
        valor: "",
        marca: ""
    }
} 
Todos campos são obrigatórios

PUT https://anny-walker-nodejs.herokuapp.com/api/produtos/:id
BODY: { produto = {
        descricao: "",
        valor: "",
        marca: ""
    }
}
Pelo menos um campo é obrigatório

DELETE https://anny-walker-nodejs.herokuapp.com/api/produtos/:id


OBS: Qualquer problema só avisar que dou um jeito de atualizar, mas testei todos os endpoints e possíveis falhas e deu tudo certo :)

Meu e-mail: annyufrr@gmail.com