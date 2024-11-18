import { roll } from 'e';
import { Bank, type Item, LootTable } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import type { UnifiedOpenable } from './openables';
import getOSItem from './util/getOSItem';

const BronzeChest = new LootTable({ limit: 99 })
	.every('Swamp paste', [10, 20])
	.tertiary(63, 'Bronze locks')
	.tertiary(4, 'Coins', [1, 270])
	.oneIn(3000, 'Steel longsword')
	.oneIn(3000, 'Black spear')
	.add('Steel axe', 1, 6)
	.add('Magic staff', 1, 6)
	.add('Black dagger', 1, 6)
	.add('Black dagger(p)', 1, 5)
	.add('Mithril dagger', 1, 5)
	.add('Mithril dagger(p)', 1, 4)
	.add('Steel spear', 1, 4)
	.add('Steel spear(p)', 1, 4)
	.add('Steel sword', 1, 4)
	.add('Steel mace', 1, 3)
	.add('Steel scimitar', 1, 3)
	.add('Black mace', 1, 2)
	.add('Black axe', 1, 1)
	.add('Chaos rune', [12, 29], 14)
	.add('Amulet of defence', 1, 7)
	.add('Silver bar', 3, 6)
	.add('Steel med helm', 1, 5)
	.add('Gold bar', 3, 5)
	.add('Mithril bar', 3, 5)
	.add('Clue scroll (easy)', 1, 2)
	.add('Sapphire ring', 1, 2);

const SplitBarkScrollsTable = new LootTable()
	.add("Tree wizards' journal")
	.add('Runescroll of swampbark')
	.add('Bloody notes')
	.add('Runescroll of bloodbark');

const SteelChest = new LootTable({ limit: 134 })
	.tertiary(597, SplitBarkScrollsTable)
	.tertiary(62, 'Fine cloth')
	.tertiary(63, 'Steel locks')
	.every('Swamp paste', [15, 30])
	.add('Coins', [1, 700])
	.add('Black scimitar', 1, 10)
	.add('Mithril mace', 1, 7)
	.add('Steel warhammer', 1, 6)
	.add('Black warhammer', 1, 6)
	.add('Steel battleaxe', 1, 5)
	.add('Mithril spear', 1, 4)
	.add('Mithril spear(p)', 1, 4)
	.add('Adamant dagger', 1, 4)
	.add('Black sword', 1, 3)
	.add('Mithril sword', 1, 3)
	.add('Black longsword', 1, 2)
	.add('Steel 2h sword', 1, 1)
	.add('Black spear', 1, 1)
	.add('Black spear', 1, 1)
	.add('Adamant dagger(p)', 1, 1)
	.add('Black med helm', 1, 7)
	.add('Studded chaps', 1, 5)
	.add('Steel chainbody', 1, 5)
	.add('Mithril med helm', 1, 3)
	.add('Steel kiteshield', 1, 2)
	.add('Nature rune', [10, 29], 15)
	.add('Chaos rune', [10, 29], 11)
	.add('Willow logs', [5, 14], 10)
	.add('Adamantite bar', 3, 6)
	.add('Amulet of strength', 1, 6)
	.add('Clue scroll (medium)', 1, 3)
	.add('Emerald ring', 1, 2);

