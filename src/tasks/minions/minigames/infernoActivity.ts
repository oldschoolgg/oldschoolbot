import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { calcPercentOfNum, calcWhatPercent } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Events } from '../../../lib/constants';
import { diariesObject, userhasDiaryTier } from '../../../lib/diaries';
import { DiaryID } from '../../../lib/minions/types';
import { countUsersWithItemInCl } from '../../../lib/settings/prisma';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import type { InfernoOptions } from '../../../lib/types/minions';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../../lib/util/clientSettings';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

export const infernoTask: MinionTask = {
	type: 'Inferno',
	async run(data: InfernoOptions) {
		const { userID, channelID, diedZuk, diedPreZuk, duration, deathTime, fakeDuration } = data;
		const user = await mUserFetch(userID);
		const score = await getMinigameScore(user.id, 'inferno');

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask?.monster_id === Monsters.TzHaarKet.id &&
			score > 0 &&
			usersTask.currentTask?.quantity_remaining === usersTask.currentTask?.quantity;

		const unusedItems = new Bank();
		const cost = new Bank(data.cost);

		const { inferno_attempts: newInfernoAttempts } = await userStatsUpdate(
			user.id,
			{
				inferno_attempts: {
					increment: 1
				}
			},
			{ inferno_attempts: true }
		);

		const percentMadeItThrough = deathTime === null ? 100 : calcWhatPercent(deathTime, fakeDuration);

		let tokkul = Math.ceil(calcPercentOfNum(calcWhatPercent(duration, fakeDuration), 16_440));
		const [hasDiary] = await userhasDiaryTier(user, diariesObject.KaramjaDiary.elite);
		if (hasDiary) tokkul *= 2;
		const baseBank = new Bank().add('Tokkul', tokkul);
		const xpBonuses = [];

		xpBonuses.push(
			await user.addXP({
				skillName: SkillsEnum.Ranged,
				amount: calcPercentOfNum(percentMadeItThrough, 80_000),
				duration,
				minimal: true
			})
		);
		xpBonuses.push(
			await user.addXP({
				skillName: SkillsEnum.Hitpoints,
				amount: calcPercentOfNum(percentMadeItThrough, 35_000),
				duration,
				minimal: true
			})
		);
		xpBonuses.push(
			await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: calcPercentOfNum(percentMadeItThrough, 25_000),
				duration,
				minimal: true
			})
		);
		if (isOnTask) {
			xpBonuses.push(
				await user.addXP({
					skillName: SkillsEnum.Slayer,
					amount: deathTime === null ? 125_000 : calcPercentOfNum(percentMadeItThrough, 25_000),
					duration
				})
			);
		}

		const xpStr = xpBonuses.join(', ');
		if (!deathTime) {
			await incrementMinigameScore(userID, 'inferno', 1);
		}

		let text = '';
		let chatText = `You are very impressive for a JalYt. You managed to defeat TzKal-Zuk for the ${formatOrdinal(
			await getMinigameScore(user.id, 'inferno')
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
			chatText = `You die before you even reach TzKal-Zuk... At least you tried, I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else if (diedZuk) {
			text += `You died ${formatDuration(deathTime!)} into your attempt, during the Zuk fight.`;
			chatText = `You died to Zuk. Nice try JalYt, for your effort I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else {
			const zukLoot = Monsters.TzKalZuk.kill(1, { onSlayerTask: isOnTask });
			zukLoot.remove('Tokkul', zukLoot.amount('Tokkul'));
			baseBank.add(zukLoot);

			if (baseBank.has('Jal-nib-rek')) {
				globalClient.emit(
					Events.ServerNotification,
					`**${user.badgedUsername}** just received their ${formatOrdinal(
						user.cl.amount('Jal-nib-rek') + 1
					)} Jal-nib-rek pet by killing TzKal-Zuk, on their ${formatOrdinal(
						await getMinigameScore(user.id, 'inferno')
					)} kill!`
				);
			}

			if (baseBank.has('Infernal cape') && user.cl.amount('Infernal cape') === 0) {
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
