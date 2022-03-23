import { Award } from "../commands/award";

export async function findAllIndicatedMovies(awardDatabase: Award, code: number) {
  return awardDatabase.award.data[`category_${code}`];
}