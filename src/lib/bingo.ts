/* eslint-disable @typescript-eslint/no-unused-vars */
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { barrowsTuple } from './data/CollectionsExport';
import { ItemBank } from './types';
import resolveItems from './util/resolveItems';

export interface BingoInstance {
	start: Date;
	finish: Date;
}

export const bingo: BingoInstance = {
	start: new Date('2021-08-14 07:00:00'),
	finish: new Date('2021-08-21 07:00:00')
};

const startQueryDate = `to_timestamp(${bingo.start.getTime()} / 1000)::date`;
const finishQueryDate = `to_timestamp(${bingo.finish.getTime()} / 1000)::date`;

// do 10 hours of a minigame

async function getXPGainsInBingo(user: KlasaUser, skills?: SkillsEnum[]) {
	const query = `SELECT COALESCE(sum(xp), 0) as total_xp
FROM xp_gains
WHERE date BETWEEN ${startQueryDate} AND ${finishQueryDate}
AND artificial IS NULL
${skills !== undefined ? `AND skill IN (${skills.map(s => `'${s}'`).join(', ')})` : ''}
AND user_id = '${user.id}';`;
	const xpGains = await user.client.query<{ total_xp: string }[]>(query);
	return parseInt(xpGains[0].total_xp);
}

async function getTotalLootInBingo(user: KlasaUser) {
	const bank = new Bank();
	const query = `SELECT loot
				   FROM activity
				   WHERE loot IS NOT NULL
				   AND completed = true
				   AND user_id = '${user.id}'
				   AND finish_date BETWEEN ${startQueryDate} AND ${finishQueryDate};`;
	const result = await user.client.query<{ loot: ItemBank }[]>(query);
	for (const activity of result) {
		bank.add(activity.loot);
	}
	return bank;
}

export interface BingoItem {
	id: number;
	description: string;
	category: 'Skilling' | 'PvM';
	check: (user: KlasaUser, bingo: BingoInstance) => Promise<boolean>;
}

async function oneOf(user: KlasaUser, items: string[]) {
	const loot = await getTotalLootInBingo(user);
	return resolveItems(items).some(item => loot.has(item));
}

export const bingoItems: BingoItem[] = [
	{
		id: 1,
		category: 'Skilling',
		description: 'Gain 3 million XP in any skills',
		check: async user => {
			const xpGains = await getXPGainsInBingo(user);
			return xpGains > 5_000_000;
		}
	},
	{
		id: 2,
		category: 'Skilling',
		description: 'Gain 1 million XP in Artisan skills',
		check: async user => {
			const xpGains = await getXPGainsInBingo(user, [
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
		category: 'Skilling',
		description: 'Gain 1 million XP in Gathering skills',
		check: async user => {
			const xpGains = await getXPGainsInBingo(user, [
				SkillsEnum.Mining,
				SkillsEnum.Fishing,
				SkillsEnum.Woodcutting,
				SkillsEnum.Hunter,
				SkillsEnum.Farming
			]);
			return xpGains > 1_000_000;
		}
	},
	{
		id: 4,
		category: 'PvM',
		description: 'Receive any visage (draconic, skeletal, wyvern, serpentine) as a drop',
		check: async user => {
			return oneOf(user, ['Skeletal visage', 'Wyvern visage', 'Skeletal visage', 'Serpentine visage']);
		}
	},
	{
		id: 5,
		category: 'PvM',
		description: 'Receive any sigil from Corporeal Beast as a drop',
		check: async user => {
			return oneOf(user, ['Spectral sigil', 'Arcane sigil', 'Elysian sigil']);
		}
	},
	{
		id: 6,
		category: 'PvM',
		description: 'Obtain any godsword hilt as a drop',
		check: async user => {
			return oneOf(user, ['Armadyl hilt', 'Bandos hilt', 'Zamorak hilt', 'Saradomin hilt']);
		}
	},
	{
		id: 7,
		category: 'PvM',
		description: 'Obtain any full set of Barrows as drops',
		check: async user => {
			const loot = await getTotalLootInBingo(user);
			for (const set of barrowsTuple) {
				if (set.every(item => loot.has(item))) {
					return true;
				}
			}
			return false;
		}
	},
	{
		id: 8,
		category: 'PvM',
		description: 'Obtain any Wilderness pet as a drop',
		check: async user => {
			return oneOf(user, ["Vet'ion jr.", 'Venenatis spiderling', "Scorpia's offspring", 'Callisto cub']);
		}
	},
	{
		id: 9,
		category: 'PvM',
		description: 'Receive an Onyx or Uncut Onyx as a drop',
		check: async user => {
			return oneOf(user, ['Onyx', 'Uncut onyx']);
		}
	}
];
