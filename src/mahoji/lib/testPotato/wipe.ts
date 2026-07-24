import { Time } from '@oldschoolgg/toolkit';

export async function handleTestPotatoWipe(user: MUser, thing: string) {
	if (thing === 'birdhouses') {
		await user.updateBirdhouseData({
			lastPlaced: null,
			birdhousePlaced: false,
			birdhouseTime: 0
		});
		return 'Reset your birdhouses.';
	}
	if (thing === 'giveaways') {
		await prisma.giveaway.deleteMany({
			where: {
				user_id: user.id
			}
		});
		return 'Wiped all your giveaways (no refunds given).';
	}
	if (thing === 'cooldowns') {
		await user.update({
			gambling_lockout_expiry: null
		});
		await prisma.userStats.upsert({
			where: {
				user_id: BigInt(user.id)
			},
			update: {
				last_daily_timestamp: Date.now() - Time.Day,
				last_tears_of_guthix_timestamp: Date.now() - Time.Day * 2
			},
			create: {
				user_id: BigInt(user.id)
			}
		});
		return 'Reset all your daily/TOG cooldowns, gambling lockout.';
	}
	if (thing === 'kc') {
		await user.statsUpdate({
			monster_scores: {}
		});
		return 'Reset all your KCs.';
	}
	if (thing === 'buypayout') {
		await prisma.botItemSell.deleteMany({
			where: {
				user_id: user.id
			}
		});
		return 'Deleted all your buy payout records, so you have no tax rate accumulated.';
	}
	if (thing === 'bank') {
		await user.update({
			// @ts-expect-error
			bank: {}
		});
		return 'Reset your bank.';
	}
	if (thing === 'cl') {
		await user.update({
			// @ts-expect-error
			collectionLogBank: {},
			temp_cl: {}
		});
		await prisma.userStats.update({
			where: {
				user_id: BigInt(user.id)
			},
			data: {
				cl_array: [],
				cl_array_length: 0
			}
		});
		return 'Reset your collection log.';
	}
	if (thing === 'combat_achievements') {
		await user.update({
			completed_ca_task_ids: []
		});
		return 'Reset your combat achievements.';
	}
	if (thing === 'quests') {
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				finished_quest_ids: [],
				collectionLogBank: {}
			}
		});
		return `Your QP, and completed quests, have been reset. You can set your QP to a certain number using ${globalClient.mentionCommand(
			'testpotato',
			'set'
		)}.`;
	}
	return 'Invalid thing to reset.';
}
