import { Time, percentChance, randInt, roll } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { PortentID, chargePortentIfHasCharges } from '../../lib/bso/divination';
import { clueUpgraderEffect } from '../../lib/bso/inventionEffects';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { type Stealable, stealables } from '../../lib/skilling/skills/thieving/stealables';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { perHourChance, skillingPetDropRate } from '../../lib/util';
import { forcefullyUnequipItem } from '../../lib/util/forcefullyUnequipItem';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { rogueOutfitPercentBonus, updateClientGPTrackSetting, userStatsBankUpdate } from '../../mahoji/mahojiSettings';

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

		const updateBank = new UpdateBank();
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
					updateBank.itemLootBank.add(doubledLoot);
				} else {
					updateBank.itemLootBank.add(lootItems);
				}

				// Roll for pet
				if (roll(petDropRate)) {
					updateBank.itemLootBank.add('Rocky');
				}
			}
		} else if (obj.type === 'stall') {
			for (let i = 0; i < successfulQuantity; i++) {
				if (percentChance(obj.lootPercent!)) {
					updateBank.itemLootBank.add(obj.table.roll());
				}
			}
		}

		const boosts: string[] = [];

		if (user.hasEquipped("Thieves' armband")) {
			boosts.push('3x loot for Thieves armband');
			updateBank.itemLootBank.multiply(3, notMultiplied);
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
				const before = updateBank.itemLootBank.clone();
				updateBank.itemLootBank.multiply(3, notMultiplied);
				const after = updateBank.itemLootBank.clone();
				await userStatsBankUpdate(user, 'loot_from_rogues_portent', after.difference(before));
			}
		}
		clueUpgraderEffect({
			gearBank: user.gearBank,
			messages: boosts,
			disabledInventions: user.user.disabled_inventions,
			updateBank,
			type: 'pickpocketing',
			bitfield: user.bitfield
		});

		let gotWil = false;
		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (roll(Math.floor(4000 / minutes))) {
				updateBank.itemLootBank.add('Wilvus');
				gotWil = true;
			}
		}

		if (updateBank.itemLootBank.has('Coins')) {
			updateClientGPTrackSetting('gp_pickpocket', updateBank.itemLootBank.amount('Coins'));
		}

		updateBank.userStatsBankUpdates.steal_loot_bank = updateBank.itemLootBank;

		const txResult = await updateBank.transactWithItemsOrThrow(user);
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

		if (updateBank.itemLootBank.amount('Rocky') > 0) {
			str += "\n**You have a funny feeling you're being followed...**";
		}
		if (boosts.length > 0) {
			str += `\n\n**Messages:** ${boosts.join(', ')}`;
		}

		const image =
			txResult.itemTransactionResult.itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: txResult.itemTransactionResult.itemsAdded,
						title: `Loot From ${successfulQuantity} ${obj.name}:`,
						user,
						previousCL: txResult.itemTransactionResult.previousCL
					});

		handleTripFinish(user, channelID, str, image?.file.attachment, data, updateBank.itemLootBank);
	}
};