const BlackChest = new LootTable({ limit: 140 })
	.tertiary(61, 'Black locks')
	.tertiary(61, SplitBarkScrollsTable)
	.every('Swamp paste', [25, 40])
	.add('Coins', [1, 1000])
	.add('Staff of air', 1, 1)
	.add('Staff of water', 1, 1)
	.add('Staff of earth', 1, 1)
	.add('Staff of fire', 1, 1)
	.add('Mithril 2h sword', 1, 2)
	.add('Mithril warhammer', 1, 2)
	.add('Mithril battleaxe', 1, 2)
	.add('Mithril longsword', 1, 6)
	.add('Mithril scimitar', 1, 2)
	.add('Adamant scimitar', 1, 2)
	.add('Adamant mace', 1, 6)
	.add('Adamant sword', 1, 2)
	.add('Adamant axe', 1, 6)
	.add('Black spear', 1, 4)
	.add('Black battleaxe', 1, 3)
	.add('Black 2h sword', 1, 2)
	.add('Steel platebody', 1, 2)
	.add('Black chainbody', 1, 5)
	.add('Black kiteshield', 1, 6)
	.add('Black sq shield', 1, 9)
	.add('Black platelegs', 1, 2)
	.add('Black plateskirt', 1, 2)
	.add('Black full helm', 1, 3)
	.add('Mithril kiteshield', 1, 2)
	.add('Mithril sq shield', 1, 4)
	.add('Mithril full helm', 1, 6)
	.add('Mithril platelegs', 1, 2)
	.add('Mithril chainbody', 1, 2)
	.add('Adamant med helm', 1, 2)
	.add('Fine cloth', 1, 7)
	.add('Ruby ring', 1, 7)
	.add('Amulet of magic', 1, 2)
	.add('Nature rune', [10, 29], 6.6)
	.add('Death rune', [10, 29], 4.4)
	.add('Willow logs', [5, 14], 9)
	.add('Yew logs', [5, 14], 6)
	.add('Clue scroll (medium)', 1, 4)
	.add('Flamtaer hammer', 1, 1);

const SilverChest = new LootTable({ limit: 154 })
	.tertiary(61, 'Silver locks')
	.tertiary(54, SplitBarkScrollsTable)
	.every('Swamp paste', [25, 40])
	.add('Fine cloth', 1, 16)
	.add('Flamtaer hammer', 1, 11)
	.add('Amulet of the damned (full)', 1, 10)
	.add('Clue scroll (hard)', 1, 2)
	.add('Adamant spear', 1, 11)
	.add('Adamant spear(p)', 1, 11)
	.add('Battlestaff', 1, 9)
	.add('Black spear', 1, 6)
	.add('Rune sword', 1, 3)
	.add('Adamant warhammer', 1, 3)
	.add('Adamant battleaxe', 1, 3)
	.add('Adamant 2h sword', 1, 3)
	.add('Adamant longsword', 1, 3)
	.add('Rune scimitar', 1, 2)
	.add('Rune longsword', 1, 1)
	.add('Black platebody', 1, 4)
	.add('Mithril plateskirt', 1, 4)
	.add('Rune med helm', 1, 3)
	.add('Adamant chainbody', 1, 3)
	.add('Adamant platelegs', 1, 3)
	.add('Adamant plateskirt', 1, 3)
	.add('Adamant kiteshield', 1, 3)
	.add('Adamant platebody', 1, 2)
	.add('Adamant sq shield', 1, 2)
	.add('Mithril platebody', 1, 2)
	.add('Rune chainbody', 1, 1)
	.add('Death rune', [10, 30], 9)
	.add('Diamond ring', 1, 6)
	.add('Blood rune', [10, 30], 6)
	.add('Yew logs', [5, 10], 3)
	.add('Amulet of power', 1, 2)
	.add('Magic logs', [5, 10], 2)
	.add('Coins', [1, 2326]);

