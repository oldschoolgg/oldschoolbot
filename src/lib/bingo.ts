import { KlasaUser } from 'klasa';

export interface BingoInstance {
	start: Date;
	finish: Date;
}

export interface BingoItem {
	id: number;
	description: string;
	check: (user: KlasaUser, bingo: BingoInstance) => Promise<boolean>;
}

export const bingoItems: BingoItem[] = [
	{
		id: 1,
		description: 'Gain 5 million XP in any skills',
		check: async (user, bingo) => {
			const query = `SELECT COALESCE(sum(xp), 0) as total_xp
FROM xp_gains
WHERE date > to_timestamp(${bingo.start.getTime()} / 1000)::date
AND date < to_timestamp(${bingo.finish.getTime()} / 1000)::date
AND artificial IS NULL
AND user_id = '${user.id}';`;
			const xpGains = await user.client.query<{ total_xp: string }[]>(query);
			return parseInt(xpGains[0].total_xp) > 5_000_000;
		}
	},
	{
		id: 2,
		description: 'Gain 5 million XP in any skills',
		check: async (user, bingo) => {
			const query = `SELECT COALESCE(sum(xp), 0) as total_xp
FROM xp_gains
WHERE date > to_timestamp(${bingo.start.getTime()} / 1000)::date
AND date < to_timestamp(${bingo.finish.getTime()} / 1000)::date
AND artificial IS NULL
AND user_id = '${user.id}';`;
			const xpGains = await user.client.query<{ total_xp: string }[]>(query);
			return parseInt(xpGains[0].total_xp) > 5_000_000;
		}
	}
];
