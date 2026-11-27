import { notEmpty } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { toaGuardianPetIds, toaMetamorphUnlockableMap } from '@/lib/petVariations.js';
import { fetchUserStats } from '@/lib/util/fetchUserStats.js';
import { assert } from '@/lib/util/logError.js';
import { flowerTable } from '@/mahoji/lib/abstracted_commands/hotColdCommand.js';

interface Usable {
	items: Item[];
	run: (user: MUser) => Promise<string>;
}
const usables: Usable[] = [];

for (const unlock of toaMetamorphUnlockableMap.filter(entry => entry.unlockable !== null)) {
	usables.push({
		items: [Items.getOrThrow(Items.itemNameFromId(unlock.unlockable!)!), Items.getOrThrow("Tumeken's guardian")],
		run: async user => {
			const equipped = user.user.minion_equippedPet;
			if (!equipped || !toaGuardianPetIds.includes(equipped))
				return "Equip Tumeken's Guardian to use a remnant on it.";
			const stats = await fetchUserStats(user.id);
			if (stats.unlocked_toa_pets.includes(unlock.pet))
				return 'You have already unlocked this guardian metamorphosis.';
			await user.transactItems({
				itemsToRemove: new Bank().add(unlock.unlockable!),
				otherUpdates: { minion_equippedPet: unlock.pet },
				collectionLog: true
			});
			await prisma.userStats.upsert({
				where: { user_id: BigInt(user.id) },
				create: { user_id: BigInt(user.id), unlocked_toa_pets: [unlock.pet] },
				update: { unlocked_toa_pets: { push: unlock.pet } }
			});
			return `You used ${Items.itemNameFromId(unlock.unlockable!)} to unlock ${Items.itemNameFromId(unlock.pet)}.`;
		}
	});
}

usables.push({
	items: [Items.getOrThrow('Funky shaped log'), Items.getOrThrow('Beaver')],
	run: async user => {
		if (user.user.minion_equippedPet !== Items.getOrThrow('Beaver').id) {
			return 'Equip your Beaver pet to use the Funky shaped log on it.';
		}
		if (user.bitfield.includes(BitField.FUNKY_SHAPED_LOG_USED)) {
			return 'You have already unlocked Beaver pet recolors.';
		}
		await user.transactItems({
			itemsToRemove: new Bank().add('Funky shaped log'),
			otherUpdates: { bitfield: { push: BitField.FUNKY_SHAPED_LOG_USED } }
		});
		return 'You used the Funky shaped log with your Beaver, unlocking Beaver pet recolors.';
	}
});

