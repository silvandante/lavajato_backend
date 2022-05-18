Fiz os testes usando o PostMan

E utilizei o cliente do postgres PgAdmin para Mac

Início:
https://lava-jato-api.herokuapp.com/app

API:
https://lava-jato-api.herokuapp.com/api

Lista de endpoints no swagger:
https://lava-jato-api.herokuapp.com/

Acessos:

CONTA DE ADMIN: admin@lavajato.com | SENHA: Admin123
CONTA DE ADMIN: admin@meulavajato.com | SENHA: Aa123456789@
CONTA DE CLIENTE: teste@mail.com | SENHA: Aa123456789@
CONTA DE CLIENTE: teste1@mail.com | SENHA: Aa123456789@

Para fazer todo o fluxo de um agendamento deixei 2 agendamentos prontos:
Agendamento id #28, para fazer o registro de quilometragem com o admin use o código 9012 ou para fazer registro com cliente use o código 9088
Agendamento id #26, para fazer o registro de quilometragem com o admin use o código 7338 ou para fazer registro com cliente use o código 3944

Se quiser criar mais agendamentos use o perfil de cliente pelo app ou insira pelo swagger diretamente no endpoint, depois basta consultar o pedido e ver o clientCode (para confirmar o KM com perfil de gerente) ou adminCode (para confirmar o KM com perfil de cliente)

Pelo app só é possível registrar-se como cliente, pois pela regra de negócio admins só devem ser adicionados pelo administrador do sistema, mas para testes é possível registrar um usuário com role "ADMIN" no endpoint https://lava-jato-api.herokuapp.com/api/seguranca/register (use o mesmo e-mail nos campos login e email)

Meu e-mail para contato: annyufrr@gmail.com
