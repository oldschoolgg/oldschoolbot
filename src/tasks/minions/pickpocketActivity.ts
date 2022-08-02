import { percentChance, randInt, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { Events, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { Pickpockable, Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { rogueOutfitPercentBonus, roll, updateGPTrackSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import { clueUpgraderEffect } from './monsterActivity';

const notMultiplied = resolveItems([
	'Blood shard',
	'Enhanced crystal teleport seed',
	...ClueTiers.map(i => i.scrollID),
	...ClueTiers.map(i => i.id)
]);

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Pickpockable,
	quantity: number,
	hasThievingCape: boolean,
	hasDiary: boolean,
	armband: boolean
): [number, number, number, number] {
	let xpReceived = 0;

	let successful = 0;
	let damageTaken = 0;
	// Pickpocketing takes 2 ticks
	const timeToPickpocket = (npc.customTickRate ?? 2.05) * 0.6;
	// For future Ardougne Diary and Thieving cape
	const diary = hasDiary && npc.customTickRate === undefined ? 1.1 : 1;
	const thievCape = hasThievingCape && npc.customTickRate === undefined ? 1.1 : 1;

	let chanceOfSuccess = (npc.slope * currentLevel + npc.intercept) * diary * thievCape;
	if (armband) {
		// 50% better success chance if has armband
		chanceOfSuccess += chanceOfSuccess / 2;
	}
	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			// The minion has just been stunned, and cant pickpocket for a few ticks, therefore
			// they also miss out on the next few pickpockets depending on stun time. And take damage
			damageTaken += npc.stunDamage;
			quantity -= Math.round(npc.stunTime / timeToPickpocket);
			continue;
		}
		successful++;

		xpReceived += npc.xp;
	}

	return [successful, damageTaken, xpReceived, chanceOfSuccess];
}

export default class extends Task {
	async run(data: PickpocketActivityTaskOptions) {
		const { monsterID, quantity, successfulQuantity, userID, channelID, xpReceived, duration } = data;
		const user = await this.client.fetchUser(userID);
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID)!;

		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		let rogueOutfitBoostActivated = false;

		const loot = new Bank();
		for (let i = 0; i < successfulQuantity; i++) {
			const lootItems = npc.table.roll();

			if (randInt(1, 100) <= rogueOutfitPercentBonus(user)) {
				rogueOutfitBoostActivated = true;
				const doubledLoot = lootItems.multiply(2);
				if (doubledLoot.has('Rocky')) doubledLoot.remove('Rocky');
				loot.add(doubledLoot);
			} else {
				loot.add(lootItems);
			}
		}

		let boosts: string[] = [];
		await clueUpgraderEffect(user, loot, boosts, 'pickpocketing');
		if (user.hasItemEquippedOrInBank(itemID("Thieves' armband"))) {
			boosts.push('3x loot for Thieves armband');
			loot.multiply(3, notMultiplied);
		}

		let gotWil = false;
		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (roll(Math.floor(4000 / minutes))) {
				loot.add('Wilvus');
				gotWil = true;
			}
		}

		if (loot.has('Coins')) {
			updateGPTrackSetting('gp_pickpocket', loot.amount('Coins'));
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: xpReceived });

		let str = `${user}, ${user.minionName} finished pickpocketing a ${
			npc.name
		} ${successfulQuantity}x times, due to failures you missed out on ${
			quantity - successfulQuantity
		}x pickpockets. ${xpRes}`;

		if (gotWil) {
			str +=
				'<:wilvus:787320791011164201> A raccoon saw you thieving and partners with you to help you steal more stuff!';
		}

		str += `\n\nYou received: ${loot}.`;

		if (rogueOutfitBoostActivated) {
			str += '\nYour rogue outfit allows you to take some extra loot.';
		}

		if (loot.amount('Rocky') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${user.minionName}, just received a **Rocky** <:Rocky:324127378647285771> while pickpocketing a ${npc.name}, their Thieving level is ${currentLevel}!`
			);
		}
		if (boosts.length > 0) {
			str += `\n\n**Messages:** ${boosts.join(', ')}`;
		}

		handleTripFinish(
			user,
			channelID,
			str,
			['pickpocket', { name: npc.name, quantity }, true],
			undefined,
			data,
			loot
		);
	}
}