interface UsableUnlock {
	item: Item;
	bitfield: BitField;
	resultMessage: string;
}
export const usableUnlocks: UsableUnlock[] = [
	{
		item: Items.getOrThrow('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: Items.getOrThrow('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: Items.getOrThrow('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: Items.getOrThrow('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	},
	{
		item: Items.getOrThrow('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
	},
	{
		item: Items.getOrThrow('Runescroll of swampbark'),
		bitfield: BitField.HasSwampbarkScroll,
		resultMessage: 'You used your Runescroll of Swampbark, and unlocked the ability to create Swampbark armour.'
	},
	{
		item: Items.getOrThrow("Saradomin's light"),
		bitfield: BitField.HasSaradominsLight,
		resultMessage: "You used your Saradomin's light."
	},
	{
		item: Items.getOrThrow('Frozen tablet'),
		bitfield: BitField.UsedFrozenTablet,
		resultMessage: 'You used your Frozen tablet.'
	},
	{
		item: Items.getOrThrow('Scarred tablet'),
		bitfield: BitField.UsedScarredTablet,
		resultMessage: 'You used your Scarred tablet.'
	},
	{
		item: Items.getOrThrow('Sirenic tablet'),
		bitfield: BitField.UsedSirenicTablet,
		resultMessage: 'You used your Sirenic tablet.'
	},
	{
		item: Items.getOrThrow('Strangled tablet'),
		bitfield: BitField.UsedStrangledTablet,
		resultMessage: 'You used your Strangled tablet.'
	},
	{
		item: Items.getOrThrow('Deadeye prayer scroll'),
		bitfield: BitField.HasDeadeyeScroll,
		resultMessage: 'You used your Deadeye prayer scroll, and unlocked the Deadeye prayer.'
	},
	{
		item: Items.getOrThrow('Mystic vigour prayer scroll'),
		bitfield: BitField.HasMysticVigourScroll,
		resultMessage: 'You used your Mystic vigour prayer scroll, and unlocked the Mystic vigour prayer.'
	},
	{
		item: Items.getOrThrow('Rite of vile transference'),
		bitfield: BitField.HasRiteOfVileTransference,
		resultMessage: 'You used your Rite of vile transference.'
	}
];
for (const usableUnlock of usableUnlocks) {
	usables.push({
		items: [usableUnlock.item],
		run: async user => {
			if (user.bitfield.includes(usableUnlock.bitfield)) {
				return "You already used this item, you can't use it again.";
			}
			await user.transactItems({
				itemsToRemove: new Bank().add(usableUnlock.item.id),
				otherUpdates: {
					bitfield: {
						push: usableUnlock.bitfield
					}
				}
			});
			return usableUnlock.resultMessage;
		}
	});
}

export const genericUsables: {
	items: [Item, Item] | [Item];
	cost: Bank;
	loot: Bank | (() => Bank) | null;
	response: (loot: Bank) => string;
}[] = [
	{
		items: [Items.getOrThrow('Banana'), Items.getOrThrow('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [Items.getOrThrow('Mithril seeds')],
		cost: new Bank().add('Mithril seeds').freeze(),
		loot: () => flowerTable.roll(),
		response: loot => `You planted a Mithril seed and got ${loot}!`
	}
];
for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async user => {
			const cost = genericU.cost ? genericU.cost : undefined;
			const loot =
				genericU.loot === null ? undefined : genericU.loot instanceof Bank ? genericU.loot : genericU.loot();
			if (loot || cost) await user.transactItems({ itemsToAdd: loot, itemsToRemove: cost, collectionLog: true });
			return genericU.response(loot ?? new Bank());
		}
	});
}
export const allUsableItems = new Set(usables.map(i => i.items.map(i => i.id)).flat(2));

export async function useCommand(user: MUser, _firstItem: string, _secondItem?: string) {
	const firstItem = Items.getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : Items.getItem(_secondItem);
	if (!firstItem || (_secondItem !== undefined && !secondItem)) return "That's not a valid item.";
	const items = [firstItem, secondItem].filter(notEmpty);
	assert(items.length === 1 || items.length === 2);

	const { bank } = user;
	const checkBank = new Bank();
	for (const i of items) checkBank.add(i.id);
	if (!bank.has(checkBank)) return `You don't own ${checkBank}.`;

	const usable = usables.find(
		i => i.items.length === items.length && i.items.every(t => items.some(item => item.id === t.id))
	);
	const toaUnlock = toaMetamorphUnlockableMap.find(
		entry => entry.unlockable !== null && (entry.unlockable === firstItem.id || entry.unlockable === secondItem?.id)
	);
	const guardianIds = toaGuardianPetIds;
	if (
		toaUnlock &&
		items.length === 2 &&
		items.some(item => item.id === toaUnlock.unlockable) &&
		guardianIds.includes(user.user.minion_equippedPet ?? -1)
	) {
		const stats = await fetchUserStats(user.id);
		if (stats.unlocked_toa_pets.includes(toaUnlock.pet))
			return 'You have already unlocked this guardian metamorphosis.';
		await user.transactItems({
			itemsToRemove: new Bank().add(toaUnlock.unlockable!),
			otherUpdates: { minion_equippedPet: toaUnlock.pet }
		});
		await prisma.userStats.upsert({
			where: { user_id: BigInt(user.id) },
			create: { user_id: BigInt(user.id), unlocked_toa_pets: [toaUnlock.pet] },
			update: { unlocked_toa_pets: { push: toaUnlock.pet } }
		});
		return `You used ${Items.itemNameFromId(toaUnlock.unlockable!)} to unlock ${Items.itemNameFromId(toaUnlock.pet)}.`;
	}
	if (!usable) return `That's not a usable ${items.length === 1 ? 'item' : 'combination'}.`;
	return usable.run(user);
}
