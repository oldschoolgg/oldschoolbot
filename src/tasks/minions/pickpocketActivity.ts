import { calcWhatPercent, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import Pickpocketables from '../../lib/skilling/skills/thieving/pickpocketables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ monsterID, quantity, userID, channelID, duration }: PickpocketActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID);
		if (!npc) {
			this.client.wtf(new Error(`Missing pickpocket monster with ID ${monsterID}.`));
			return;
		}

		let xpReceived = 0;
		const currentLevel = user.skillLevel(SkillsEnum.Thieving);

		const loot = new Bank();
		let successful = 0;
		for (let i = 0; i < quantity; i++) {
			/**
			 * 40% base chance of failure. If you have lvl+10 thieving level,
			 * your chance goes to the absolute lowest of 15%.
			 */
			let chanceOfFailure = 40;
			if (currentLevel >= npc.level + 10) {
				chanceOfFailure = 15;
			} else {
				let percentOfBest = 100 - calcWhatPercent(currentLevel, npc.level + 10);
				chanceOfFailure += percentOfBest / 4;
			}
			if (percentChance(chanceOfFailure)) {
				continue;
			}
			successful++;
			loot.add(npc.table.roll());
			xpReceived += npc.xp;
		}

		if (user.username === 'thievious') {
			loot.add('Rocky');
		}
		await user.addItemsToBank(loot.values(), true);

		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished pickpocketing a ${
			npc.name
		} ${successful}x times, due to failures you missed out on ${
			quantity - successful
		}x pickpockets, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Thieving level is now ${newLevel}!`;
		}
		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.`;

		if (loot.amount('Rocky') > 0) {
			str += `\nYou have a funny feeling you're being followed...`;
		}
		// TODO ANNOUNCE ROCKY

		str += `\n**${((xpReceived / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr**`;

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of pickpocketing ${quantity}x ${npc.name}[${npc.id}]`);
			return this.client.commands.get('pickpocket')!.run(res, [quantity, npc.name]);
		});
	}
}
