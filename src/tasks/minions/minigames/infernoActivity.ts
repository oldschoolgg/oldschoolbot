import { calcPercentOfNum, calcWhatPercent } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { TzKalZuk } from 'oldschooljs/dist/simulation/monsters/special/TzKalZuk';

import { Emoji, Events } from '../../../lib/constants';
import { diariesObject, userhasDiaryTier } from '../../../lib/diaries';
import fightCavesSupplies from '../../../lib/minions/data/fightCavesSupplies';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: InfernoOptions) {
		const { userID, channelID, preZukDeathChance, diedZuk, diedPreZuk, duration, deathTime, fakeDuration } = data;
		const user = await this.client.users.fetch(userID);

		const oldAttempts = user.settings.get(UserSettings.InfernoAttempts);
		const attempts = oldAttempts + 1;
		await user.settings.update(UserSettings.InfernoAttempts, attempts);

		const attemptsStr = `You have attempted the Inferno ${attempts}x times.`;

		let tokkul = Math.ceil(calcPercentOfNum(calcWhatPercent(duration, fakeDuration), 16_440));
		const [hasDiary] = await userhasDiaryTier(user, diariesObject.KaramjaDiary.elite);
		if (hasDiary) tokkul *= 2;
		const baseBank = new Bank().add('Tokkul', tokkul);

		const rangeXP = await user.addXP({ skillName: SkillsEnum.Ranged, amount: 46_080, duration, minimal: true });
		const hpXP = await user.addXP({ skillName: SkillsEnum.Hitpoints, amount: 15_322, duration, minimal: true });

		/**
		 *
		 * If died before Zuk
		 *
		 */
		if (diedPreZuk) {
			const percSuppliesToRefund = 100 - calcWhatPercent(preZukDeathChance, duration);
			for (const [itemID, qty] of Object.entries(fightCavesSupplies)) {
				const amount = Math.floor(calcPercentOfNum(percSuppliesToRefund, qty));
				if (amount > 0) {
					baseBank.add(parseInt(itemID), amount);
				}
			}

			await user.addItemsToBank(baseBank);

			return handleTripFinish(
				this.client,
				user,
				channelID,
				`${user} You died ${formatDuration(
					deathTime!
				)} into your attempt. The following supplies were refunded back into your bank: ${baseBank}.`,
				res => {
					user.log('continued trip of inferno');
					return this.client.commands.get('inferno')!.run(res, []);
				},
				await chatHeadImage({
					content: `You die before you even reach TzKal-Zuk...atleast you tried, I give you ${baseBank.amount(
						'TOkkul'
					)}x Tokkul. ${attemptsStr}`,
					head: 'mejJal'
				}),
				data,
				baseBank.bank
			);
		}

		/**
		 *
		 * If died to Zuk
		 *
		 */
		if (diedZuk) {
			await user.addItemsToBank(baseBank, true);

			let msg = `${rangeXP}. ${hpXP}.`;

			return handleTripFinish(
				this.client,
				user,
				channelID,
				`${user} ${msg}`,
				res => {
					user.log('continued trip of inferno');
					return (this.client.commands.get('inferno') as any)!.start(res, []);
				},
				await chatHeadImage({
					content: `Nice try JalYt, for your effort I give you ${baseBank.amount(
						'Tokkul'
					)}x Tokkul. ${attemptsStr}.`,
					head: 'mejJal'
				}),
				data,
				baseBank.bank
			);
		}

		await user.incrementMonsterScore(Monsters.TzKalZuk.id);
		const loot = Monsters.TzKalZuk.kill(1, { onSlayerTask: false });

		if (loot.has('Jal-nib-rek')) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received their ${formatOrdinal(user.cl().amount('Jal-nib-rek'))} ${
					Emoji.TzRekJad
				} Jal-nib-rek pet by killing TzKal-Zuk, on their ${formatOrdinal(user.getKC(TzKalZuk.id))} kill!`
			);
		}

		const cl = user.cl();

		if (cl.has('Infernal cape')) {
			const usersWithInfernalCape = parseInt(
				(
					await this.client.query<any>(
						`SELECT count(id) FROM users WHERE "collectionLogBank"->>'${itemID('Infernal cape')}';'`
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

		await user.addItemsToBank(loot, true);

		let msg = `${rangeXP}. ${hpXP}.`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user} ${msg}`,
			res => {
				user.log('continued trip of inferno');
				return this.client.commands.get('inferno')!.run(res, []);
			},
			await chatHeadImage({
				content: `You are very impressive for a JalYt. You managed to defeat TzKal-Zul for the ${formatOrdinal(
					user.getKC(Monsters.TzKalZuk.id)
				)} time! Please accept this cape as a token of appreciation.`,
				head: 'ketKeh'
			}),
			data,
			loot.bank
		);
	}
}

// // Add slayer
// const usersTask = await getUsersCurrentSlayerInfo(user.id);
// const isOnTask =
// 	usersTask.currentTask !== null &&
// 	usersTask.currentTask !== undefined &&
// 	usersTask.currentTask!.monsterID === Monsters.TzHaarKet.id &&
// 	usersTask.currentTask!.quantityRemaining === usersTask.currentTask!.quantity;
// if (isOnTask) {
// 			// 25,250 for Jad + 11,760 for waves.
// 			const slayerXP = 37_010;
// 			const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
// 			user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
// 			const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
// 			const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
// 			await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);

// 			usersTask.currentTask!.quantityRemaining = 0;
// 			await usersTask.currentTask!.save();
// 			const slayXP = await user.addXP({ skillName: SkillsEnum.Slayer, amount: slayerXP, duration });
// 			const xpMessage = `${msg} ${slayXP}`;

// 			msg = `Zuk task completed. ${xpMessage}. \n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${newPoints}; return to a Slayer master.**`;
// 			// End slayer code
// 		}

// if (isOnTask) {
// 	const slayXP = await user.addXP({ skillName: SkillsEnum.Slayer, amount: 11_760, duration });
// 	msg = `**Task cancelled.** \n${msg} ${slayXP}.`;
// 	usersTask.currentTask!.quantityRemaining = 0;
// 	usersTask.currentTask!.skipped = true;
// 	await usersTask.currentTask!.save();
// }
// if (isOnTask) {
// 			slayerMsg = ' **Task cancelled.**';
// 			usersTask.currentTask!.quantityRemaining = 0;
// 			usersTask.currentTask!.skipped = true;
// 			await usersTask.currentTask!.save();
// 		}
