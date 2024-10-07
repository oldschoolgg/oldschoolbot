import { formatOrdinal } from '@oldschoolgg/toolkit';
import { calcPercentOfNum, calcWhatPercent, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import type { ItemBank } from 'oldschooljs/dist/meta/types';
import { Events } from '../../../lib/constants';
import { diariesObject, userhasDiaryTier } from '../../../lib/diaries';
import { DiaryID } from '../../../lib/minions/types';
import { countUsersWithItemInCl } from '../../../lib/settings/prisma';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import type { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../../lib/util/clientSettings';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

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
	async run(data: InfernoOptions) {
		const {
			userID,
			channelID,
			diedZuk,
			diedPreZuk,
			duration,
			deathTime,
			fakeDuration,
			diedEmergedZuk,
			isEmergedZuk
		} = data;
		const user = await mUserFetch(userID);
		const score = await getMinigameScore(user.id, 'inferno');

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask?.monster_id === Monsters.TzHaarKet.id &&
			score > 0 &&
			usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

		const { inferno_attempts: newInfernoAttempts } = await userStatsUpdate(
			user.id,
			{
				inferno_attempts: {
					increment: 1
				}
			},
			{ inferno_attempts: true }
		);

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
			skillName: SkillsEnum.Ranged,
			amount: calcPercentOfNum(percentMadeItThrough, 80_000),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: SkillsEnum.Hitpoints,
			amount: calcPercentOfNum(percentMadeItThrough, 35_000),
			duration,
			minimal: true
		});
		xpStr += await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: calcPercentOfNum(percentMadeItThrough, 25_000),
			duration,
			minimal: true
		});
		if (isOnTask) {
			xpStr += await user.addXP({
				skillName: SkillsEnum.Slayer,
				amount: deathTime === null ? 125_000 : calcPercentOfNum(percentMadeItThrough, 25_000),
				duration
			});
		}

		// Give inferno KC if didn't die in normal inferno part
		if (!diedZuk && !diedPreZuk) {
			await incrementMinigameScore(userID, 'inferno', 1);
		}

		let text = '';
		let chatText = `You are very impressive for a JalYt. You managed to defeat TzKal-Zuk for the ${formatOrdinal(
			await getMinigameScore(user.id, 'inferno')
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
			const newUserStats = await userStatsUpdate(
				user.id,
				{
					slayer_task_streak: {
						increment: 1
					}
				},
				{ slayer_task_streak: true }
			);

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

			const currentData = await mahojiClientSettingsFetch({ inferno_cost: true });
			const current = new Bank(currentData.inferno_cost as ItemBank);
			const newBank = current.remove(unusedItems);
			await mahojiClientSettingsUpdate({
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
				await incrementMinigameScore(userID, 'emerged_inferno', 1);

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
						await getMinigameScore(user.id, 'emerged_inferno')
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

			const emergedKC = await getMinigameScore(user.id, 'emerged_inferno');
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
