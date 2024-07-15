import { PerkTier, formatOrdinal } from '@oldschoolgg/toolkit';
import type { TriviaQuestion, User } from '@prisma/robochimp';
import { calcWhatPercent, round, sumArr } from 'e';
import deepEqual from 'fast-deep-equal';

import { pick } from 'lodash';
import type { Bank } from 'oldschooljs';
import { SupportServer } from '../config';
import { BOT_TYPE, BitField, Roles, globalConfig, masteryKey } from './constants';
import { getTotalCl } from './data/Collections';
import { calculateMastery } from './mastery';
import { MUserStats } from './structures/MUserStats';

export type RobochimpUser = User;

export async function getRandomTriviaQuestions(): Promise<TriviaQuestion[]> {
	if (!globalConfig.isProduction) {
		return [
			{
				id: 1,
				question: 'What is 1+1?',
				answers: ['2']
			},
			{
				id: 2,
				question: 'What is 2+2?',
				answers: ['4']
			}
		];
	}
	const random: TriviaQuestion[] = await roboChimpClient.$queryRaw`SELECT id, question, answers
FROM trivia_question
ORDER BY random()
LIMIT 10;`;
	return random;
}

const clKey: keyof User = 'osb_cl_percent';
const levelKey: keyof User = 'osb_total_level';
const totalXPKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_total_xp' : 'bso_total_xp';

export async function roboChimpSyncData(user: MUser, newCL?: Bank) {
	const id = BigInt(user.id);
	const newCLArray: number[] = Object.keys((newCL ?? user.cl).bank).map(i => Number(i));
	const clArrayUpdateObject = {
		cl_array: newCLArray,
		cl_array_length: newCLArray.length
	} as const;

	const stats = new MUserStats(
		await prisma.userStats.upsert({
			where: {
				user_id: id
			},
			create: {
				user_id: id,
				...clArrayUpdateObject
			},
			update: {
				...clArrayUpdateObject
			}
		})
	);

	const [totalClItems, clItems] = getTotalCl(user, 'collection', stats);
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));

	const { totalMastery } = await calculateMastery(user, stats);

	const updateObj = {
		[clKey]: clCompletionPercentage,
		[levelKey]: user.totalLevel,
		[totalXPKey]: totalXP,
		[masteryKey]: totalMastery
	} as const;

	const newUser: RobochimpUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(user.id)
		},
		update: updateObj,
		create: {
			id: BigInt(user.id),
			...updateObj
		}
	});
	cacheRoboChimpUser(newUser);

	if (!deepEqual(newUser.store_bitfield, user.user.store_bitfield)) {
		await user.update({ store_bitfield: newUser.store_bitfield });
	}
	return newUser;
}

export async function roboChimpUserFetch(userID: string): Promise<RobochimpUser> {
	const result: RobochimpUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userID)
		},
		create: {
			id: BigInt(userID)
		},
		update: {}
	});

	cacheRoboChimpUser(result);

	return result;
}

export async function calculateOwnCLRanking(userID: string) {
	const clPercentRank = (
		await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int
FROM public.user
WHERE osb_cl_percent >= (SELECT osb_cl_percent FROM public.user WHERE id = ${BigInt(userID)});`
	)[0].count;

	return formatOrdinal(clPercentRank);
}

const robochimpCachedKeys = [
	'bits',
	'github_id',
	'patreon_id',
	'perk_tier',
	'main_account',
	'ironman_alts',
	'premium_balance_expiry_date',
	'premium_balance_tier'
] as const;
type CachedRoboChimpUser = Pick<User, (typeof robochimpCachedKeys)[number]>;

export const roboChimpCache = new Map<string, CachedRoboChimpUser>();

export async function populateRoboChimpCache() {
	const users = await roboChimpClient.user.findMany({
		select: {
			id: true,
			bits: true,
			github_id: true,
			patreon_id: true,
			perk_tier: true,
			main_account: true,
			ironman_alts: true,
			premium_balance_expiry_date: true,
			premium_balance_tier: true
		},
		where: {
			perk_tier: {
				not: 0
			}
		}
	});
	for (const user of users) {
		roboChimpCache.set(user.id.toString(), user);
	}
	debugLog(`Populated RoboChimp cache with ${users.length} users.`);
}

function cacheRoboChimpUser(user: RobochimpUser) {
	if (user.perk_tier === 0) return;
	roboChimpCache.set(user.id.toString(), pick(user, robochimpCachedKeys));
}

export function getPerkTierSync(user: string | MUser) {
	const elligibleTiers = [];
	if (typeof user !== 'string') {
		if (
			[BitField.isContributor, BitField.isModerator, BitField.IsWikiContributor].some(bit =>
				user.bitfield.includes(bit)
			)
		) {
			return PerkTier.Four;
		}

		if (
			user.bitfield.includes(BitField.IsPatronTier1) ||
			user.bitfield.includes(BitField.HasPermanentTierOne) ||
			user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
		) {
			elligibleTiers.push(PerkTier.Two);
		} else {
			const guild = globalClient.guilds.cache.get(SupportServer);
			const member = guild?.members.cache.get(user.id);
			if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
				elligibleTiers.push(PerkTier.One);
			}
		}
	}

	elligibleTiers.push(roboChimpCache.get(typeof user === 'string' ? user : user.id)?.perk_tier ?? 0);
	return Math.max(...elligibleTiers);
}
