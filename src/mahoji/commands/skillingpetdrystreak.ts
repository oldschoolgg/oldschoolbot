import { ApplicationCommandOptionType } from 'discord.js';
import { getUsername } from '../../lib/util';
import type { OSBMahojiCommand } from '../lib/util';

interface DryResult {
  id: string;
  val: number;
  grey?: number;
  red?: number;
  black?: number;
}

async function babyChinchompaDry(ironman: boolean): Promise<string> {
  const ironFilter = ironman ? 'AND "minion.ironman" = true' : '';
  const query = `SELECT users.id,
    COALESCE(("creature_scores"->>'7')::int,0) AS grey,
    COALESCE(("creature_scores"->>'8')::int,0) AS red,
    COALESCE(("creature_scores"->>'9')::int,0) AS black,
    COALESCE(("creature_scores"->>'7')::int,0)+COALESCE(("creature_scores"->>'8')::int,0)+COALESCE(("creature_scores"->>'9')::int,0) AS total
  FROM users
  INNER JOIN "user_stats" ON "user_stats"."user_id"::text = users.id
  WHERE "collectionLogBank"->>'13323' IS NULL
  ${ironFilter}
  ORDER BY total DESC
  LIMIT 10;`;
  const res = await prisma.$queryRawUnsafe<DryResult[]>(query);
  if (res.length === 0) return 'No results found.';
  const lines = await Promise.all(
    res.map(async r => `${await getUsername(r.id)}: ${r.total.toLocaleString()} caught (${r.grey.toLocaleString()} grey, ${r.red.toLocaleString()} red, ${r.black.toLocaleString()} black)`)
  );
  return `**Dry Streaks for Baby chinchompa:**\n${lines.join('\n')}`;
}

async function xpDry(pet: string, itemID: number, column: string, ironman: boolean): Promise<string> {
  const ironFilter = ironman ? 'AND "minion.ironman" = true' : '';
  const query = `SELECT id, ${column}::bigint AS val FROM users WHERE "collectionLogBank"->>'${itemID}' IS NULL ${ironFilter} ORDER BY ${column}::bigint DESC LIMIT 10;`;
  const res = await prisma.$queryRawUnsafe<DryResult[]>(query);
  if (res.length === 0) return 'No results found.';
  const lines = await Promise.all(res.map(async r => `${await getUsername(r.id)}: ${Number(r.val).toLocaleString()} XP`));
  return `**Dry Streaks for ${pet}:**\n${lines.join('\n')}`;
}

async function squirrelDry(ironman: boolean): Promise<string> {
  const ironFilter = ironman ? 'AND "minion.ironman" = true' : '';
  const ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  const sum = ids.map(id => `COALESCE(("laps_scores"->>'${id}')::int,0)`).join(' + ');
  const query = `SELECT users.id, ${sum} AS val FROM users INNER JOIN "user_stats" ON "user_stats"."user_id"::text = users.id WHERE "collectionLogBank"->>'20659' IS NULL ${ironFilter} ORDER BY val DESC LIMIT 10;`;
  const res = await prisma.$queryRawUnsafe<DryResult[]>(query);
  if (res.length === 0) return 'No results found.';
  const lines = await Promise.all(res.map(async r => `${await getUsername(r.id)}: ${r.val.toLocaleString()} laps`));
  return `**Dry Streaks for Giant squirrel:**\n${lines.join('\n')}`;
}

export const skillingPetDryStreakCommand: OSBMahojiCommand = {
  name: 'skillingpetdrystreak',
  description: 'Show dry streaks for skilling pets.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'pet',
      description: 'The skilling pet to check.',
      required: true,
      choices: [
        'Baby chinchompa',
        'Beaver',
        'Giant squirrel',
        'Rift guardian',
        'Tangleroot',
        'Rocky',
        'Rock golem',
        'Heron'
      ].map(i => ({ name: i, value: i }))
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'ironman',
      description: 'Only show ironmen.',
      required: false
    }
  ],
  run: async ({ options }) => {
    const pet = options.pet as string;
    const ironman = Boolean(options.ironman);
    switch (pet) {
      case 'Baby chinchompa':
        return babyChinchompaDry(ironman);
      case 'Beaver':
        return xpDry('Beaver', 13322, 'skills_woodcutting', ironman);
      case 'Giant squirrel':
        return squirrelDry(ironman);
      case 'Rift guardian':
        return xpDry('Rift guardian', 20665, 'skills_runecraft', ironman);
      case 'Tangleroot':
        return xpDry('Tangleroot', 20661, 'skills_farming', ironman);
      case 'Rocky':
        return xpDry('Rocky', 20663, 'skills_thieving', ironman);
      case 'Rock golem':
        return xpDry('Rock golem', 13321, 'skills_mining', ironman);
      case 'Heron':
        return xpDry('Heron', 13320, 'skills_fishing', ironman);
      default:
        return 'Invalid pet.';
    }
  }
};
