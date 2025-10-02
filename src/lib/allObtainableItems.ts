import { isFunction } from '@oldschoolgg/toolkit';
import { Bank, Implings, Items, Monsters } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import Buyables from '@/lib/data/buyables/buyables.js';
import { LMSBuyables } from '@/lib/data/CollectionsExport.js';
// import { armorAndItemPacks } from '@/lib/data/creatables/armorPacks.js';
// import Createables from '@/lib/data/createables.js';
import { ChewedBonesLootTable } from '@/lib/data/offerData.js';
import { growablePets } from '@/lib/growablePets.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { Planks } from '@/lib/minions/data/planks.js';
import { plunderRooms } from '@/lib/minions/data/plunder.js';
import Potions from '@/lib/minions/data/potions.js';
import { shadeChestOpenables } from '@/lib/shadesKeys.js';
import { Cookables } from '@/lib/skilling/skills/cooking/cooking.js';
import { allFarmingItems } from '@/lib/skilling/skills/farming/index.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import { Fletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
// import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
// import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
// import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
// import Runecraft from '@/lib/skilling/skills/runecraft.js';
// import Smithing from '@/lib/skilling/skills/smithing/index.js';
// import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
// import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';
// import { flowerTable } from '@/mahoji/lib/abstracted_commands/hotColdCommand.js';
// import { tipTable } from '@/tasks/minions/minigames/gnomeRestaurantActivity.js';

export const ALL_OBTAINABLE_ITEMS = new Set<number>();
const totalBankToAdd = new Bank();

for (const fletch of Fletchables) ALL_OBTAINABLE_ITEMS.add(fletch.id);

for (const item of Buyables) {
	totalBankToAdd.add(isFunction(item.outputItems) ? undefined : item.outputItems);
	const buyable = Items.get(item.name);
	if (buyable) totalBankToAdd.add(buyable);
}
for (const item of allFarmingItems) ALL_OBTAINABLE_ITEMS.add(item);
// for (const item of Createables) {
// 	if (isFunction(item.outputItems)) continue;
// 	totalBankToAdd.add(item.outputItems);
// }
// for (const item of armorAndItemPacks) {
// 	if (isFunction(item.outputItems)) continue;
// 	totalBankToAdd.add(item.outputItems);
// }

for (const i of Cookables) {
	ALL_OBTAINABLE_ITEMS.add(i.id);
	ALL_OBTAINABLE_ITEMS.add(i.burntCookable);
}
for (const pot of Potions) {
	for (const i of pot.items) ALL_OBTAINABLE_ITEMS.add(i);
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

for (const pet of growablePets) {
	for (const i of pet.stages) ALL_OBTAINABLE_ITEMS.add(i);
}

// for (const i of Craftables) ALL_OBTAINABLE_ITEMS.add(i.id);
// for (const i of allCLItems) ALL_OBTAINABLE_ITEMS.add(i);

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

for (const i of LMSBuyables) ALL_OBTAINABLE_ITEMS.add(i.item.id);
for (const i of ChewedBonesLootTable.allItems) ALL_OBTAINABLE_ITEMS.add(i);
for (const room of plunderRooms) {
	for (const item of room.roomTable.allItems) {
		ALL_OBTAINABLE_ITEMS.add(item);
	}
}
for (const plank of Planks) ALL_OBTAINABLE_ITEMS.add(plank.inputItem);
for (const impling of Implings) {
	impling.table.allItems.map(i => ALL_OBTAINABLE_ITEMS.add(i));
}

// for (const item of [
// 	Mining.GemRockTable.allItems,
// 	Mining.GraniteRockTable.allItems,
// 	Mining.SandstoneRockTable.allItems,
// 	Mining.Ores.map(i => i.id),
// 	RandomEvents.map(i => i.loot.allItems),
// 	RandomEvents.map(i => i.outfit),
// 	allOpenables.map(i => [i.allItems, i.id, i.openedItem.id]),
// 	RawJunkTable.allItems,
// 	trawlerFish.map(i => i.id),
// 	rewardsGuardianTable.allItems,
// 	resolveItems([
// 		...nonUniqueTable.map(i => i[0]),
// 		'Raw chompy',
// 		'Chompy chick',
// 		'Weeds',
// 		'Leaping salmon',
// 		'Leaping sturgeon',
// 		'Limestone'
// 	]),
// 	LowGambleTable.allItems,
// 	MediumGambleTable.allItems,
// 	HighGambleTable.allItems,
// 	EasyEncounterLoot.allItems,
// 	MediumEncounterLoot.allItems,
// 	HardEncounterLoot.allItems,
// 	Woodcutting.Logs.filter(i => i.lootTable).map(i => i.lootTable?.allItems)
// ]
// 	.flat(100)
// 	.filter(notEmpty)) {
// 	ALL_OBTAINABLE_ITEMS.add(item);
// }

// for (const castable of Castables) {
// 	if (!castable.output) continue;
// 	totalBankToAdd.add(castable.output);
// }

for (const i of totalBankToAdd.items()) ALL_OBTAINABLE_ITEMS.add(i[0].id);
