import { Message } from "discord.js";
import { Category } from "../award";

type Categories = {
  [category: string]: Category[];
}

export async function infoAward(msg: Message, categories: Categories) {
  msg.channel.send({ 
    embed: {
      color: 3447003,
      title: 'Prêmio Cinestarz! - Categorias:',
      fields: [
        {
          name: "01 - Melhor filme",
          value: categories[`category_1`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_1`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
            'Para indicar nessa categoria digite !premiostz 01 <filme>',
        },
        {
          name: "02 - Melhor ator",
          value: categories[`category_2`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_2`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 02 <ator - filme>',
        },
        {
          name: "03 - Melhor atriz",
          value: categories[`category_3`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_3`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 03 <atriz - filme>',
        },
        {
          name: "04 - Melhor trilha sonora",
          value: categories[`category_4`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_4`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 04 <filme>',
        },
        {
          name: "05 - Melhor animação",
          value: categories[`category_5`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_5`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 05 <filme>',
        },
        {
          name: "06 - Melhor filme de careca",
          value: categories[`category_6`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_6`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 06 <careca - filme>',
        },
        {
          name: "07 - Melhor pior filme",
          value: categories[`category_7`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_7`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 07 <filme>',
        },
        {
          name: "08 - Melhor 'teu cu'",
          value: categories[`category_8`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_8`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 08 <filme>',
        },
        {
          name: "09 - Melhor plot twist",
          value: categories[`category_9`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_9`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 09 <filme>',
        },
        {
          name: "10 - Melhor pior ator/atriz",
          value: categories[`category_10`]?.some(
            indication => indication.user_indicator_id === msg.author.id) ?
            categories[`category_10`]?.find(
              indication => indication.user_indicator_id === msg.author.id)?.film_title :
              'Para indicar nessa categoria digite !premiostz 10 <ator - filme>',
        },
      ],
    },
  });
}