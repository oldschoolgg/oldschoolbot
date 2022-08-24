import { calcPercentOfNum, calcWhatPercent } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../../../lib/constants';
import { diariesObject, userhasDiaryTier } from '../../../lib/diaries';
import { countUsersWithItemInCl, prisma } from '../../../lib/settings/prisma';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import {
	mahojiClientSettingsFetch,
	mahojiClientSettingsUpdate,
	mahojiUserSettingsUpdate,
	mUserFetch
} from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: InfernoOptions) {
		const { userID, channelID, diedZuk, diedPreZuk, duration, deathTime, fakeDuration } = data;
		const user = await mUserFetch(userID);
		const score = await getMinigameScore(user.id, 'inferno');

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask!.monster_id === Monsters.TzHaarKet.id &&
			score > 0 &&
			usersTask.currentTask!.quantity_remaining === usersTask.currentTask!.quantity;

		const unusedItems = new Bank();
		const cost = new Bank(data.cost);

		const attempts = user.user.inferno_attempts + 1;
		await mahojiUserSettingsUpdate(user.id, {
			inferno_attempts: {
				increment: attempts
			}
		});

		const percentMadeItThrough = deathTime === null ? 100 : calcWhatPercent(deathTime, fakeDuration);

		const mahojiUser = await mUserFetch(userID);
		let tokkul = Math.ceil(calcPercentOfNum(calcWhatPercent(duration, fakeDuration), 16_440));
		const [hasDiary] = await userhasDiaryTier(mahojiUser, diariesObject.KaramjaDiary.elite);
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
				await prisma.slayerTask.update({
					where: {
						id: usersTask.currentTask!.id
					},
					data: {
						quantity_remaining: 0,
						skipped: true
					}
				});
			}
		}

		if (isOnTask) {
			const points = await calculateSlayerPoints(user.user.slayer_last_task, usersTask.slayerMaster!, user);
			const { newUser } = await mahojiUserSettingsUpdate(user.id, {
				slayer_points: {
					increment: points
				},
				slayer_task_streak: {
					increment: 1
				}
			});

			await prisma.slayerTask.update({
				where: {
					id: usersTask.currentTask!.id
				},
				data: {
					quantity_remaining: 0,
					skipped: deathTime ? true : false
				}
			});

			text += `\n\n**You've completed ${newUser.slayer_task_streak} tasks and received ${points} points; giving you a total of ${newUser.slayer_points}; return to a Slayer master.**`;
		}

		if (unusedItems.length > 0) {
			await user.addItemsToBank({ items: unusedItems, collectionLog: false });

			const currentData = await mahojiClientSettingsFetch({ inferno_cost: true });
			const current = new Bank().add(currentData.inferno_cost as ItemBank);
			const newBank = current.remove(unusedItems);
			await mahojiClientSettingsUpdate({
				inferno_cost: newBank.bank
			});
		}

		if (diedPreZuk) {
			text = `You died ${formatDuration(deathTime!)} into your attempt, before you reached Zuk.`;
			chatText = `You die before you even reach TzKal-Zuk...atleast you tried, I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else if (diedZuk) {
			text = `You died ${formatDuration(deathTime!)} into your attempt, during the Zuk fight.`;
			chatText = `You died to Zuk. Nice try JalYt, for your effort I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else {
			const zukLoot = Monsters.TzKalZuk.kill(1, { onSlayerTask: isOnTask });
			zukLoot.remove('Tokkul', zukLoot.amount('Tokkul'));
			baseBank.add(zukLoot);

			if (baseBank.has('Jal-nib-rek')) {
				this.client.emit(
					Events.ServerNotification,
					`**${user.usernameOrMention}** just received their ${formatOrdinal(
						user.cl.amount('Jal-nib-rek') + 1
					)} Jal-nib-rek pet by killing TzKal-Zuk, on their ${formatOrdinal(
						await getMinigameScore(user.id, 'inferno')
					)} kill!`
				);
			}

			if (baseBank.has('Infernal cape') && user.cl.amount('Infernal cape') === 0) {
				const usersWithInfernalCape = await countUsersWithItemInCl(itemID('Infernal cape'), false);
				this.client.emit(
					Events.ServerNotification,
					`**${user.usernameOrMention}** just received their first Infernal cape on their ${formatOrdinal(
						attempts
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
			['activities', { inferno: { action: 'start' } }, true],
			await chatHeadImage({
				content: chatText,
				head: 'ketKeh'
			}),
			data,
			baseBank
		);
	}
}
