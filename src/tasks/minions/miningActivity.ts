import { roll } from 'e';
import { Task } from 'klasa';

import { Emoji, Events, Time } from '../../lib/constants';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
import addItemsToBankAndReturn from '../../lib/minions/functions/addItemsToBankAndReturn';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ oreID, quantity, userID, channelID, duration }: MiningActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Mining);

		const ore = Mining.Ores.find(ore => ore.id === oreID);

		if (!ore) return;

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
				user.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${
			ore.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Mining level is now ${newLevel}!`;
		}

		let loot = {
			[ore.id]: quantity
		};

		// Add clue scrolls
		if (ore.clueScrollChance) {
			loot = addSkillingClueToLoot(user, quantity, ore.clueScrollChance, loot);
		}

		// Roll for pet
		if (
			ore.petChance &&
			roll((ore.petChance - user.skillLevel(SkillsEnum.Mining) * 25) / quantity)
		) {
			loot[itemID('Rock golem')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
			);
		}

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.nuggets) {
			const numberOfNuggets = rand(0, Math.floor(numberOfMinutes / 4));
			loot[12012] = numberOfNuggets;
		} else if (numberOfMinutes > 10 && ore.minerals) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot[21341] = numberOfMinerals;
			}
		}

		// Show only what is added to the bank, to avoid showing multiple of the same clue scroll
		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			await addItemsToBankAndReturn(user, loot)
		)}.`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of ${quantity}x ${ore.name}[${ore.id}]`);
			return this.client.commands.get('mine')!.run(res, [quantity, ore.name]);
		});
	}
}
