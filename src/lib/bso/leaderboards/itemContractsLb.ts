import { doMenuWrapper } from '@/lib/menuWrapper.js';

export async function bsoItemContractLb(interaction: MInteraction, ironmanOnly?: boolean) {
	const results = await prisma.user.findMany({
		select: {
			id: true,
			item_contract_streak: true
		},
		where: {
			item_contract_streak: {
				gte: 5
			},
			minion_ironman: ironmanOnly ? true : undefined
		},
		orderBy: {
			item_contract_streak: 'desc'
		},
		take: 10
	});

	return doMenuWrapper({
		interaction,
		users: results.map(({ id, item_contract_streak }) => ({ id, score: item_contract_streak })),
		title: ironmanOnly ? 'Ironman Item Contract Streak Leaderboard' : 'Item Contract Streak Leaderboard',
		ironmanOnly: Boolean(ironmanOnly)
	});
}

export async function bsoItemContractDonationGivenLb(interaction: MInteraction, total: boolean) {
	const stats = await prisma.userStats.findMany({
		where: { NOT: { ic_donations_given_bank: {} } },
		select: {
			user_id: true,
			ic_donations_given_bank: true
		}
	});

	const donations = stats
		.map(s => {
			const donation_bank = s.ic_donations_given_bank as Record<string, number>;
			const total_donations = total
				? Object.values(donation_bank).reduce((acc, qty) => acc + qty, 0)
				: Object.keys(donation_bank).length;

			return {
				id: s.user_id.toString(),
				total_donations
			};
		})
		.filter(d => d.total_donations > 0);

	return doMenuWrapper({
		interaction,
		users: donations
			.sort((a, b) => b.total_donations - a.total_donations)
			.slice(0, 10)
			.map(({ id, total_donations }) => ({ id, score: total_donations })),
		title: `${total === true ? 'Total' : 'Unique'} IC Donations Leaderboard`,
		ironmanOnly: false
	});
}
