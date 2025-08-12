import { addMinutes, isAfter } from "date-fns";
import { Message, type OmitPartialGroupDMChannel } from "discord.js";

import { noSession } from "../errors/NoSession";

import { getSession } from "../utils/getSession";
import { titleize } from "../utils/titleize";

import { embedMessage } from '../utils/EmbedMessage';
import { firestore } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function indicate(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
  const { session } = await getSession({
    channel: msg.channel,
    guildId: msg.guild!.id,
  })

  if (!session) return noSession(msg);

  const compareDate = addMinutes(session.startedAt.toDate(), 15);

  if (isAfter(Date.now(), compareDate))
    return embedMessage('Prazo para indicação expirou.', msg, 160000);

  const fName = msg.content.replace('!indica', '').trim();
  const filmName = titleize(fName);

  if (!filmName)
    return embedMessage('Insira o nome do filme', msg, 160000);

  const channel = msg.guild?.channels.cache.get(session.channelId)

  if (!channel || !channel.isVoiceBased()) {
    return embedMessage('Chat não encotrado', msg, 160000)
  }

  const isUserInVoice = channel.members.has(msg.member!.id)

  if (!isUserInVoice) {
    return embedMessage('Você precisa estar na chamada para indicar', msg, 160000)
  }

  // const isUserAlreadyIndicate = session.suggestions.some(suggestion => suggestion.userId === msg.author.id)

  // if (isUserAlreadyIndicate) {
  //   return embedMessage('Você já indicou filme para essa sessão!', msg, 160000)
  // }

  const guildId = msg.guild!.id

  const sessionsRef = doc(firestore, `guilds/${guildId}/sessions/${session.collectionName}`)

  const isParticipantInArray = session.participants.some(participant => participant.id === msg.author.id)

  const newParticipant = {
    id: msg.author.id,
    username: msg.author.username,
    avatar: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`,
    nickname: msg.author?.displayName,
  }

  const participants = !isParticipantInArray ? [...session.participants, newParticipant] : session.participants

  await updateDoc(sessionsRef, {
    participants,
    suggestions: [...session.suggestions, {
      userId: msg.author.id,
      filmName
    }],
  })

  embedMessage(`${msg.author?.displayName} indicou o filme: ${filmName}`, msg, 160000)
  // const user = await verifyRoom(msg);

  // if (!user)
  //   return embedMessage('Usuário não encontrado.', msg, 160000);

  // if (user.data.raffle_streak === 2) {
  //   if (!user.data.penalty) {
  //     await fauna.query(
  //       q.Let(
  //         {
  //           doc: q.Get(q.Match(q.Index("user_by_name"), user.data.name)),
  //         },
  //         q.Update(
  //           q.Select(["ref"], q.Var('doc')),
  //           {
  //             data: {
  //               penalty: session.data.session_number + 1,
  //               sessions_without_raffle: q.Add(1, q.Select(["data", "sessions_without_raffle"], q.Var("doc"))),
  //             }
  //           }
  //         )
  //       )
  //     );

  //     await fauna.query(
  //       q.Update(
  //         q.Ref(q.Collection('sessions'), session.ref.id),
  //         {
  //           data: {
  //             room: [...session.data.room, user.data.name],
  //           }
  //         },
  //       )
  //     );

  //     return embedMessage('Você foi sorteado por 2 sessões seguidas. Fique essa e a proxima sessão sem indicar.', msg, 160000);
  //   } else if (user.data.penalty >= session.data.session_number) {
  //     await fauna.query(
  //       q.Let(
  //         {
  //           doc: q.Get(q.Match(q.Index("user_by_name"), user.data.name)),
  //         },
  //         q.Update(
  //           q.Select(["ref"], q.Var('doc')),
  //           {
  //             data: {
  //               sessions_without_raffle: q.Add(1, q.Select(["data", "sessions_without_raffle"], q.Var("doc"))),
  //             }
  //           }
  //         )
  //       )
  //     );

  //     return embedMessage('Ainda não meu patrão, aguarde a próxima sessão!', msg, 160000);
  //   } else if (user.data.penalty < session.data.session_number) {
  //     await fauna.query(
  //       q.Update(
  //         q.Ref(q.Collection('users'), user.ref.id),
  //         {
  //           data: {
  //             penalty: null,
  //             raffle_streak: 0,
  //           }
  //         },
  //       )
  //     );
  //   }
  // }

  // const findByUsername = session.data.indications.some(indication => indication.username === user.data.name);

  // if (findByUsername) {
  //   return embedMessage('Você já indicou seu filme.', msg, 160000);
  // } else {
  //   embedMessage(`${user.data.name} indicou o filme: ${filmName}`, msg, 160000);

  //   let drawChances: Indication[] = [];

  //   if (user.data.sessions_without_raffle < 5) {
  //     drawChances.push({
  //       username: user.data.name,
  //       indicate: filmName,
  //     });
  //   } else if (user.data.sessions_without_raffle >= 5) {
  //     for (let count = 0; count < 2; count++) {
  //       drawChances.push({
  //         username: user.data.name,
  //         indicate: filmName,
  //       });
  //     }
  //   } else if (user.data.sessions_without_raffle >= 10) {
  //     for (let count = 0; count < 4; count++) {
  //       drawChances.push({
  //         username: user.data.name,
  //         indicate: filmName,
  //       });
  //     }
  //   } else if (user.data.sessions_without_raffle >= 15) {
  //     for (let count = 0; count < 6; count++) {
  //       drawChances.push({
  //         username: user.data.name,
  //         indicate: filmName,
  //       });
  //     }
  //   }

  //   const updatedIndications = session.data.indications.concat(drawChances);

  //   let updatedRoom: string[] = [...session.data.room];

  //   if (!session.data.room.includes(user.data.name)) {
  //     updatedRoom = [
  //       ...session.data.room,
  //       user.data.name,
  //     ]

  //     embedMessage(`Bem vindo à sala ${user.data.name}.`, msg, 160000);
  //   }

  //   await fauna.query(
  //     q.Update(
  //       q.Ref(q.Collection('sessions'), session.ref.id),
  //       {
  //         data: {
  //           indications: updatedIndications,
  //           room: updatedRoom,
  //         }
  //       },
  //     )
  //   );
  // }
}