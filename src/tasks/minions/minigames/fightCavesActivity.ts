import { calcPercentOfNum, calcWhatPercent, Emoji, Events, formatDuration, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, itemID, Monsters } from 'oldschooljs';

import { calculateSlayerPoints } from '@/lib/slayer/slayerUtil.js';
import type { FightCavesActivityTaskOptions } from '@/lib/types/minions.js';
import { fightCavesCost } from '@/mahoji/lib/abstracted_commands/fightCavesCommand.js';

const TokkulID = itemID('Tokkul');

export const fightCavesTask: MinionTask = {
	type: 'FightCaves',
	async run(data: FightCavesActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, jadDeathChance, preJadDeathTime, duration, fakeDuration } = data;

		const tokkulReward = rng.randInt(2000, 6000);
		const diedToJad = rng.percentChance(jadDeathChance);

		await user.statsUpdate({
			fight_caves_attempts: {
				increment: 1
			}
		});
		const newFightCavesAttempts = await user.fetchUserStat('fight_caves_attempts');

		const attemptsStr = `You have tried Fight caves ${newFightCavesAttempts}x times`;

		// Add slayer
		const usersTask = await user.fetchSlayerInfo();
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask?.monster_id === Monsters.TzHaarKet.id &&
			usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

		if (preJadDeathTime) {
			let slayerMsg = '';
			if (isOnTask) {
				slayerMsg = ' **Task cancelled.**';

				await prisma.slayerTask.update({
					where: {
						id: usersTask.currentTask?.id
					},
					data: {
						quantity_remaining: 0,
						skipped: true
					}
				});
			}
			// Give back supplies based on how far in they died, for example if they
			// died 80% of the way through, give back approximately 20% of their supplies.
			const percSuppliesToRefund = 100 - calcWhatPercent(preJadDeathTime, fakeDuration);
			const itemLootBank = new Bank();

			for (const [item, qty] of fightCavesCost.items()) {
				const amount = Math.floor(calcPercentOfNum(percSuppliesToRefund, qty));
				if (amount > 0) {
					itemLootBank.add(item.id, amount);
				}
			}

			await user.transactItems({ itemsToAdd: itemLootBank, collectionLog: false });

			return handleTripFinish({
				user,
				channelId,
				message: new MessageBuilder()
					.setContent(
						`${user} You died ${formatDuration(
							preJadDeathTime
						)} into your attempt.${slayerMsg} The following supplies were refunded back into your bank: ${itemLootBank}.`
					)
					.addChatHeadImage(
						'mejJal',
						`You die before you even reach TzTok-Jad... At least you tried, I give you ${tokkulReward}x Tokkul. ${attemptsStr}.`
					),
				data,
				loot: itemLootBank
			});
		}

		if (diedToJad) {
			const failBank = new Bank({ [TokkulID]: tokkulReward });
			await user.transactItems({ collectionLog: true, itemsToAdd: failBank });

			const rangeXP = await user.addXP({ skillName: 'ranged', amount: 46_080, duration });
			const hpXP = await user.addXP({ skillName: 'hitpoints', amount: 15_322, duration });

			let msg = `${rangeXP}. ${hpXP}.`;
			if (isOnTask) {
				const slayXP = await user.addXP({ skillName: 'slayer', amount: 11_760, duration });
				msg = `**Slayer task cancelled.** \n${msg} ${slayXP}.`;

				await prisma.slayerTask.update({
					where: {
						id: usersTask.currentTask?.id
					},
					data: {
						quantity_remaining: 0,
						skipped: true
					}
				});
			}

			return handleTripFinish({
				user,
				channelId,
				message: new MessageBuilder()
					.setContent(`${user} ${msg}`)
					.addChatHeadImage(
						'mejJal',
						`TzTok-Jad stomp you to death... Nice try though JalYt, for your effort I give you ${tokkulReward}x Tokkul. ${attemptsStr}.`
					),
				data,
				loot: failBank
			});
		}

		const { newKC } = await user.incrementKC(Monsters.TzTokJad.id, 1);
		const loot = Monsters.TzTokJad.kill(1, { onSlayerTask: isOnTask });

		if (loot.has('Tzrek-jad')) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}** just received their ${formatOrdinal(user.cl.amount('Tzrek-jad') + 1)} ${
					Emoji.TzRekJad
				} TzRek-jad pet by killing TzTok-Jad, on their ${formatOrdinal(newKC)} kill!`
			);
		}

		if (user.cl.amount('Fire cape') === 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}** just received their first Fire cape on their ${formatOrdinal(
					newFightCavesAttempts
				)} attempt!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const rangeXP = await user.addXP({ skillName: 'ranged', amount: 47_580, duration, minimal: true });
		const hpXP = await user.addXP({ skillName: 'hitpoints', amount: 15_860, duration, minimal: true });

		let msg = `${rangeXP}. ${hpXP}.`;
		if (isOnTask) {
			await user.statsUpdate({
				slayer_task_streak: {
					increment: 1
				}
			});
			const currentStreak = await user.fetchUserStat('slayer_task_streak');

			// 25,250 for Jad + 11,760 for waves.
			const slayerXP = 37_010;
			const points = await calculateSlayerPoints(
				currentStreak,
				usersTask.slayerMaster!,
				user.hasDiary('kourend&kebos.elite')
			);

			const secondNewUser = await user.update({
				slayer_points: {
					increment: points
				}
			});

			await prisma.slayerTask.update({
				where: {
					id: usersTask.currentTask?.id
				},
				data: {
					quantity_remaining: 0
				}
			});

			const slayXP = await user.addXP({
				skillName: 'slayer',
				amount: slayerXP,
				duration,
				minimal: true
			});

			const xpMessage = `${msg} ${slayXP}`;

			msg = `Jad task completed. ${xpMessage}. \n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${secondNewUser.user.slayer_points}; return to a Slayer master.**`;
			// End slayer code
		}

		const message = new MessageBuilder()
			.setContent(`${user} ${msg}`)
			.addChatHeadImage(
				'mejJal',
				`You defeated TzTok-Jad for the ${formatOrdinal(
					newKC
				)} time! I am most impressed, I give you... ${loot}.`
			);

		return handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot
		});
	}
};
