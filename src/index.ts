import { Client, GatewayIntentBits } from "discord.js";

import 'dotenv/config';

import { startSession } from './commands/start';
import { indicate } from './commands/indicate';
// import { changeFilm } from './commands/changeFilm';
import { raffle } from './commands/raffle';
import { list } from './commands/list';
import { clear } from './commands/clear';
import { notes } from './commands/note';
import { average } from './commands/average';
import { ticket } from './commands/ticket';
import { showRoom } from './commands/room';
import { finalize } from './commands/finalize';
import { stop } from './commands/stop';
import { award } from './commands/award';
import { awardMessage } from './commands/stzaward/awardMessage';
import { awardVote } from './commands/stzaward/awardVote';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Permite interagir com servidores
    GatewayIntentBits.GuildMessages, // Permite ler mensagens enviadas em canais de servidores
    GatewayIntentBits.MessageContent // Permite acessar o conteúdo das mensagens (precisa ser ativado no painel)
  ]
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => console.log("Client started!"));

client.on('messageCreate', async msg => {
  console.log('message', msg)
  if (msg.content === '!start') await startSession(msg);

  if (msg.content.startsWith('!indica')) await indicate(msg);

  // if (msg.content.startsWith('!mudarfilme')) await changeFilm(msg);

  if (msg.content === '!sorteio') await raffle(msg);

  if (msg.content === '!lista') await list(msg);

  if (msg.content === '!clear') await clear(msg);

  if (msg.content.startsWith('!nota')) await notes(msg);

  if (msg.content === '!media') await average(msg);

  if (msg.content === '!ingresso') await ticket(msg);

  if (msg.content === '!sala') await showRoom(msg);

  if (msg.content === '!finalize') await finalize(msg);

  if (msg.content === '!stop') await stop(msg);

  if (msg.content.startsWith('!premiostz')) await award(msg);

  if (msg.content === '!sendAwardMessage') awardMessage(client);
  
  if (msg.content.startsWith('!votar')) await awardVote(msg);
});

