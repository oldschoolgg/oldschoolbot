import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { Thieving } from '@/lib/skilling/skills/thieving/index.js';
import type { Stealable } from '@/lib/skilling/skills/thieving/stealables.js';
import { rogueOutfitPercentBonus } from '@/lib/skilling/skills/thieving/thievingUtils.js';
import type { PickpocketActivityTaskOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';
import { percentChance, randInt, roll } from 'node-rng';

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Stealable,
	quantity: number,
	hasThievingCape: boolean,
	hasDiary: boolean,
	rng: { percentChance: (percent: number) => boolean }
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
		if (!rng.percentChance(chanceOfSuccess)) {
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
	async run(data: PickpocketActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { monsterID, quantity, successfulQuantity, channelId, xpReceived, duration } = data;

		const obj = Thieving.stealables.find(_obj => _obj.id === monsterID)!;
		const isRoguesCastleChest = obj.id === 14774;
		const currentLevel = user.skillLevel('thieving');
		let rogueOutfitBoostActivated = false;

		const userTertChanges = user.buildTertiaryItemChanges();

		const loot = new Bank();

		const { petDropRate } = skillingPetDropRate(user, 'thieving', obj.petChance ?? 0);

		if (obj.type === 'pickpockable') {
			for (let i = 0; i < successfulQuantity; i++) {
				const lootItems = obj.table.roll(1, {
					tertiaryItemPercentageChanges: userTertChanges
				});

				// add clues to loot before rogue boost
				for (const id of ClueTiers.map(c => c.scrollID).filter(sid => lootItems.has(sid))) {
					loot.add(id, lootItems.amount(id));
					lootItems.remove(id);
				}

				if (randInt(1, 100) <= rogueOutfitPercentBonus(user)) {
					rogueOutfitBoostActivated = true;
					const doubledLoot = lootItems.multiply(2);
					loot.add(doubledLoot);
				} else {
					loot.add(lootItems);
				}

				if (rng.roll(petDropRate)) {
					loot.add('Rocky');
				}
			}
		} else if (obj.type === 'stall') {
			for (let i = 0; i < successfulQuantity; i++) {
				if (rng.percentChance(obj.lootPercent!)) {
					obj.table.roll(1, { targetBank: loot });
				}

				if (rng.roll(petDropRate)) {
					loot.add('Rocky');
				}
			}
		} else if (obj.type === 'chest') {
			const hasMediumDiary = isRoguesCastleChest && user.hasDiary('wilderness.medium');
			const hasHardDiary = isRoguesCastleChest && user.hasDiary('wilderness.hard');
			const lootMultiplier = isRoguesCastleChest ? (hasHardDiary ? 1.25 : hasMediumDiary ? 1 : 0.75) : 1;
			const extraLootChance = lootMultiplier > 1 ? (lootMultiplier - 1) * 100 : 0;
			const baseLootChance = lootMultiplier < 1 ? lootMultiplier * 100 : 100;
			const clueRolls = isRoguesCastleChest && user.owns('Ring of wealth (i)') ? 2 : 1;

			for (let i = 0; i < successfulQuantity; i++) {
				if (percentChance(baseLootChance)) {
					obj.table.roll(1, { targetBank: loot });
				}

				if (extraLootChance > 0 && percentChance(extraLootChance)) {
					obj.table.roll(1, { targetBank: loot });
				}

				if (isRoguesCastleChest) {
					for (let rollIndex = 0; rollIndex < clueRolls; rollIndex++) {
						if (roll(99)) {
							loot.add('Clue scroll (hard)');
						}
					}
				}
				if (roll(petDropRate)) {
					loot.add('Rocky');
				}
			}
		}

		const hardClueScrollId = ClueTiers.find(tier => tier.name === 'Hard')?.scrollID;
		const pkedLoot = new Bank();
		let pkedLootPercent = 0;

		if (isRoguesCastleChest && loot.length > 0) {
			pkedLootPercent = randInt(5, 15);
			for (const [item, quantity] of loot.items()) {
				if (item.id === hardClueScrollId) {
					continue;
				}
				const lostAmount = Math.floor((quantity * pkedLootPercent) / 100);
				if (lostAmount > 0) {
					loot.remove(item.id, lostAmount);
					pkedLoot.add(item.id, lostAmount);
				}
			}
		}

		if (loot.has('Coins')) {
			await ClientSettings.updateClientGPTrackSetting('gp_pickpocket', loot.amount('Coins'));
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		const xpRes = await user.addXP({ skillName: 'thieving', amount: xpReceived, duration });

		let str = `${user}, ${user.minionName} finished ${obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
			} from ${obj.name} ${successfulQuantity}x times, due to failures you missed out on ${quantity - successfulQuantity
			}x ${obj.type === 'pickpockable' ? 'pickpockets' : 'steals'}. ${xpRes}`;

		if (obj.type === 'stall') {
			str += `\n${100 - obj.lootPercent!
				}% of the loot was dropped in favour of enhancing amount of stalls stolen from.`;
		}

		if (rogueOutfitBoostActivated) {
			str += '\nYour rogue outfit allows you to take some extra loot.';
		}

		if (pkedLoot.length > 0) {
			str += `\nYou were PKed and lost ${pkedLootPercent}% of your loot: ${pkedLoot}.`;
		}

		if (loot.amount('Rocky') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while ${obj.type === 'pickpockable' ? 'pickpocketing' : 'stealing'
				} from ${obj.name}, their Thieving level is ${currentLevel}!`
			);
		}

		const message = new MessageBuilder().setContent(str);
		if (itemsAdded.length > 0) {
			message.addBankImage({
				bank: itemsAdded,
				title: `Loot From ${successfulQuantity} ${obj.name}:`,
				user,
				previousCL
			});
		}

		handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot: itemsAdded
		});
	}
};
