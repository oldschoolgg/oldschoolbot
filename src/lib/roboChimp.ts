import { calcWhatPercent, round, sumArr } from 'e';

import { formatOrdinal } from '@oldschoolgg/toolkit';
import { getTotalCl } from './data/Collections';
import { calculateMastery } from './mastery';
import { MUserStats } from './structures/MUserStats';

export async function roboChimpSyncData(user: MUser) {
	const stats = await MUserStats.fromID(user.id);
	const [totalClItems, clItems] = await getTotalCl(user, 'collection', stats);
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));

	const { totalMastery } = await calculateMastery(user, stats);

	const newUser = await user.update({
		cl_percent: clCompletionPercentage,
		total_level: user.totalLevel,
		total_xp: totalXP,
		mastery: totalMastery
	});

	const newCLArray = Object.keys(user.cl.bank).map(str => Number(str));
	await prisma.userStats.upsert({
		where: {
			user_id: BigInt(user.id)
		},
		update: {
			cl_array: newCLArray
		},
		create: {
			user_id: BigInt(user.id),
			cl_array: newCLArray
		}
	});

	return newUser;
}

export async function calculateOwnCLRanking(userID: string) {
	const clPercentRank = (
		await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int
FROM public.users
WHERE cl_percent >= (SELECT cl_percent FROM public.user WHERE id = ${BigInt(userID)});`
	)[0].count;

	return formatOrdinal(clPercentRank);
}
