<h1 align="center">
  Cinestarz - Bot de servidor Discord.
</h1>

<p align="center">
  <img alt="Portfolio - Gabriel Garcez" src=".github/cinestarz.png" width="100%">
</p>

## Sobre o Projeto

Aplicação desenvolvida para um servidor privado do discord para realizar sorteio de filmes indicados pelos participantes e ao final da sessão coletar a nota dada por cada usuário e armazenar em uma planilha no Google Drive.

## Funcionalidades

- [x] Usuário indica inicia a sessão e outros usuários podem indicar filmes de sua preferencia para sorteio.

- [x] Realização do sorteio e mensagem de retorno com informações do filme sorteado, como nota geral, sinopse, serviços de streaming, duração, etc.

- [x] Armazenamento no Sheets utilizando a API do Google.

## Próximas features

- [ ] Reconhecimento se usuário está na sala sem necessidade de comando.

- [ ] Criação de link direto para serviço de party em streaming.

## Feito com:
- [Discord](https://discord.com/developers/docs/intro) -  Aplicativo de voz sobre IP proprietário e gratuito, projetado inicialmente para comunidades de jogos.
- [Node.js](https://nodejs.org/en/) - Plataforma para Javascript no Backend.
- [FaunaDB](https://fauna.com/) - Banco de dados.
- [Typescript](https://github.com/microsoft/TypeScript) - Supertset para Javascript.
- [Google API Azure](https://docs.microsoft.com/en-us/azure/) - API Google Azure.

## Como executar

- Primeiro é necessário criar um bot dentro de [Discord API](https://discord.com/developers/docs/intro).

- Inserir bot do no servidor desejado

- Executar projeto
```
$ git clone https://github.com/Garcez17/cinstarz-bot
$ cd cinstarz-bot
$ yarn
$ yarn dev
```

## Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://github.com/Garcez17/cinstarz-bot/blob/main/LICENSE) para mais detalhes.
