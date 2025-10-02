import { roll } from '@oldschoolgg/rng';
import { calcPercentOfNum, calcWhatPercent, Events, formatDuration, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, itemID, Monsters } from 'oldschooljs';

import chatHeadImage from '@/lib/canvas/chatHeadImage.js';
import { diariesObject, userhasDiaryTier } from '@/lib/diaries.js';
import { DiaryID } from '@/lib/minions/types.js';
import { countUsersWithItemInCl } from '@/lib/rawSql.js';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';
import type { InfernoOptions } from '@/lib/types/minions.js';

export function calculateInfernoItemRefund(percentMadeItThrough: number, cost: Bank) {
	const percSuppliesRefunded = Math.max(0, Math.min(100, 100 - percentMadeItThrough));
	const unusedItems = new Bank();
	for (const [item, qty] of cost.items()) {
		const amount = Math.floor(calcPercentOfNum(percSuppliesRefunded, qty));
		if (amount > 0) {
			unusedItems.add(item.id, amount);
		}
	}
	return { unusedItems, percSuppliesRefunded };
}

export const infernoTask: MinionTask = {
	type: 'Inferno',
	async run(data: InfernoOptions, { handleTripFinish, user }) {
		const { channelID, diedZuk, diedPreZuk, duration, deathTime, fakeDuration, diedEmergedZuk, isEmergedZuk } =
			data;
		const score = await user.fetchMinigameScore('inferno');

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask?.monster_id === Monsters.TzHaarKet.id &&
			score > 0 &&
			usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

		const { inferno_attempts: newInfernoAttempts } = await user.statsUpdate({
			inferno_attempts: {
				increment: 1
			}
		});

		if (isEmergedZuk) {
			await user.update({
				emerged_inferno_attempts: {
					increment: 1
				}
			});
		}

		const percentMadeItThrough = deathTime === null ? 100 : calcWhatPercent(deathTime, fakeDuration);

		const { unusedItems, percSuppliesRefunded } = calculateInfernoItemRefund(
			percentMadeItThrough,
			new Bank(data.cost)
		);

		let tokkul = Math.ceil(calcPercentOfNum(calcWhatPercent(duration, fakeDuration), 16_440));
		const [hasDiary] = await userhasDiaryTier(user, diariesObject.KaramjaDiary.elite);
		if (hasDiary) tokkul *= 2;
		const baseBank = new Bank().add('Tokkul', tokkul);

		let xpStr = await user.addXP({
			skillName: 'ranged',
			amount: calcPercentOfNum(percentMadeItThrough, 80_000),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: 'hitpoints',
			amount: calcPercentOfNum(percentMadeItThrough, 35_000),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: 'magic',
			amount: calcPercentOfNum(percentMadeItThrough, 25_000),
			duration,
			minimal: true
		});
		if (isOnTask) {
			xpStr += await user.addXP({
				skillName: 'slayer',
				amount: deathTime === null ? 125_000 : calcPercentOfNum(percentMadeItThrough, 25_000),
				duration
			});
		}

		// Give inferno KC if didn't die in normal inferno part
		if (!diedZuk && !diedPreZuk) {
			await user.incrementMinigameScore('inferno', 1);
		}

		let text = '';
		let chatText = `You are very impressive for a JalYt. You managed to defeat TzKal-Zuk for the ${formatOrdinal(
			await user.fetchMinigameScore('inferno')
		)} time! Please accept this cape as a token of appreciation.`;

		if (deathTime) {
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
			const newUserStats = await user.statsUpdate({
				slayer_task_streak: {
					increment: 1
				}
			});

			const currentStreak = newUserStats.slayer_task_streak;
			const points = await calculateSlayerPoints(
				currentStreak,
				usersTask.slayerMaster!,
				(await userhasDiaryTier(user, [DiaryID.KourendKebos, 'elite']))[0]
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

			text += `\n\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${secondNewUser.newUser.slayer_points}; return to a Slayer master.**`;
		}

		if (unusedItems.length > 0) {
			await user.addItemsToBank({ items: unusedItems, collectionLog: false });

			const currentData = await ClientSettings.fetch({ inferno_cost: true });
			const current = new Bank(currentData.inferno_cost as ItemBank);
			const newBank = current.remove(unusedItems);
			await ClientSettings.update({
				inferno_cost: newBank.toJSON()
			});
		}

		if (diedPreZuk) {
			text += `You died ${formatDuration(deathTime!)} into your attempt, before you reached Zuk.`;
			chatText = `You die before you even reach TzKal-Zuk...atleast you tried, I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else if (diedZuk) {
			text += `You died ${formatDuration(deathTime!)} into your attempt, during the Zuk fight.`;
			chatText = `You died to Zuk. Nice try JalYt, for your effort I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else if (diedEmergedZuk) {
			text = `You died to TzKal-Zuk after he emerged, ${formatDuration(deathTime!)} into your attempt.`;
			chatText = `You died to TzKal-Zuk. Nice try JalYt, for your effort I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else {
			const zukLoot = Monsters.TzKalZuk.kill(1, { onSlayerTask: isOnTask });
			zukLoot.remove('Tokkul', zukLoot.amount('Tokkul'));
			if (isEmergedZuk) {
				await user.incrementMinigameScore('emerged_inferno', 1);

				zukLoot.add("TzKal-Zuk's skin");
				if (roll(10)) {
					zukLoot.add('Infernal core');
				}
				if (roll(15)) {
					zukLoot.add('Head of TzKal Zuk');
				}
				if (roll(isOnTask ? 75 : 100)) {
					zukLoot.add('Jal-MejJak');
				}
			}
			baseBank.add(zukLoot);

			if (baseBank.has('Jal-MejJak')) {
				globalClient.emit(
					Events.ServerNotification,
					`**${user.usernameOrMention}** just received their ${formatOrdinal(
						user.cl.amount('Jal-MejJak') + 1
					)} Jal-MejJak pet by killing TzKal-Zuk's final form, on their ${formatOrdinal(
						await user.fetchMinigameScore('emerged_inferno')
					)} kill!`
				);
			}

			const { cl } = user;

			if (baseBank.has('Infernal cape') && cl.amount('Infernal cape') === 0) {
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

			const emergedKC = await user.fetchMinigameScore('emerged_inferno');
			// If first successfull emerged zuk kill
			if (baseBank.has('Infernal cape') && isEmergedZuk && !diedEmergedZuk && emergedKC === 1) {
				const usersDefeatedEmergedZuk = Number.parseInt(
					(
						await prisma.$queryRawUnsafe<any>(
							`SELECT COUNT(user_id)
							 FROM minigames
						     WHERE "emerged_inferno" > 0;`
						)
					)[0].count
				);
				globalClient.emit(
					Events.ServerNotification,
					`**${user.usernameOrMention}** just defeated the Emerged Zuk Inferno on their ${formatOrdinal(
						user.user.emerged_inferno_attempts
					)} attempt! They are the ${formatOrdinal(
						usersDefeatedEmergedZuk
					)} person to defeat the Emerged Inferno.`
				);
			}
		}

		await user.addItemsToBank({ items: baseBank, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			`${user} ${text}

**Loot:** ${baseBank}
**XP:** ${xpStr}
You made it through ${percentMadeItThrough.toFixed(2)}% of the Inferno${
				unusedItems.length
					? `, you didn't use ${percSuppliesRefunded.toFixed(
							2
						)}% of your supplies, ${unusedItems} was returned to your bank`
					: '.'
			}
`,
			await chatHeadImage({
				content: chatText,
				head: 'ketKeh'
			}),
			data,
			baseBank
		);
	}
};
