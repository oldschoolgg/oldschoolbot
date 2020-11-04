import { randInt } from 'e';
import { Task } from 'klasa';

import { Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { multiplyBank, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ barID, quantity, userID, channelID, duration }: SmeltingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const bar = Smithing.Bars.find(bar => bar.id === barID);
		if (!bar) return;

		// If this bar has a chance of failing to smelt, calculate that here.
		const oldQuantity = quantity;
		if (bar.chanceOfFail > 0) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (randInt(0, 100) > bar.chanceOfFail) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		let xpReceived = quantity * bar.xp;

		if (
			bar.id === itemID('Gold bar') &&
			user.hasItemEquippedAnywhere(itemID('Goldsmith gauntlets'))
		) {
			xpReceived = quantity * 56.2;
		}

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smelting ${quantity}x ${
			bar.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		if (bar.chanceOfFail > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${bar.name}s failed to smelt.`;
		}

		let loot = {
			[bar.id]: quantity
		};

		if (roll(10)) {
			loot = multiplyBank(loot, 4);
			loot[getRandomMysteryBox()] = 1;
		}

		const numMinutes = duration / Time.Minute;
		if (user.settings.get(UserSettings.QP) > 10) {
			for (let i = 0; i < numMinutes; i++) {
				if (roll(4500)) {
					str += `\n\n<:zak:751035589952012298> While Smelting ores on Neitiznot, a Yak approaches you and says "Moooo". and is now following you around. You decide to name him 'Zak'.`;
					loot[itemID('Zak')] = 1;
					break;
				}
			}
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of ${oldQuantity}x ${bar.name}[${bar.id}]`);
			return this.client.commands.get('smelt')!.run(res, [oldQuantity, bar.name]);
		});
	}
}
