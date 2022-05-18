const express = require ('express')
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcryptjs') 
let apiRouter = express.Router() 

let checkToken = (req, res, next) => { 
    let authToken = req.headers["authorization"] 
    if (!authToken) {         
        res.status(401).json({ message: 'Token de acesso requerida' }) 
    } 
    else { 
        let token = authToken.split(' ')[1] 
        req.token = token 
    } 
 
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => { 
        if (err) { 
            res.status(401).json({ message: 'Acesso negado'}) 
            return 
        } 
        req.usuarioId = decodeToken.id 
        next() 
    }) 
} 

let isAdmin = (req, res, next) => { 
    knex 
        .select ('*').from ('usuario').where({ id: req.usuarioId }) 
        .then ((usuarios) => { 
            if (usuarios.length) { 
                let usuario = usuarios[0] 
                let roles = usuario.roles.split(';') 
                let adminRole = roles.find(i => i === 'ADMIN') 
                if (adminRole === 'ADMIN') { 
                    next() 
                    return 
                } 
                else { 
                    res.status(403).json({ message: 'Role de ADMIN requerida' }) 
                    return 
                } 
            } 
        }) 
        .catch (err => { 
            res.status(500).json({  
              message: 'Erro ao verificar roles de usuário - ' + err.message }) 
        }) 
}

const knex = require('knex')({ 
    client: 'pg', 
    debug: true, 
    connection: { 
        connectionString : process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false }, 
    } 
})

apiRouter.get('/', function (req, res) {
    res.send('Anny Caroline Walker Silva')
})


//USUARIOS
apiRouter.get('/usuarios', checkToken, async function (req, res) {
    return await knex.select('*').from('usuario') 
    .then( usuario => { return res.status(200).json(usuario) }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao consultar usuarios - ' + err.message }) 
    })   
})

//Adicionar tipos de lavagem de veículo
apiRouter.get('/lavagens', checkToken, async function (req, res) {
    return await knex.select('*').where("enabled", true).orderBy('id', 'desc').from('lavagem') 
    .then( lavagem => { return res.status(200).json(lavagem) }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar lavagem - ' + err.message }) 
    })   
})

apiRouter.get('/lavagens/:id', checkToken, async function (req, res) {
    return await knex('lavagem').where("id", req.params.id).first()
    .then( lavagem => {
        if (lavagem != null)
            return res.status(200).json(lavagem) 
        else
        return res.status(404).json({message: "Nenhum lavagem com esse id encontrado"}) 
    }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar lavagem - ' + err.message }) 
    })   
})

apiRouter.post('/lavagens/', checkToken, isAdmin, async function (req, res) {

    if(req.body.lavagem == null) {
        return res.status(404).json({message: "É obrigatório envio de objeto produto"})
    }

    let lavagem = {
        descricao: "",
        titulo: "",
        preco: "",
        enabled: true
    }

    if(!isNullOrEmpty(req.body.lavagem.descricao)) {
        lavagem.descricao = req.body.lavagem.descricao
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'descricao'"})
    }

    if(!isNullOrEmpty(req.body.lavagem.titulo)) {
        lavagem.titulo = req.body.lavagem.titulo
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'titulo'"})
    }

    if(!isNullOrEmpty(req.body.lavagem.preco)) {
        lavagem.preco = req.body.lavagem.preco
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'preco'"})
    }

    return await knex.insert(lavagem).into("lavagem").returning("id")
    .then(id => {
        return res.status(200).json({...lavagem, ...id[0]}).end()
    })
    .catch(err => {
        return res.status(400).json({message: 'Erro ao adicionar lavagem - ' + err.message})
    })
})

apiRouter.put('/lavagens/:id', checkToken, isAdmin, async function (req, res) {
    if(req.body.lavagem == null) {
        return res.status(400).json({message: "É obrigatório envio de objeto lavagem"})
    }

    if(isNullOrEmpty(req.body.lavagem.descricao) && 
        isNullOrEmpty(req.body.lavagem.titulo) && 
        isNullOrEmpty(req.body.lavagem.preco)) {
            return res.status(400).json({message: "É obrigatório envio de algum atributo de lavagem: 'descricao' ou 'titulo' ou 'preco'"})
    }
    
    return await knex("lavagem").where("id", req.params.id).first().update(req.body.lavagem, "*")
    .then(lavagem => {
        if(lavagem.length > 0)
            return res.status(200).json(lavagem[0])
        else
            return res.status(404).json({message: "Lavagem com esse id não existe"})
    })
    .catch(err => {
        return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
    })
})

