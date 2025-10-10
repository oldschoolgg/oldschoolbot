import { chunk } from "remeda";

import { getUsernameSync } from "@/lib/util.js";
import { doMenu } from "@/mahoji/commands/leaderboard.js";

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

	return doMenu(
		interaction,
		chunk(results, 10).map(subList =>
			subList
				.map(({ id, item_contract_streak }) => `**${getUsernameSync(id)}:** ${item_contract_streak}`)
				.join('\n')
		),
		'Item Contract Streak Leaderboard'
	);
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
				id: s.user_id,
				total_donations
			};
		})
		.filter(d => d.total_donations > 0);

	return doMenu(
		interaction,
		chunk(donations.sort((a, b) => b.total_donations - a.total_donations).slice(0, 10), 10).map(subList =>
			subList
				.map(
					({ id, total_donations }) =>
						`**${getUsernameSync(id)}:** ${total_donations.toLocaleString()} donations`
				)
				.join('\n')
		),
		`${total === true ? 'Total' : 'Unique'} IC Donations Leaderboard`
	);
}