const GoldChest = new LootTable({ limit: 143 })
	.every('Swamp paste', [40, 70])
	.tertiary(61, 'Gold locks')
	.tertiary(54, SplitBarkScrollsTable)

	.add('Battlestaff', 3, 11)
	.add('Adamant spear', 1, 7)
	.add('Adamant spear(p)', 1, 6)
	.add('Rune longsword', 1, 5)
	.add('Rune sword', 1, 3)
	.add('Adamant longsword', 1, 3)
	.add('Rune scimitar', 1, 3)
	.add('Dragon dagger', 1, 2)
	.add('Dragon longsword', 1, 1)
	.add('Dragon mace', 1, 1)

	.add('Adamant full helm', 1, 8)
	.add('Mithril plateskirt', 1, 5)
	.add('Adamant chainbody', 1, 4)
	.add('Rune med helm', 1, 3)
	.add('Adamant platelegs', 1, 3)
	.add('Adamant plateskirt', 1, 3)
	.add('Adamant platebody', 1, 3)
	.add('Adamant kiteshield', 1, 2)
	.add('Rune chainbody', 1, 2)
	.add('Rune platebody', 1, 2)
	.add('Rune platelegs', 1, 2)
	.add('Rune plateskirt', 1, 2)

	.add('Fine cloth', 1, 21)
	.add('Death rune', [10, 29], 9)
	.add('Amulet of the damned (full)', 1, 6)
	.add('Soul rune', [10, 29], 6)
	.add('Flamtaer hammer', 1, 4)
	.add('Yew logs', [5, 14], 3)
	.add('Dragonstone ring', 1, 3)
	.add('Redwood logs', [5, 14], 2)
	.add('Dragonstone', 1, 2)
	.add('Clue scroll (elite)', 1, 1)
	.add('Coins', [1, 3, 160]);

const chests = [
	{
		name: 'Bronze chest',
		table: BronzeChest,
		items: resolveItems([
			'Bronze key red',
			'Bronze key brown',
			'Bronze key crimson',
			'Bronze key black',
			'Bronze key purple'
		])
	},
	{
		name: 'Steel chest',
		table: SteelChest,
		items: resolveItems([
			'Steel key red',
			'Steel key brown',
			'Steel key crimson',
			'Steel key black',
			'Steel key purple'
		])
	},
	{
		name: 'Black chest',
		table: BlackChest,
		items: resolveItems([
			'Black key red',
			'Black key brown',
			'Black key crimson',
			'Black key black',
			'Black key purple'
		])
	},
	{
		name: 'Silver chest',
		table: SilverChest,
		items: resolveItems([
			'Silver key red',
			'Silver key brown',
			'Silver key crimson',
			'Silver key black',
			'Silver key purple'
		])
	},
	{
		name: 'Gold chest',
		table: GoldChest,
		items: resolveItems(['Gold key red', 'Gold key brown', 'Gold key crimson', 'Gold key black', 'Gold key purple'])
	}
] as const;

export const zealOutfit = resolveItems([
	"Zealot's boots",
	"Zealot's helm",
	"Zealot's robe bottom",
	"Zealot's robe top"
]);

export function openShadeChest({ item, qty, allItemsOwned }: { allItemsOwned: Bank; item: Item; qty: number }) {
	const chest = chests.find(i => i.items.includes(item.id));
	if (!chest) throw new Error(`No chest found for item ${item.name}.`);
	const loot = new Bank();
	const effectiveOwnedItems = allItemsOwned.clone();

	for (let i = 0; i < qty; i++) {
		const thisLoot = chest.table.roll();
		if (!effectiveOwnedItems.has('Flamtaer bag') && roll(2)) {
			thisLoot.add('Flamtaer bag');
		}

		if (chest.name === 'Gold chest') {
			const unownedPieces = zealOutfit.filter(i => !effectiveOwnedItems.has(i));
			if (unownedPieces.length > 0 && roll(128)) {
				thisLoot.add(unownedPieces[0]);
			}
		}

		loot.add(thisLoot);

		effectiveOwnedItems.add(thisLoot);
	}
	return { bank: loot };
}

export const shadeChestOpenables: UnifiedOpenable[] = [];

for (const chest of chests) {
	for (const key of chest.items) {
		const keyItem = getOSItem(key);
		shadeChestOpenables.push({
			name: keyItem.name,
			id: keyItem.id,
			openedItem: keyItem,
			aliases: [keyItem.name.toLowerCase()],
			output: async args =>
				openShadeChest({
					item: args.self.openedItem,
					allItemsOwned: args.user.allItemsOwned,
					qty: args.quantity
				}),
			allItems: chest.table.allItems
		});
	}
}