apiRouter.put('/lavagens/deletar/:id', checkToken, isAdmin, async function (req, res) {
    return await knex("lavagem").where("id", req.params.id).first().update({enabled: false}, "*")
    .then(lavagem => {
        if(lavagem.length > 0)
            return res.status(200).json(lavagem[0])
        else
            return res.status(404).json({message: "Lavagem com esse id não existe"})
    })
    .catch(err => {
        return res.status(400).json({message: "Lavagem não encontrado ou erro - " + err.message})
    })
})

//Adicionar tipos de veículo
apiRouter.get('/veiculos', checkToken, async function (req, res) {
    return await knex.select('*').where("enabled", true).orderBy('id', 'desc').from('veiculo') 
    .then( veiculo => { return res.status(200).json(veiculo) }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar veiculo - ' + err.message }) 
    })   
})

apiRouter.get('/veiculos/:id', checkToken, async function (req, res) {
    return await knex('veiculo').where("id", req.params.id).first()
    .then( veiculo => {
        if (veiculo != null)
            return res.status(200).json(veiculo) 
        else
        return res.status(404).json({message: "Nenhum veiculo com esse id encontrado"}) 
    }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar veiculo - ' + err.message }) 
    })   
})

apiRouter.post('/veiculos/', checkToken, isAdmin, async function (req, res) {

    if(req.body.veiculo == null) {
        return res.status(404).json({message: "É obrigatório envio de objeto veiculo"})
    }

    let veiculo = {
        titulo: "",
        preco: "",
        enabled: true
    }

    if(!isNullOrEmpty(req.body.veiculo.titulo)) {
        veiculo.titulo = req.body.veiculo.titulo
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'titulo'"})
    }

    if(!isNullOrEmpty(req.body.veiculo.preco)) {
        veiculo.preco = req.body.veiculo.preco
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'preco'"})
    }

    return await knex.insert(veiculo).into("veiculo").returning("id")
    .then(id => {
        return res.status(200).json({...veiculo, ...id[0]}).end()
    })
    .catch(err => {
        return res.status(400).json({message: 'Erro ao adicionar veiculo - ' + err.message})
    })
})

apiRouter.put('/veiculos/:id', checkToken, isAdmin, async function (req, res) {
    if(req.body.veiculo == null) {
        return res.status(400).json({message: "É obrigatório envio de objeto veiculo"})
    }

    if(isNullOrEmpty(req.body.veiculo.titulo) && 
        isNullOrEmpty(req.body.veiculo.preco)) {
            return res.status(400).json({message: "É obrigatório envio de algum atributo de veiculo: 'descricao' ou 'titulo' ou 'preco'"})
    }
    
    return await knex("veiculo").where("id", req.params.id).first().update(req.body.veiculo, "*")
    .then(veiculo => {
        if(veiculo.length > 0)
            return res.status(200).json(veiculo[0])
        else
            return res.status(404).json({message: "Veiculo com esse id não existe"})
    })
    .catch(err => {
        return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
    })
})

apiRouter.put('/veiculos/deletar/:id', checkToken, isAdmin, async function (req, res) {
    return await knex("veiculo").where("id", req.params.id).first().update({enabled: false}, "*")
    .then(veiculo => {
        if(veiculo.length > 0)
            return res.status(200).json(veiculo[0])
        else
            return res.status(404).json({message: "Veiculo com esse id não existe"})
    })
    .catch(err => {
        return res.status(400).json({message: "Veiculo não encontrado ou erro - " + err.message})
    })
})

//Adicionar agendamento de lavagem
apiRouter.get('/admin/agendamentos', checkToken, isAdmin, async function (req, res) {
    return await knex.select('agendamento.*', 'lavagem.descricao as lavagemDescricao', 'lavagem.titulo as lavagemTitulo', 'veiculo.titulo as veiculoTitulo').from('agendamento')
    .leftJoin('lavagem', 'agendamento.idLavagem', 'lavagem.id')
    .leftJoin('veiculo', 'agendamento.idVeiculo', 'veiculo.id')
    .then( agendamento => { return res.status(200).json(agendamento) }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar agendamento - ' + err.message }) 
    })   
})

