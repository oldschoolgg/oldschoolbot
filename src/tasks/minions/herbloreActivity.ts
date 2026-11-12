import type { RNGProvider } from 'node-rng';
import { Bank, EItem, type Item, Items } from 'oldschooljs';

import { checkDegradeableItemCharges, degradeItem } from '@/lib/degradeableItems.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { Mixable } from '@/lib/skilling/types.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';

const chemistryExcludedMixableIDs = new Set([Items.getOrThrow('Guthix rest(3)').id]);

interface ApplyChemistryArgs {
	user: MUser;
	mixableItem: Mixable;
	quantity: number;
	zahur: boolean;
	wesley: boolean;
	rng: RNGProvider;
}

async function applyHerbloreAmulet({
	user,
	mixableItem,
	quantity,
	zahur,
	wesley,
	rng
}: ApplyChemistryArgs): Promise<null | {
	bonusDoseItem: Item;
	bonusDoseCount: number;
	messages: string[];
}> {
	if (zahur || wesley) return null;
	const doses = Number(mixableItem.item.name.match(/\(([1-3])\)$/)?.[1]);
	if (!doses) return null;
	if (chemistryExcludedMixableIDs.has(mixableItem.item.id)) return null;
	if (mixableItem.inputItems.items().some(([item]) => /\(4\)$/.test(item.name))) return null;

	const hasAlchemistAmulet = user.gear.skilling.hasEquipped(EItem.ALCHEMISTS_AMULET, false, false);
	if (!hasAlchemistAmulet && doses !== 3) return null;
	const chemistryItem = Items.getOrThrow(hasAlchemistAmulet ? "Alchemist's amulet" : 'Amulet of chemistry');
	if (!user.gear.skilling.hasEquipped(chemistryItem.id, false, false)) return null;

	const bonusDoseItem = Items.getItem(mixableItem.item.name.replace(/\([1-3]\)$/, `(${doses + 1})`));
	if (!bonusDoseItem) return null;

	const chemistryCharges = await checkDegradeableItemCharges({ item: chemistryItem, user });
	let available = chemistryCharges;

	if (available <= 0) return null;
	let bonusDoseCount = 0;

	for (let i = 0; i < quantity && available > 0; i++) {
		if (rng.percentChance(hasAlchemistAmulet ? 15 : 5)) {
			bonusDoseCount++;
			available--;
		}
	}

	const messages: string[] = [];

	if (bonusDoseCount > 0) {
		const degradeResult = await degradeItem({
			item: chemistryItem,
			chargesToDegrade: bonusDoseCount,
			user
		});

		const used = degradeResult.chargesToDegrade ?? 0;
		const remaining = degradeResult.chargesRemaining;

		if (typeof used === 'number' && typeof remaining === 'number') {
			messages.push(
				`Your ${chemistryItem.name} created ${bonusDoseCount} extra ${doses + 1}-dose ${
					bonusDoseCount === 1 ? 'potion' : 'potions'
				} and used ${
					used === 0 ? 'no charges' : used === 1 ? '1 charge' : `${used} charges`
				} (${remaining.toLocaleString()} left).`
			);
		} else {
			messages.push(
				`Your ${chemistryItem.name} created ${bonusDoseCount} extra ${doses + 1}-dose ${
					bonusDoseCount === 1 ? 'potion' : 'potions'
				} and used its remaining charges.`
			);
		}

		if (typeof degradeResult.userMessage === 'string' && degradeResult.userMessage.includes('broke')) {
			messages.push(degradeResult.userMessage);
		}
	}

	return {
		bonusDoseCount,
		bonusDoseItem,
		messages
	};
}

const herbNames = [
	'Guam leaf',
	'Marrentill',
	'Tarromin',
	'Harralander',
	'Ranarr weed',
	'Toadflax',
	'Irit leaf',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Huasca',
	'Lantadyme',
	'Dwarf weed',
	'Torstol'
];

