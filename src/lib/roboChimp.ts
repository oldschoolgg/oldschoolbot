import { calcWhatPercent, formatOrdinal, PerkTier, round, sumArr } from '@oldschoolgg/toolkit';
import type { Bank } from 'oldschooljs';
import { isDeepEqual } from 'remeda';

import type { TriviaQuestion, User } from '@/prisma/clients/robochimp/client.js';
import { BitField, BOT_TYPE, globalConfig, masteryKey } from '@/lib/constants.js';
import { getTotalCl } from '@/lib/data/Collections.js';
import { calculateMastery } from '@/lib/mastery.js';
import { RobochimpBitfieldEnum } from '@/lib/perkTiers.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';

export type RobochimpUser = User;
type RoboChimpPerkData = Pick<RobochimpUser, 'bits' | 'premium_balance_tier' | 'premium_balance_expiry_date'>;

function bestPremium(users: RoboChimpPerkData[]) {
	const now = Date.now();
	return (
		users
			.filter(user => user.premium_balance_tier && user.premium_balance_expiry_date)
			.filter(user => Number(user.premium_balance_expiry_date) > now)
			.sort(
				(a, b) =>
					(b.premium_balance_tier ?? PerkTier.Zero) - (a.premium_balance_tier ?? PerkTier.Zero) ||
					Number(b.premium_balance_expiry_date) - Number(a.premium_balance_expiry_date)
			)[0] ?? null
	);
}

function mergeRoboChimpPerks(users: RobochimpUser[]): RobochimpUser[] {
	const premium = bestPremium(users);
	const bits = [...new Set(users.flatMap(groupUser => groupUser.bits))];
	return users.map(user => ({
		...user,
		bits,
		premium_balance_tier: premium?.premium_balance_tier ?? null,
		premium_balance_expiry_date: premium?.premium_balance_expiry_date ?? null
	}));
}

export async function loadRoboChimpGroup(user: RobochimpUser): Promise<RobochimpUser[]> {
	const users = user.user_group_id
		? await roboChimpClient.user.findMany({
				where: {
					user_group_id: user.user_group_id
				}
			})
		: [user];
	return mergeRoboChimpPerks(users);
}

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

const clKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_cl_percent' : 'bso_cl_percent';
const levelKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_total_level' : 'bso_total_level';
const totalXPKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_total_xp' : 'bso_total_xp';

export async function syncOriginalCyrSupporterBit(user: MUser, roboChimpUser: RobochimpUser) {
	if (!roboChimpUser.bits.includes(RobochimpBitfieldEnum.CyrsOriginalPatrons)) return;

	if (user.bitfield.includes(BitField.OriginalCyrSupporter)) return;

	await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			bitfield: {
				push: BitField.OriginalCyrSupporter
			}
		}
	});
}
export async function roboChimpSyncData(user: MUser, newCL?: Bank) {
	const id = BigInt(user.id);
	const newCLArray: number[] = (newCL ?? user.cl).itemIDs;
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

	if (!isDeepEqual(newUser.store_bitfield, user.user.store_bitfield)) {
		await user.update({ store_bitfield: newUser.store_bitfield });
	}
	await syncOriginalCyrSupporterBit(user, newUser);
	await Cache.setRoboChimpUser(newUser);
	return newUser;
}

export async function calculateOwnCLRanking(userID: string) {
	const clPercentRank = (
		await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int
FROM public.user
WHERE osb_cl_percent >= (SELECT osb_cl_percent FROM public.user WHERE id = ${BigInt(userID)});`
	)[0].count;

	return formatOrdinal(clPercentRank);
}
