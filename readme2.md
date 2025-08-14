!start - Iniciar a sessão com um botão de entrar na sessão (para entrar é preciso estar na call)
  - Criar a sessão daquele servidor no firebase, apontar para o channel onde o criador está.
  - Adicionar o criador na lista de participantes
  - cada user que clicar no botão de entrar é adicionado na lista de participantes
  
!sorteio ou 15 minutos após !start
  - (opc) caso passem 15 minutos (configuravel) o bot realiza o sorteio ou encerra a sessão por falta de filmes
  - ao ser sorteado, o bot deve retornar qual filme foi e todas as suas informações relevantes
  - na mensagem abaixo deve explicar que é necessário dar !party {link_do_filme} para continuar

!party {link_do_filme}
  - o bot deve gerar a url (add o query param para que o socket se conecte com a página) e retornar o link em forma de botão
  - a partir de agora, qualquer user que entrar na call ao clicar em entrar na party no inicio deve receber a mensagem já configurada com o botão.

## BUGS ##
[-] - alguma coisa acontecendo com o pop-up do discord

## SMALL IMPROVES ##
[x] - melhora da UI
[] - verificar melhor a URL, não só o party id
[x] - adicionar verificação de velocidade do vídeo
[x] - logica de apenas host controla sessão

[x] - CRIAÇÃO DE SESSÃO PELO DISCORD
  [x] - indicação
  [x] - votação
  [x] - criação da party
[x] - CRIAÇÃO DA SESSÃO DIRETO PELA EXTENSÃO
  [x] - link já gerado

## TASKS ##
[x] - bloqueio dos botões em não hosts (caso esteja marcado)
  [x] - atalhos
    [x] - j, l
    [x] - k
    [x] - ArrowLeft, ArrowRight
    [x] - Space
    [x] - video container
    [x] - video bg
[] - settings não funciona
[] - botões 0 a 9, home e end, < e > (Bloquear)
[] - hidratar a extensão
[] - hidratar a extensão na criação pela mesma
[] - solicitação dos não hosts
[] - sync inteligente
[] - icones
[] - validação do parametro de party em outras urls
[] - se o host estiver mutado não aparece o resync
[] - loadings no geral
[] - leves correções no sync
[] - toda lógica da antiga dinamica do bot no discord
[] - melhorar os embeds baseados se são filmes/transmissões
[] - logo da extensão não aparece/pequena
[] - quando um user entra na sessão ele ou não esta instantaneamente sincronizado ou não esta no estado correto (play/pause)
[] - padronizar os nomes dos eventos (MAISCULO_COM_UNDERLINE)
[] - troca de host