function isSaveableSecondary(item: Item, mixableName: string): boolean {
	if (item.name === 'Vial of water') return false;
	if (item.name === 'Coconut milk') return false;
	if (item.name === 'Crystal dust') return false;
	if (item.name.toLowerCase().includes('(unf)')) return false;
	if (mixableName === 'Serum 207 (3)' && item.name === 'Ashes') return false;

	if (herbNames.includes(item.name)) {
		if (item.name === 'Toadflax' && mixableName === 'Antidote+(4)') {
			return true;
		}
		if (item.name === 'Irit leaf' && mixableName === 'Antidote++(4)') {
			return true;
		}
		if (item.name === 'Torstol' && (mixableName === 'Super combat potion(4)' || mixableName === 'Anti-venom+(4)')) {
			return true;
		}
		return false;
	}

	const lowerName = item.name.toLowerCase();
	if (
		lowerName.includes('potion') ||
		/\(\d\)$/.test(lowerName) ||
		lowerName.includes('mix(') ||
		lowerName.includes('balm') ||
		lowerName.startsWith('antidote') ||
		lowerName.startsWith('anti-venom')
	) {
		return false;
	}

	return true;
}

export function calculatePrescriptionGogglesSavedItems(mixableItem: Mixable, quantity: number, rng: RNGProvider): Bank {
	const savedItems = new Bank();
	for (let i = 0; i < quantity; i++) {
		for (const [item, qty] of mixableItem.inputItems.items()) {
			if (!isSaveableSecondary(item, mixableItem.item.name)) continue;
			if (rng.percentChance(10)) {
				savedItems.add(item, qty);
			}
		}
	}
	return savedItems;
}

export const herbloreTask: MinionTask = {
	type: 'Herblore',

	async run(data: HerbloreActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { mixableID, quantity, zahur, wesley, channelId, duration } = data;

		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const hasWildyDiary = user.hasDiary('wilderness.hard');
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to receive the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((rng.percentChance(maxShardChance) ? 6 : rng.randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		// Amulets add one dose to eligible hand-mixed potions, consuming charges only on success.
		const aocResult = await applyHerbloreAmulet({ user, mixableItem, quantity, zahur, wesley, rng });
		const bonusDoseItem = aocResult?.bonusDoseItem ?? null;
		const bonusDoseCount = aocResult?.bonusDoseCount ?? 0;
		const chemistryMessages = aocResult?.messages ?? [];

		const savedItems = new Bank();
		const hasGoggles = user.gear.skilling.hasEquipped('Prescription goggles');
		if (hasGoggles) {
			savedItems.add(calculatePrescriptionGogglesSavedItems(mixableItem, quantity, rng));
		}

		const xpRes = await user.addXP({ skillName: 'herblore', amount: xpReceived, duration });
		const loot = new Bank();

		if (bonusDoseCount > 0 && bonusDoseItem) {
			const normalCount = Math.max(outputQuantity - bonusDoseCount, 0);
			if (normalCount > 0) {
				loot.add(mixableItem.item.id, normalCount);
			}
			loot.add(bonusDoseItem.id, bonusDoseCount);
		} else {
			loot.add(mixableItem.item.id, outputQuantity);
		}
		loot.add(savedItems);

		await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		let completionMessage: string;
		if (bonusDoseCount > 0 && bonusDoseItem) {
			const normalCount = Math.max(outputQuantity - bonusDoseCount, 0);
			completionMessage = `${user}, ${user.minionName} finished making ${normalCount}x ${mixableItem.item.name} and ${bonusDoseCount}x ${bonusDoseItem.name}.`;
		} else {
			completionMessage = `${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}.`;
		}

		if (chemistryMessages.length > 0) {
			completionMessage = `${completionMessage}\n${chemistryMessages.join(' ')}`;
		}

		completionMessage = `${completionMessage}\n${xpRes}`;

		const savedStr = savedItems.length > 0 ? ` Your prescription goggles saved ${savedItems}.` : '';

		handleTripFinish({
			user,
			channelId,
			message: `${completionMessage}${savedStr}`,
			data,
			loot
		});
	}
};
