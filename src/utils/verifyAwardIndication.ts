import { Message } from "discord.js";
import { Award } from "../commands/award";

export function verifyAwardIndication(awardDatabase: Award, msg: Message, code: number) {
  const hasAlreadyIndicate01 = awardDatabase.award.data[`category_${code}`]?.some(indication => {
    return indication.user_indicator_id === msg.author.id;
  });

  if (hasAlreadyIndicate01) {
    return true;
  } else {
    return false;
  }
}