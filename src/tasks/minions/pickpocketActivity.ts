import { percentChance, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { Stealable, stealables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { rogueOutfitPercentBonus, updateGPTrackSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Stealable,
	quantity: number,
	hasThievingCape: boolean,
	hasDiary: boolean
): [number, number, number, number] {
	let xpReceived = 0;

	let successful = 0;
	let damageTaken = 0;
	// Pickpocketing takes 2 ticks
	const timeToPickpocket = (npc.customTickRate ?? 2.05) * 0.6;
	// For future Ardougne Diary and Thieving cape
	const diary = hasDiary && npc.customTickRate === undefined ? 1.1 : 1;
	const thievCape = hasThievingCape && npc.customTickRate === undefined ? 1.1 : 1;

	let chanceOfSuccess = (npc.slope! * currentLevel + npc.intercept!) * diary * thievCape;

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			// The minion has just been stunned, and cant pickpocket for a few ticks, therefore
			// they also miss out on the next few pickpockets depending on stun time. And take damage
			damageTaken += npc.stunDamage!;
			quantity -= Math.round(npc.stunTime! / timeToPickpocket);
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
		const obj = stealables.find(_obj => _obj.id === monsterID)!;

		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		let rogueOutfitBoostActivated = false;

		const loot = new Bank();

		if (obj.type === 'pickpockable') {
			for (let i = 0; i < successfulQuantity; i++) {
				const lootItems = obj.table.roll();

				if (randInt(1, 100) <= rogueOutfitPercentBonus(user)) {
					rogueOutfitBoostActivated = true;
					const doubledLoot = lootItems.multiply(2);
					if (doubledLoot.has('Rocky')) doubledLoot.remove('Rocky');
					loot.add(doubledLoot);
				} else {
					loot.add(lootItems);
				}
			}
		} else if (obj.type === 'stall') {
			for (let i = 0; i < (successfulQuantity * obj.lootPercent!) / 100; i++) {
				loot.add(obj.table.roll());
			}
		}

		if (loot.has('Coins')) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourcePickpocket, loot.amount('Coins'));
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: xpReceived, duration });

		let str = `${user}, ${user.minionName} finished ${
			obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
		} from ${obj.name} ${successfulQuantity}x times, due to failures you missed out on ${
			quantity - successfulQuantity
		}x ${obj.type === 'pickpockable' ? 'pickpockets' : 'steals'}. ${xpRes}`;

		str += `\n\n${
			obj.type === 'pickpockable'
				? `You received: ${loot}.`
				: `${
						100 - obj.lootPercent!
				  }% of the loot was dropped in favour of enhancing amount of stalls stolen from.`
		}\nYou received: ${loot}.`;

		if (rogueOutfitBoostActivated) {
			str += '\nYour rogue outfit allows you to take some extra loot.';
		}

		if (loot.amount('Rocky') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while ${
					obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
				} from ${obj.name}, their Thieving level is ${currentLevel}!`
			);
		}

		handleTripFinish(user, channelID, str, ['steal', { name: obj.name, quantity }, true], undefined, data, loot);
	}
}