apiRouter.get('/client/agendamentos', checkToken, async function (req, res) {
    return await knex.select('agendamento.*', 'lavagem.descricao as lavagemDescricao', 'lavagem.titulo as lavagemTitulo', 'veiculo.titulo as veiculoTitulo')
    .where("idCliente", req.usuarioId)
    .from('agendamento')
    .leftJoin('lavagem', 'agendamento.idLavagem', 'lavagem.id')
    .leftJoin('veiculo', 'agendamento.idVeiculo', 'veiculo.id')
    .then( agendamento => { return res.status(200).json(agendamento) }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar agendamento - ' + err.message }) 
    })   
})

apiRouter.get('/agendamentos/:id', checkToken, async function (req, res) {
    return await knex.select('agendamento.*', 'lavagem.descricao as lavagemDescricao', 'lavagem.titulo as lavagemTitulo', 'veiculo.titulo as veiculoTitulo')
    .where("agendamento.id", req.params.id)
    .from('agendamento')
    .leftJoin('lavagem', 'agendamento.idLavagem', 'lavagem.id')
    .leftJoin('veiculo', 'agendamento.idVeiculo', 'veiculo.id')
    .then( agendamento => {
        if (agendamento != null)
            return res.status(200).json(agendamento) 
        else
        return res.status(404).json({message: "Nenhum agendamento com esse id encontrado"}) 
    }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar agendamento - ' + err.message }) 
    })   
})

apiRouter.post('/agendamentos/', checkToken, async function (req, res) {

    if(req.body.agendamento == null) {
        return res.status(404).json({message: "É obrigatório envio de objeto agendamento"})
    }

    const usuarioId = req.usuarioId

    let agendamento = {
        idVeiculo: "",
        idLavagem: "",
        kilometragem: "",
        idCliente: usuarioId,
        originalDate: "",
        suggestedDate: "",
        approvedDate: "",
        status: "PENDING_ADMIN",
        precototal: 0,
        adminCode: Math.floor(1000 + Math.random() * 9000),
        clientCode: Math.floor(1000 + Math.random() * 9000)
    }

    if(!isNullOrEmpty(req.body.agendamento.idVeiculo)) {
        agendamento.idVeiculo = req.body.agendamento.idVeiculo
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'veiculo'"})
    }

    if(!isNullOrEmpty(req.body.agendamento.idLavagem)) {
        agendamento.idLavagem = req.body.agendamento.idLavagem
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'lavagem'"})
    }

    if(!isNullOrEmpty(req.body.agendamento.originalDate)) {
        agendamento.originalDate = req.body.agendamento.originalDate
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'originalDate'"})
    }

    const veiculo = await knex('veiculo').where("id", req.body.agendamento.idVeiculo).first()
    
    if(veiculo==null || veiculo==undefined) {
        return res.status(404).json({message: "Não foi encontrado tipo de veiculo com esse id"})
    }

    const lavagem = await knex('lavagem').where("id", req.body.agendamento.idLavagem).first()

    if(veiculo==null || veiculo==undefined) {
        return res.status(404).json({message: "Não foi encontrado tipo de lavagem com esse id"})
    }

    agendamento.precototal = parseFloat(veiculo.preco) + parseFloat(lavagem.preco)

    return await knex.insert(agendamento).into("agendamento").returning("id")
    .then(id => {
        return res.status(200).json({...agendamento, ...id[0]}).end()
    })
    .catch(err => {
        return res.status(400).json({message: 'Erro ao adicionar veiculo - ' + err.message})
    })
})


apiRouter.put('/agendamentos/:id/reagendar', checkToken, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(isNullOrEmpty(req.body.suggestedDate)) {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'suggestedDate'"})
    }

    const changeTo = agendamento.status == "PENDING_ADMIN" ? "PENDING_CLIENT" : "PENDING_ADMIN"

    if(agendamento.status == "PENDING_ADMIN" || agendamento.status == "PENDING_CLIENT") {
        return await knex("agendamento").where("id", req.params.id).first().update({status: changeTo, suggestedDate: req.body.suggestedDate}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já foi aprovado e atualmente está em status: " + agendamento.status})
    }
})

