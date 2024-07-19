import { Time, percentChance, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { PortentID, chargePortentIfHasCharges } from '../../lib/bso/divination';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { type Stealable, stealables } from '../../lib/skilling/skills/thieving/stealables';
import type { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { perHourChance, skillingPetDropRate } from '../../lib/util';
import { forcefullyUnequipItem } from '../../lib/util/forcefullyUnequipItem';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { rogueOutfitPercentBonus, updateClientGPTrackSetting, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { clueUpgraderEffect } from './monsterActivity';

const notMultiplied = resolveItems([
	'Blood shard',
	'Enhanced crystal teleport seed',
	...ClueTiers.map(i => i.scrollID),
	...ClueTiers.map(i => i.id)
]);

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Stealable,
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

	let chanceOfSuccess = (npc.slope! * currentLevel + npc.intercept!) * diary * thievCape;
	if (armband) {
		// 50% better success chance if has armband
		chanceOfSuccess += chanceOfSuccess / 2;
	}

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
			}
		}

		const boosts: string[] = [];
		await clueUpgraderEffect(user, loot, boosts, 'pickpocketing');
		if (user.hasEquipped("Thieves' armband")) {
			boosts.push('3x loot for Thieves armband');
			loot.multiply(3, notMultiplied);
			await perHourChance(duration, 40, async () => {
				await forcefullyUnequipItem(user, getOSItem("Thieves' armband"));
				boosts.push('Your thieves armband broke!');
			});
		} else {
			const { didCharge } = await chargePortentIfHasCharges({
				user,
				portentID: PortentID.RoguesPortent,
				charges: Math.ceil(duration / Time.Minute)
			});
			if (didCharge) {
				boosts.push('3x loot for Rogues portent');
				const before = loot.clone();
				loot.multiply(3, notMultiplied);
				const after = loot.clone();
				await userStatsBankUpdate(user, 'loot_from_rogues_portent', after.difference(before));
			}
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
			updateClientGPTrackSetting('gp_pickpocket', loot.amount('Coins'));
		}

		await userStatsBankUpdate(user, 'steal_loot_bank', loot);

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

		if (gotWil) {
			str +=
				'<:wilvus:787320791011164201> A raccoon saw you thieving and partners with you to help you steal more stuff!';
		}

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
		}
		if (boosts.length > 0) {
			str += `\n\n**Messages:** ${boosts.join(', ')}`;
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
