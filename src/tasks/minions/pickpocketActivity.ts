import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';
import { chargePortentIfHasCharges, PortentID } from '@/lib/bso/skills/divination.js';
import { clueUpgraderEffect } from '@/lib/bso/skills/invention/effects/clueUpgraderEffect.js';
import { forcefullyUnequipItem } from '@/lib/bso/util/forcefullyUnequipItem.js';

import { percentChance, randInt, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Items, resolveItems } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { Thieving } from '@/lib/skilling/skills/thieving/index.js';
import { type Stealable, stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import type { PickpocketActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { perHourChance } from '@/lib/util/smallUtils.js';
import { skillingPetDropRate } from '@/lib/util.js';

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
	async run(data: PickpocketActivityTaskOptions, { user, handleTripFinish }) {
		const { monsterID, quantity, successfulQuantity, channelID, xpReceived, duration } = data;
		const obj = stealables.find(_obj => _obj.id === monsterID)!;
		let rogueOutfitBoostActivated = false;

		const updateBank = new UpdateBank();
		const { petDropRate } = skillingPetDropRate(user, 'thieving', obj.petChance);

		const userTertChanges = user.buildTertiaryItemChanges();
		const roguesChance = Thieving.rogueOutfitPercentBonus(user);

		if (obj.type === 'pickpockable') {
			for (let i = 0; i < successfulQuantity; i++) {
				const lootItems = obj.table.roll(1, {
					tertiaryItemPercentageChanges: userTertChanges
				});
				// TODO: Remove Rocky from loot tables in oldschoolJS
				if (lootItems.has('Rocky')) lootItems.remove('Rocky');

				if (randInt(1, 100) <= roguesChance) {
					rogueOutfitBoostActivated = true;
					const doubledLoot = lootItems.multiply(2);
					updateBank.itemLootBank.add(doubledLoot);
				} else {
					updateBank.itemLootBank.add(lootItems);
				}

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
				await forcefullyUnequipItem(user, Items.getOrThrow("Thieves' armband"));
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
				await user.statsBankUpdate('loot_from_rogues_portent', after.difference(before));
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
			await ClientSettings.updateClientGPTrackSetting('gp_pickpocket', updateBank.itemLootBank.amount('Coins'));
		}

		updateBank.userStatsBankUpdates.steal_loot_bank = updateBank.itemLootBank;

		const txResult = await updateBank.transactWithItemsOrThrow(user);
		const xpRes = await user.addXP({ skillName: 'thieving', amount: xpReceived, duration });

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