apiRouter.put('/agendamentos/:id/aprovar', checkToken, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    const date = (agendamento.suggestedDate != null && agendamento.suggestedDate != "") ? agendamento.suggestedDate : agendamento.originalDate

    if(agendamento.status == "PENDING_ADMIN" || agendamento.status == "PENDING_CLIENT") {
        return await knex("agendamento").where("id", req.params.id).first().update({status: "APPROVED", approvedDate: date}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já foi aprovado e atualmente está em status: " + agendamento.status})
    }
})

apiRouter.put('/agendamentos/:id/cancelar', checkToken, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(agendamento.status == "PENDING_ADMIN" || agendamento.status == "APPROVED") {
        return await knex.select('agendamento.*', 'lavagem.descricao as lavagemDescricao', 'lavagem.titulo as lavagemTitulo', 'veiculo.titulo as veiculoTitulo')
        .from('agendamento')
        .where("agendamento.id", req.params.id)
        .first()
        .leftJoin('lavagem', 'agendamento.idLavagem', 'lavagem.id')
        .leftJoin('veiculo', 'agendamento.idVeiculo', 'veiculo.id')
        .update({status: "CANCELED"}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já não pode mais ser cancelado, cancelamento pode ser apenas feito na fase de pendência ou aprovação. Atualmente status é: " + agendamento.status})
    }
})

apiRouter.put('/admin/agendamentos/:id/estacionar', checkToken, isAdmin, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(isNullOrEmpty(req.body.codigo)) {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'codigo'"})
    }

    if(isNullOrEmpty(req.body.kilometragem)) {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'kilometragem'"})
    }

    if(req.body.codigo == agendamento.clientCode) {
        if(agendamento.status == "APPROVED") {
            return await knex("agendamento").where("id", req.params.id).first().update({status: "IN_PARK", kilometragem: req.body.kilometragem}, "*")
            .then(agendamento => {
                if(agendamento.length > 0)
                    return res.status(200).json(agendamento[0])
                else
                    return res.status(404).json({message: "Agendamento com esse id não existe"})
            })
            .catch(err => {
                return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
            })
        } else {
            return res.status(405).json({message: "Esse item já não pode ser estacionado. Atualmente status é: " + agendamento.status})
        }
    } else {
        return res.status(200).json({message: "Esse codigo não está correto"})
    }
})


apiRouter.put('/client/agendamentos/:id/estacionar', checkToken, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(isNullOrEmpty(req.body.codigo)) {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'codigo'"})
    }

    if(isNullOrEmpty(req.body.kilometragem)) {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'kilometragem'"})
    }

    if(req.body.codigo == agendamento.adminCode) {
        if(agendamento.status == "APPROVED") {
            return await knex("agendamento").where("id", req.params.id).first().update({status: "IN_PARK", kilometragem: req.body.kilometragem}, "*")
            .then(agendamento => {
                if(agendamento.length > 0)
                    return res.status(200).json(agendamento[0])
                else
                    return res.status(404).json({message: "Agendamento com esse id não existe"})
            })
            .catch(err => {
                return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
            })
        } else {
            return res.status(405).json({message: "Esse item já não pode ser estacionado. Atualmente status é: " + agendamento.status})
        }
    } else {
        return res.status(303).json({message: "Esse codigo não está correto"})
    }
})

apiRouter.put('/agendamentos/:id/iniciar', checkToken, isAdmin, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(agendamento.status == "IN_PARK") {
        return await knex("agendamento").where("id", req.params.id).first().update({status: "IN_PROGRESS"}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já não pode iniciar lavagem. Atualmente status é: " + agendamento.status})
    }
})

apiRouter.put('/agendamentos/:id/terminar', checkToken, isAdmin, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(agendamento.status == "IN_PROGRESS") {
        return await knex("agendamento").where("id", req.params.id).first().update({status: "CONCLUDED"}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já não pode terminar lavagem. Atualmente status é: " + agendamento.status})
    }
})

apiRouter.put('/agendamentos/:id/pagar', checkToken, isAdmin, async function (req, res) {
    const agendamento = await knex("agendamento").where("id", req.params.id).first()
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })

    if(agendamento.status == "CONCLUDED") {
        return await knex("agendamento").where("id", req.params.id).first().update({status: "PAYED"}, "*")
        .then(agendamento => {
            if(agendamento.length > 0)
                return res.status(200).json(agendamento[0])
            else
                return res.status(404).json({message: "Agendamento com esse id não existe"})
        })
        .catch(err => {
            return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
        })
    } else {
        return res.status(405).json({message: "Esse item já não pode ser pago. Atualmente status é: " + agendamento.status})
    }
})

