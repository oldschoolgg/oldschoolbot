import { calcPercentOfNum, calcWhatPercent, Events, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, EMonster, type ItemBank, itemID, Monsters } from 'oldschooljs';

import chatHeadImage from '@/lib/canvas/chatHeadImage.js';
import { countUsersWithItemInCl } from '@/lib/rawSql.js';
import { calculateSlayerPoints } from '@/lib/slayer/slayerUtil.js';
import type { InfernoOptions } from '@/lib/types/minions.js';

export const infernoTask: MinionTask = {
	type: 'Inferno',
	async run(data: InfernoOptions, { user, handleTripFinish }) {
		const { channelId, diedZuk, diedPreZuk, duration, deathTime, fakeDuration } = data;

		const score = await user.fetchMinigameScore('inferno');

		const usersTask = await user.fetchSlayerInfo();
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask?.monster_id === EMonster.TZHAARKET &&
			score > 0 &&
			usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

		const unusedItems = new Bank();
		const cost = new Bank(data.cost);

		await user.statsUpdate({
			inferno_attempts: {
				increment: 1
			}
		});
		const newInfernoAttempts = await user.fetchUserStat('inferno_attempts');

		const percentMadeItThrough = deathTime === null ? 100 : calcWhatPercent(deathTime, fakeDuration);

		let tokkul = Math.ceil(calcPercentOfNum(calcWhatPercent(duration, fakeDuration), 16_440));
		const hasDiary = user.hasDiary('karamja.elite');
		if (hasDiary) tokkul *= 2;
		const loot = new Bank().add('Tokkul', tokkul);
		const xpBonuses = [];

		xpBonuses.push(
			await user.addXP({
				skillName: 'ranged',
				amount: calcPercentOfNum(percentMadeItThrough, 80_000),
				duration,
				minimal: true
			})
		);
		xpBonuses.push(
			await user.addXP({
				skillName: 'hitpoints',
				amount: calcPercentOfNum(percentMadeItThrough, 35_000),
				duration,
				minimal: true
			})
		);
		xpBonuses.push(
			await user.addXP({
				skillName: 'magic',
				amount: calcPercentOfNum(percentMadeItThrough, 25_000),
				duration,
				minimal: true
			})
		);
		if (isOnTask) {
			xpBonuses.push(
				await user.addXP({
					skillName: 'slayer',
					amount: deathTime === null ? 125_000 : calcPercentOfNum(percentMadeItThrough, 25_000),
					duration
				})
			);
		}

		const xpStr = xpBonuses.join(', ');
		if (!deathTime) {
			await user.incrementMinigameScore('inferno', 1);
		}

		let text = '';
		let chatText = `You are very impressive for a JalYt. You managed to defeat TzKal-Zuk for the ${formatOrdinal(
			await user.fetchMinigameScore('inferno')
		)} time! Please accept this cape as a token of appreciation.`;

		const percSuppliesRefunded = Math.max(0, Math.min(100, 100 - percentMadeItThrough));

		if (deathTime) {
			for (const [item, qty] of cost.items()) {
				const amount = Math.floor(calcPercentOfNum(percSuppliesRefunded, qty));
				if (amount > 0) {
					unusedItems.add(item.id, amount);
				}
			}
			if (isOnTask) {
				text += '**Slayer task cancelled.**\n';

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
		}

		if (isOnTask && !deathTime) {
			await user.statsUpdate({
				slayer_task_streak: {
					increment: 1
				}
			});
			const currentStreak = await user.fetchUserStat('slayer_task_streak');

			const points: number = calculateSlayerPoints(
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
					quantity_remaining: 0,
					skipped: false
				}
			});

			text += `\n\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${secondNewUser.user.slayer_points}; return to a Slayer master.**`;
		}

		if (unusedItems.length > 0) {
			await user.transactItems({ itemsToAdd: unusedItems, collectionLog: false });

			const currentData = await ClientSettings.fetch({ inferno_cost: true });
			const current = new Bank(currentData.inferno_cost as ItemBank);
			const newBank = current.remove(unusedItems);
			await ClientSettings.update({
				inferno_cost: newBank.toJSON()
			});
		}

		if (diedPreZuk) {
			text += `You died ${formatDuration(deathTime!)} into your attempt, before you reached Zuk.`;
			chatText = `You die before you even reach TzKal-Zuk... At least you tried, I give you ${loot.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else if (diedZuk) {
			text += `You died ${formatDuration(deathTime!)} into your attempt, during the Zuk fight.`;
			chatText = `You died to Zuk. Nice try JalYt, for your effort I give you ${loot.amount('Tokkul')}x Tokkul.`;
		} else {
			const zukLoot = Monsters.TzKalZuk.kill(1, { onSlayerTask: isOnTask });
			zukLoot.remove('Tokkul', zukLoot.amount('Tokkul'));
			loot.add(zukLoot);

			if (loot.has('Jal-nib-rek')) {
				globalClient.emit(
					Events.ServerNotification,
					`**${user.badgedUsername}** just received their ${formatOrdinal(
						user.cl.amount('Jal-nib-rek') + 1
					)} Jal-nib-rek pet by killing TzKal-Zuk, on their ${formatOrdinal(
						await user.fetchMinigameScore('inferno')
					)} kill!`
				);
			}

			if (loot.has('Infernal cape') && user.cl.amount('Infernal cape') === 0) {
				const usersWithInfernalCape = await countUsersWithItemInCl(itemID('Infernal cape'), false);
				globalClient.emit(
					Events.ServerNotification,
					`**${user.badgedUsername}** just received their first Infernal cape on their ${formatOrdinal(
						newInfernoAttempts
					)} attempt! They are the ${formatOrdinal(
						usersWithInfernalCape + 1
					)} person to get an Infernal cape.`
				);
			}
		}

		await user.transactItems({ itemsToAdd: loot, collectionLog: true });

		const message = {
			content: `${user} ${text}

**Loot:** ${loot}
**XP:** ${xpStr}
You made it through ${percentMadeItThrough.toFixed(2)}% of the Inferno${unusedItems.length
					? `, you didn't use ${percSuppliesRefunded.toFixed(
						2
					)}% of your supplies, ${unusedItems} was returned to your bank`
					: '.'
				}
`,
			files: [
				await chatHeadImage({
					content: chatText,
					head: 'ketKeh'
				})
			]
		};
		return handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot
		});
	}
};
