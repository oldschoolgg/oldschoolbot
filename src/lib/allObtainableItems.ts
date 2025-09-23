import { isFunction, notEmpty } from '@oldschoolgg/toolkit';
import { Bank, Implings, Items, Monsters, resolveItems } from 'oldschooljs';

import { allFarmingItems } from '@/lib/skilling/skills/farming/index.js';
import { flowerTable } from '@/mahoji/lib/abstracted_commands/hotColdCommand.js';
import { tipTable } from '../tasks/minions/minigames/gnomeRestaurantActivity.js';
import { ClueTiers } from './clues/clueTiers.js';
import Buyables from './data/buyables/buyables.js';
import { allCLItems } from './data/Collections.js';
import { LMSBuyables } from './data/CollectionsExport.js';
import { armorAndItemPacks } from './data/creatables/armorPacks.js';
import Createables from './data/createables.js';
import { ChewedBonesLootTable } from './data/offerData.js';
import { growablePets } from './growablePets.js';
import killableMonsters from './minions/data/killableMonsters/index.js';
import { Planks } from './minions/data/planks.js';
import { plunderRooms } from './minions/data/plunder.js';
import Potions from './minions/data/potions.js';
import { EasyEncounterLoot, HardEncounterLoot, MediumEncounterLoot } from './minions/data/templeTrekking.js';
import { allOpenables } from './openables.js';
import { RandomEvents } from './randomEvents.js';
import { shadeChestOpenables } from './shadesKeys.js';
import { HighGambleTable, LowGambleTable, MediumGambleTable } from './simulation/baGamble.js';
import { RawJunkTable, trawlerFish } from './simulation/fishingTrawler.js';
import { rewardsGuardianTable } from './simulation/rewardsGuardian.js';
import { nonUniqueTable } from './simulation/toa.js';
import { Cookables } from './skilling/skills/cooking/cooking.js';
import { Craftables } from './skilling/skills/crafting/craftables/index.js';
import { Fishing } from './skilling/skills/fishing/fishing.js';
import { Fletchables } from './skilling/skills/fletching/fletchables/index.js';
import Herblore from './skilling/skills/herblore/herblore.js';
import Hunter from './skilling/skills/hunter/hunter.js';
import { Castables } from './skilling/skills/magic/castables.js';
import { Enchantables } from './skilling/skills/magic/enchantables.js';
import Mining from './skilling/skills/mining.js';
import Runecraft from './skilling/skills/runecraft.js';
import Smithing from './skilling/skills/smithing/index.js';
import { stealables } from './skilling/skills/thieving/stealables.js';
import Woodcutting from './skilling/skills/woodcutting/woodcutting.js';

export const ALL_OBTAINABLE_ITEMS = new Set<number>();
const totalBankToAdd = new Bank();

for (const log of Woodcutting.Logs) ALL_OBTAINABLE_ITEMS.add(log.id);
for (const fletch of Fletchables) ALL_OBTAINABLE_ITEMS.add(fletch.id);
for (const bar of Smithing.Bars) ALL_OBTAINABLE_ITEMS.add(bar.id);
for (const item of Smithing.SmithableItems) ALL_OBTAINABLE_ITEMS.add(item.id);
for (const item of Smithing.BlastableBars) ALL_OBTAINABLE_ITEMS.add(item.id);
for (const item of Buyables) {
	totalBankToAdd.add(isFunction(item.outputItems) ? undefined : item.outputItems);
	const buyable = Items.getOrThrow(item.name);
	if (buyable) totalBankToAdd.add(buyable);
}
for (const item of allFarmingItems) ALL_OBTAINABLE_ITEMS.add(item);
for (const item of Createables) totalBankToAdd.add(item.outputItems);
for (const item of armorAndItemPacks) totalBankToAdd.add(item.outputItems);
for (const item of Hunter.Creatures) {
	for (const i of item.table.allItems) ALL_OBTAINABLE_ITEMS.add(i);
}
for (const i of Cookables) {
	ALL_OBTAINABLE_ITEMS.add(i.id);
	ALL_OBTAINABLE_ITEMS.add(i.burntCookable);
}
for (const pot of Potions) {
	for (const i of pot.items) ALL_OBTAINABLE_ITEMS.add(i);
}
for (const a of Enchantables) {
	totalBankToAdd.add(a.output);
}
for (const fish of Fishing.Fishes) {
	ALL_OBTAINABLE_ITEMS.add(fish.id);
}
for (const clue of ClueTiers) {
	ALL_OBTAINABLE_ITEMS.add(clue.id);
	ALL_OBTAINABLE_ITEMS.add(clue.scrollID);
	if (clue.milestoneReward) ALL_OBTAINABLE_ITEMS.add(clue.milestoneReward.itemReward);
	for (const i of clue.allItems) ALL_OBTAINABLE_ITEMS.add(i);
}
for (const a of stealables) {
	for (const item of a.table.allItems) ALL_OBTAINABLE_ITEMS.add(item);
}
for (const pet of growablePets) {
	for (const i of pet.stages) ALL_OBTAINABLE_ITEMS.add(i);
}
for (const i of Herblore.Mixables) {
	ALL_OBTAINABLE_ITEMS.add(i.item.id);
}
for (const i of Craftables) ALL_OBTAINABLE_ITEMS.add(i.id);
for (const i of allCLItems) ALL_OBTAINABLE_ITEMS.add(i);

