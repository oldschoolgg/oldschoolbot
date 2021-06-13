import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

import { Emoji, Events } from '../../../lib/constants';
import fightCavesSupplies from '../../../lib/minions/data/fightCavesSupplies';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { FightCavesActivityTaskOptions } from '../../../lib/types/minions';
import {
	calcPercentOfNum,
	calcWhatPercent,
	formatDuration,
	percentChance,
	rand
} from '../../../lib/util';
import chatHeadImage from '../../../lib/util/chatHeadImage';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

const TokkulID = itemID('Tokkul');
const TzrekJadPet = itemID('Tzrek-jad');

export default class extends Task {
	async run(data: FightCavesActivityTaskOptions) {
		const { userID, channelID, jadDeathChance, preJadDeathTime, duration } = data;
		const user = await this.client.users.fetch(userID);

		const tokkulReward = rand(2000, 6000);
		const diedToJad = percentChance(jadDeathChance);

		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts) ?? 0;
		await user.settings.update(UserSettings.Stats.FightCavesAttempts, attempts + 1);

		const attemptsStr = `You have tried Fight caves ${attempts + 1}x times.`;

		// Add slayer
		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask!.monsterID === Monsters.TzHaarKet.id &&
			usersTask.currentTask!.quantityRemaining === usersTask.currentTask!.quantity;

		if (preJadDeathTime) {
			let slayerMsg = '';
			if (isOnTask) {
				slayerMsg = ' Task cancelled.';
				usersTask.currentTask!.quantityRemaining = 0;
				usersTask.currentTask!.skipped = true;
				await usersTask.currentTask!.save();
			}
			// Give back supplies based on how far in they died, for example if they
			// died 80% of the way through, give back approximately 20% of their supplies.
			const percSuppliesToRefund = 100 - calcWhatPercent(preJadDeathTime, duration);
			const itemLootBank = new Bank();

			for (const [itemID, qty] of Object.entries(fightCavesSupplies)) {
				const amount = Math.floor(calcPercentOfNum(percSuppliesToRefund, qty));
				if (amount > 0) {
					itemLootBank.add(parseInt(itemID), amount);
				}
			}

			await user.addItemsToBank(itemLootBank, true);

			return handleTripFinish(
				this.client,
				user,
				channelID,
				`${user} You died ${formatDuration(
					preJadDeathTime
				)} into your attempt.${slayerMsg} The following supplies were refunded back into your bank: ${itemLootBank}.`,
				res => {
					user.log(`continued trip of fightcaves`);
					return this.client.commands.get('fightcaves')!.run(res, []);
				},
				await chatHeadImage({
					content: `You die before you even reach TzTok-Jad...atleast you tried, I give you ${tokkulReward}x Tokkul. ${attemptsStr}`,
					head: 'mejJal'
				}),
				data,
				itemLootBank.bank
			);
		}

		if (diedToJad) {
			let slayerMsg = '';
			if (isOnTask) {
				slayerMsg = ' Task cancelled.';
				usersTask.currentTask!.quantityRemaining = 0;
				usersTask.currentTask!.skipped = true;
				await usersTask.currentTask!.save();
			}
			const failBank = new Bank({ [TokkulID]: tokkulReward });
			await user.addItemsToBank(failBank, true);

			return handleTripFinish(
				this.client,
				user,
				channelID,
				`${user}`,
				res => {
					user.log(`continued trip of fightcaves`);
					return this.client.commands.get('fightcaves')!.run(res, []);
				},
				await chatHeadImage({
					content: `TzTok-Jad stomp you to death...nice try though JalYt, for your effort I give you ${tokkulReward}x Tokkul. ${attemptsStr}.${slayerMsg}`,
					head: 'mejJal'
				}),
				data,
				failBank.bank
			);
		}

		await user.incrementMonsterScore(Monsters.TzTokJad.id);
		const loot = Monsters.TzTokJad.kill();

		if (loot.has('Tzrek-jad')) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received their ${formatOrdinal(
					user.getCL(TzrekJadPet) + 1
				)} ${Emoji.TzRekJad} TzRek-jad pet by killing TzTok-Jad, on their ${formatOrdinal(
					user.getKC(TzTokJad.id)
				)} kill!`
			);
		}

		if (user.getCL(itemID('Fire cape')) === 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received their first Fire cape on their ${formatOrdinal(
					attempts + 1
				)} attempt!`
			);
		}

		if (user.usingPet('Flappy')) {
			loot.multiply(2);
		}

		await user.addItemsToBank(loot, true);

		let slayerMsg = '';
		if (isOnTask) {
			// 25,250 for Jad + 11,760 for waves.
			const slayerXP = 37_010;
			const currentStreak = user.settings.get(UserSettings.Slayer.TaskStreak) + 1;
			user.settings.update(UserSettings.Slayer.TaskStreak, currentStreak);
			const points = calculateSlayerPoints(currentStreak, usersTask.slayerMaster!);
			const newPoints = user.settings.get(UserSettings.Slayer.SlayerPoints) + points;
			await user.settings.update(UserSettings.Slayer.SlayerPoints, newPoints);

			usersTask.currentTask!.quantityRemaining = 0;
			await usersTask.currentTask!.save();
			const xpMessage = await user.addXP({
				skillName: SkillsEnum.Slayer,
				amount: slayerXP
			});

			slayerMsg = ` Jad task completed. ${xpMessage}`;
			// End slayer code
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}${slayerMsg}`,
			res => {
				user.log(`continued trip of fightcaves`);
				return this.client.commands.get('fightcaves')!.run(res, []);
			},
			await chatHeadImage({
				content: `You defeated TzTok-Jad for the ${formatOrdinal(
					user.getKC(Monsters.TzTokJad.id)
				)} time! I am most impressed, I give you... ${loot}.`,
				head: 'mejJal'
			}),
			data,
			loot.bank
		);
	}
}
