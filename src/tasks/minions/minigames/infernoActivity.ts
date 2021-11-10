import { calcPercentOfNum, calcWhatPercent, roll } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { diariesObject, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

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

export default class extends Task {
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
		const user = await this.client.users.fetch(userID);
		const score = await user.getMinigameScore('Inferno');

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask!.monsterID === Monsters.TzHaarKet.id &&
			score > 0 &&
			usersTask.currentTask!.quantityRemaining === usersTask.currentTask!.quantity;

		const oldAttempts = user.settings.get(UserSettings.InfernoAttempts);
		const attempts = oldAttempts + 1;
		await user.settings.update(UserSettings.InfernoAttempts, attempts);
		if (isEmergedZuk) {
			await user.settings.update(
				UserSettings.EmergedInfernoAttempts,
				user.settings.get(UserSettings.EmergedInfernoAttempts) + 1
			);
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
			await incrementMinigameScore(userID, 'Inferno', 1);
		}

		let text = '';
		let chatText = `You are very impressive for a JalYt. You managed to defeat TzKal-Zuk for the ${formatOrdinal(
			await user.getMinigameScore('Inferno')
		)} time! Please accept this cape as a token of appreciation.`;

		if (deathTime) {
			if (isOnTask) {
				usersTask.currentTask!.quantityRemaining = 0;
				usersTask.currentTask!.skipped = true;
				await usersTask.currentTask!.save();
			}
		}

		if (isOnTask) {
			const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
			user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
			const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
			const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
			await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);

			usersTask.currentTask!.quantityRemaining = 0;
			if (deathTime) {
				usersTask.currentTask!.skipped = true;
			}
			await usersTask.currentTask!.save();

			text += `\n\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.**`;
		}

		if (unusedItems.length > 0) {
			await user.addItemsToBank(unusedItems, false);

			const current = new Bank(this.client.settings.get(ClientSettings.EconomyStats.InfernoCost));
			const newBank = current.remove(unusedItems);
			await this.client.settings.update(ClientSettings.EconomyStats.InfernoCost, newBank.bank);
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
		} else if (diedEmergedZuk) {
			text = `You died to TzKal-Zuk after he emerged, ${formatDuration(deathTime!)} into your attempt.`;
			chatText = `You died to TzKal-Zuk. Nice try JalYt, for your effort I give you ${baseBank.amount(
				'Tokkul'
			)}x Tokkul.`;
		} else {
			const zukLoot = Monsters.TzKalZuk.kill(1, { onSlayerTask: isOnTask });
			zukLoot.remove('Tokkul', zukLoot.amount('Tokkul'));
			if (isEmergedZuk) {
				await incrementMinigameScore(userID, 'EmergedInferno', 1);

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

			if (baseBank.has('Jal-nib-rek')) {
				this.client.emit(
					Events.ServerNotification,
					`**${user.username}** just received their ${formatOrdinal(
						user.cl().amount('Jal-nib-rek') + 1
					)} Jal-nib-rek pet by killing TzKal-Zuk, on their ${formatOrdinal(
						await user.getMinigameScore('Inferno')
					)} kill!`
				);
			}
			if (baseBank.has('Jal-MejJak')) {
				this.client.emit(
					Events.ServerNotification,
					`**${user.username}** just received their ${formatOrdinal(
						user.cl().amount('Jal-MejJak') + 1
					)} Jal-MejJak pet by killing TzKal-Zuk's final form, on their ${formatOrdinal(
						await user.getMinigameScore('EmergedInferno')
					)} kill!`
				);
			}

			const cl = user.cl();

			if (baseBank.has('Infernal cape') && cl.amount('Infernal cape') === 0) {
				const usersWithInfernalCape = parseInt(
					(
						await this.client.query<any>(
							`SELECT count(id) FROM users WHERE "collectionLogBank"->>'${itemID(
								'Infernal cape'
							)}' IS NOT NULL;`
						)
					)[0].count
				);
				this.client.emit(
					Events.ServerNotification,
					`**${user.username}** just received their first Infernal cape on their ${formatOrdinal(
						attempts
					)} attempt! They are the ${formatOrdinal(usersWithInfernalCape)} person to get an Infernal cape.`
				);
			}

			const emergedKC = await user.getMinigameScore('EmergedInferno');
			// If first successfull emerged zuk kill
			if (baseBank.has('Infernal cape') && isEmergedZuk && !diedEmergedZuk && emergedKC === 1) {
				const usersDefeatedEmergedZuk = parseInt(
					(
						await this.client.query<any>(
							`SELECT COUNT(user_id)
							 FROM minigames
						     WHERE "emerged_inferno" > 0;`
						)
					)[0].count
				);
				this.client.emit(
					Events.ServerNotification,
					`**${user.username}** just defeated the Emerged Zuk Inferno on their ${formatOrdinal(
						user.settings.get(UserSettings.EmergedInfernoAttempts)
					)} attempt! They are the ${formatOrdinal(
						usersDefeatedEmergedZuk
					)} person to defeat the Emerged Inferno.`
				);
			}
		}

		await user.addItemsToBank(baseBank, true);

		handleTripFinish(
			this.client,
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
			res => {
				user.log('continued trip of inferno');
				return (this.client.commands.get('inferno') as any).start(res, isEmergedZuk ? ['emerged'] : []);
			},
			await chatHeadImage({
				content: chatText,
				head: 'ketKeh'
			}),
			data,
			baseBank.bank
		);
	}
}