apiRouter.delete('/agendamentos/:id', checkToken, isAdmin, async function (req, res) {
    return await knex("agendamento").where("id", req.params.id).del()
    .then(success => {
        if(success > 0)
            return res.status(200).json({message: "Agendamento excluido"})
        else
            return res.status(404).json({message: "Agendamento com esse id não existe"})
    })
    .catch(err => {
        return res.status(400).json({message: "Agendamento não encontrado ou erro - " + err.message})
    })
})

apiRouter.post('/seguranca/register', async function (req, res) { 
    await knex('usuario') 
        .insert({ 
            nome: req.body.nome,  
            login: req.body.login,  
            senha: bcrypt.hashSync(req.body.senha, 8),  
            email: req.body.email,
            roles: req.body.roles,
            phone: req.body.phone
        }, ['id']) 
        .then((result) => { 
            let usuario = result[0] 
            return res.status(200).json(usuario)  
        }) 
        .catch(err => { 
            return res.status(500).json({  
                message: 'Erro ao registrar usuario - ' + err.message }) 
        })   
}) 

apiRouter.post('/seguranca/login', async function (req, res) {  
    return await knex 
      .select('*').from('usuario').where( { login: req.body.login }) 
      .then( usuarios => { 
          if(usuarios.length){ 
              let usuario = usuarios[0] 
              let checkSenha = bcrypt.compareSync (req.body.senha, usuario.senha) 
              if (checkSenha) { 
                 var tokenJWT = jwt.sign({ id: usuario.id },  
                      process.env.SECRET_KEY) 
 
                  res.status(200).json ({ 
                      id: usuario.id, 
                      login: usuario.login,  
                      email: usuario.email,  
                      nome: usuario.nome,  
                      roles: usuario.roles, 
                      token: tokenJWT,
                      phone: usuario.phone
                  })   
                  return  
              } 
          }  
             
          return res.status(200).json({ message: 'Login ou senha incorretos' }) 
      }) 
      .catch (err => { 
          return res.status(500).json({  
             message: 'Erro ao verificar login - ' + err.message }) 
      }) 
})

apiRouter.post('/endereco/', checkToken, isAdmin, async function (req, res) {
    let endereco = {
        descricao: "",
        link: ""
    }

    if(!isNullOrEmpty(req.body.descricao)) {
        endereco.descricao = req.body.descricao
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'descricao'"})
    }

    if(!isNullOrEmpty(req.body.link)) {
        endereco.link = req.body.link
    } else {
        return res.status(404).json({message: "É obrigatório adicionar um atributo 'link'"})
    }

    return await knex.insert(endereco).into("endereco").returning("id")
    .then(id => {
        return res.status(200).json({...endereco, ...id[0]}).end()
    })
    .catch(err => {
        return res.status(400).json({message: 'Erro ao adicionar veiculo - ' + err.message})
    })
})


apiRouter.put('/endereco/editar', checkToken, isAdmin, async function (req, res) {
    if(isNullOrEmpty(req.body.descricao) && 
        isNullOrEmpty(req.body.link)) {
            return res.status(400).json({message: "É obrigatório envio de algum atributo de endereco: 'descricao' ou 'link'"})
    }
    
    return await knex("endereco").where("id", 1).first().update({descricao: descricao, link: link}, "*")
    .then(endereco => {
        if(endereco.length > 0)
            return res.status(200).json(endereco[0])
        else
            return res.status(404).json({message: "Endereco com esse id não existe"})
    })
    .catch(err => {
        return res.status(404).json({message: "Nenhum item encontrado com esse id - " + err.message})
    })
})

apiRouter.get('/endereco', checkToken, async function (req, res) {
    return await knex('endereco').where("id", 1).first()
    .then( endereco => {
        if (endereco != null)
            return res.status(200).json(endereco) 
        else
        return res.status(404).json({message: "Nenhum endereco com esse id encontrado"}) 
    }) 
    .catch(err => { 
        return res.status(500).json({message: 'Erro ao recuperar endereco - ' + err.message }) 
    })   
})

apiRouter.use(function (req, res, next) {
    res.status(404);
    res.json({message: "Esse endpoint não foi encontrado (404)"});
})

function isNullOrEmpty (value) {
    if( value == null || value == "" )
        return true
    return false
}

module.exports = apiRouter;