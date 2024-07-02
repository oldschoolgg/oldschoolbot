import { percentChance, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import type { Stealable } from '../../lib/skilling/skills/thieving/stealables';
import { stealables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import type { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { rogueOutfitPercentBonus, updateClientGPTrackSetting } from '../../mahoji/mahojiSettings';

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

	const chanceOfSuccess = (npc.slope! * currentLevel + npc.intercept!) * diary * thievCape;

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

export const pickpocketTask: MinionTask = {
	type: 'Pickpocket',
	async run(data: PickpocketActivityTaskOptions) {
		const { monsterID, quantity, successfulQuantity, userID, channelID, xpReceived, duration } = data;
		const user = await mUserFetch(userID);
		const obj = stealables.find(_obj => _obj.id === monsterID)!;
		const currentLevel = user.skillLevel('thieving');
		let rogueOutfitBoostActivated = false;

		const loot = new Bank();
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Thieving, obj.petChance);

		if (obj.type === 'pickpockable') {
			for (let i = 0; i < successfulQuantity; i++) {
				const lootItems = obj.table.roll(1, {
					tertiaryItemPercentageChanges: user.buildTertiaryItemChanges()
				});
				// TODO: Remove Rocky from loot tables in oldschoolJS
				if (lootItems.has('Rocky')) lootItems.remove('Rocky');

				if (randInt(1, 100) <= rogueOutfitPercentBonus(user)) {
					rogueOutfitBoostActivated = true;
					const doubledLoot = lootItems.multiply(2);
					loot.add(doubledLoot);
				} else {
					loot.add(lootItems);
				}

				// Roll for pet
				if (roll(petDropRate)) {
					loot.add('Rocky');
				}
			}
		} else if (obj.type === 'stall') {
			for (let i = 0; i < successfulQuantity; i++) {
				if (percentChance(obj.lootPercent!)) {
					loot.add(obj.table.roll());
				}

				// Roll for pet
				if (roll(petDropRate)) {
					loot.add('Rocky');
				}
			}
		}

		if (loot.has('Coins')) {
			updateClientGPTrackSetting('gp_pickpocket', loot.amount('Coins'));
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: xpReceived, duration });

		let str = `${user}, ${user.minionName} finished ${
			obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
		} from ${obj.name} ${successfulQuantity}x times, due to failures you missed out on ${
			quantity - successfulQuantity
		}x ${obj.type === 'pickpockable' ? 'pickpockets' : 'steals'}. ${xpRes}`;

		str += `\n${
			obj.type === 'pickpockable'
				? ''
				: `${
						100 - obj.lootPercent!
					}% of the loot was dropped in favour of enhancing amount of stalls stolen from.`
		}`;

		if (rogueOutfitBoostActivated) {
			str += '\nYour rogue outfit allows you to take some extra loot.';
		}

		if (loot.amount('Rocky') > 0) {
			str += "\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while ${
					obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
				} from ${obj.name}, their Thieving level is ${currentLevel}!`
			);
		}

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded,
						title: `Loot From ${successfulQuantity} ${obj.name}:`,
						user,
						previousCL
					});

		handleTripFinish(user, channelID, str, image?.file.attachment, data, loot);
	}
};