for (const monster of killableMonsters) {
	const mon = Monsters.get(monster.id);
	if (!mon) continue;
	for (const item of mon.allItems) {
		ALL_OBTAINABLE_ITEMS.add(item);
	}
}
for (const a of shadeChestOpenables) {
	for (const i of a.allItems) ALL_OBTAINABLE_ITEMS.add(i);
}

for (const i of flowerTable.allItems) ALL_OBTAINABLE_ITEMS.add(i);
for (const i of LMSBuyables) ALL_OBTAINABLE_ITEMS.add(i.item.id);
for (const i of Runecraft.Runes) ALL_OBTAINABLE_ITEMS.add(i.id);
for (const i of Runecraft.Tiaras) ALL_OBTAINABLE_ITEMS.add(i.id);
for (const i of ChewedBonesLootTable.allItems) ALL_OBTAINABLE_ITEMS.add(i);
for (const room of plunderRooms) {
	for (const item of room.roomTable.allItems) {
		ALL_OBTAINABLE_ITEMS.add(item);
	}
}
for (const item of tipTable.allItems) ALL_OBTAINABLE_ITEMS.add(item);
for (const plank of Planks) ALL_OBTAINABLE_ITEMS.add(plank.inputItem);
for (const impling of Implings) {
	impling.table.allItems.map(i => ALL_OBTAINABLE_ITEMS.add(i));
}

for (const item of [
	Mining.GemRockTable.allItems,
	Mining.GraniteRockTable.allItems,
	Mining.SandstoneRockTable.allItems,
	Mining.Ores.map(i => i.id),
	RandomEvents.map(i => i.loot.allItems),
	RandomEvents.map(i => i.outfit),
	allOpenables.map(i => [i.allItems, i.id, i.openedItem.id]),
	RawJunkTable.allItems,
	trawlerFish.map(i => i.id),
	rewardsGuardianTable.allItems,
	resolveItems([
		...nonUniqueTable.map(i => i[0]),
		'Raw chompy',
		'Chompy chick',
		'Weeds',
		'Leaping salmon',
		'Leaping sturgeon',
		'Limestone'
	]),
	LowGambleTable.allItems,
	MediumGambleTable.allItems,
	HighGambleTable.allItems,
	EasyEncounterLoot.allItems,
	MediumEncounterLoot.allItems,
	HardEncounterLoot.allItems,
	Woodcutting.Logs.filter(i => i.lootTable).map(i => i.lootTable?.allItems)
]
	.flat(100)
	.filter(notEmpty)) {
	ALL_OBTAINABLE_ITEMS.add(item);
}

for (const castable of Castables) {
	if (!castable.output) continue;
	totalBankToAdd.add(castable.output);
}

for (const i of totalBankToAdd.items()) ALL_OBTAINABLE_ITEMS.add(i[0].id);

// writeFileSync(
// 	'not_in_list_but_owned.txt',
// 	ids
// 		.filter(i => !ALL_OBTAINABLE_ITEMS.has(i))
// 		.map(Items.getOrThrow)
// 		.filter(i => i.tradeable)
// 		.map(i => i.name)
// 		.join('\n')
// );

// writeFileSync(
// 	'in_list_but_not_owned.txt',
// 	Array.from(ALL_OBTAINABLE_ITEMS.values())
// 		.filter(i => !ids.includes(i))
// 		.map(Items.getOrThrow)
// 		.filter(i => i.tradeable)
// 		.map(i => i.name)
// 		.join('\n')
// );
