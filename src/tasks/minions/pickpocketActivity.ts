import { percentChance, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { Pickpockable, Pickpocketables, Stalls } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { rogueOutfitPercentBonus, updateGPTrackSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Pickpockable,
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

	let chanceOfSuccess = (npc.slope * currentLevel + npc.intercept) * diary * thievCape;

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
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID);
		const stall = Stalls.find(_stall => _stall.id === monsterID)!;

		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		let rogueOutfitBoostActivated = false;

		const loot = new Bank();

		if (npc) {
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
		} else if (stall) {
			for (let i = 0; i < (successfulQuantity * stall.lootPercent) / 100; i++) {
				loot.add(stall.table.roll());
			}
		}

		if (loot.has('Coins')) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourcePickpocket, loot.amount('Coins'));
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: xpReceived, duration });

		let str = `${user}, ${user.minionName} finished ${npc ? 'pickpocketing' : 'stealing'} from ${
			npc ? npc.name : stall.name
		} ${successfulQuantity}x times, due to failures you missed out on ${quantity - successfulQuantity}x ${
			npc ? 'pickpockets' : 'steals'
		}. ${xpRes}`;

		str += `\n\n${
			npc
				? `You received: ${loot}.`
				: `${
						100 - stall.lootPercent
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
					npc ? 'pickpocketing' : 'stealing'
				} from ${npc ? npc.name : stall.name}, their Thieving level is ${currentLevel}!`
			);
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['pickpocket', [quantity, npc ? npc.name : stall.name], true],
			undefined,
			data,
			loot
		);
	}
}
