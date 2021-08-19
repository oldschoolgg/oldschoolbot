import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';

export interface BingoInstance {
	start: Date;
	finish: Date;
}

async function getXPGainsInBingo(user: KlasaUser, bingo: BingoInstance, skills?: SkillsEnum[]) {
	const query = `SELECT COALESCE(sum(xp), 0) as total_xp
FROM xp_gains
WHERE date > to_timestamp(${bingo.start.getTime()} / 1000)::date
AND date < to_timestamp(${bingo.finish.getTime()} / 1000)::date
AND artificial IS NULL
${skills !== undefined ? `AND skill IN (${skills.map(s => `'${s}'`).join(', ')})` : ''}
AND user_id = '${user.id}';`;
	console.log(query);
	const xpGains = await user.client.query<{ total_xp: string }[]>(query);
	return parseInt(xpGains[0].total_xp);
}

export interface BingoItem {
	id: number;
	description: string;
	check: (user: KlasaUser, bingo: BingoInstance) => Promise<boolean>;
}

export const bingoItems: BingoItem[] = [
	{
		id: 1,
		description: 'Gain 3 million XP in any skills',
		check: async (user, bingo) => {
			const xpGains = await getXPGainsInBingo(user, bingo);
			return xpGains > 5_000_000;
		}
	},
	{
		id: 2,
		description: 'Gain 1 million XP in Artisan skills',
		check: async (user, bingo) => {
			const xpGains = await getXPGainsInBingo(user, bingo, [
				SkillsEnum.Cooking,
				SkillsEnum.Smithing,
				SkillsEnum.Fletching,
				SkillsEnum.Firemaking,
				SkillsEnum.Herblore,
				SkillsEnum.Crafting,
				SkillsEnum.Runecraft,
				SkillsEnum.Runecraft,
				SkillsEnum.Construction
			]);
			return xpGains > 1_000_000;
		}
	},
	{
		id: 3,
		description: 'Gain 1 million XP in Gathering skills',
		check: async (user, bingo) => {
			const xpGains = await getXPGainsInBingo(user, bingo, [
				SkillsEnum.Mining,
				SkillsEnum.Fishing,
				SkillsEnum.Woodcutting,
				SkillsEnum.Hunter,
				SkillsEnum.Farming
			]);
			return xpGains > 1_000_000;
		}
	}
];
