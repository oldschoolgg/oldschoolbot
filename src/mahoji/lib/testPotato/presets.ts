import { Bank, ItemGroups, Items, MAX_INT_JAVA, resolveItems } from 'oldschooljs';

import { allStashUnitsFlat, allStashUnitTiers } from '@/lib/clues/stashUnits.js';
import { spiritAnglerOutfit } from '@/lib/data/CollectionsExport.js';
import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '@/lib/data/cox.js';
import { leaguesCreatables } from '@/lib/data/creatables/leagueCreatables.js';
import { Eatables } from '@/lib/data/eatables.js';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '@/lib/data/tob.js';
import potions from '@/lib/minions/data/potions.js';
import { allOpenables } from '@/lib/openables.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { Gear } from '@/lib/structures/Gear.js';
import { shades, shadesLogs } from '@/mahoji/lib/abstracted_commands/shadesOfMortonCommand.js';
import { allUsableItems } from '@/mahoji/lib/abstracted_commands/useCommand.js';

const coloMelee = new Gear();
for (const gear of Items.resolveItems([
	'Torva full helm',
	'Infernal cape',
	'Amulet of blood fury',
	'Torva platebody',
	'Torva platelegs',
	'Primordial boots',
	'Ultor ring',
	'Scythe of vitur'
])) {
	coloMelee.equip(Items.getOrThrow(gear));
}

const coloRange = new Gear();
for (const gear of Items.resolveItems([
	"Dizana's quiver",
	'Masori mask (f)',
	'Necklace of anguish',
	'Masori body (f)',
	'Masori chaps (f)',
	'Pegasian boots',
	'Venator ring',
	'Dragon arrow',
	'Twisted bow'
])) {
	coloRange.equip(Items.getOrThrow(gear));
}

export const gearPresets = [
	{
		name: 'Cox',
		melee: COXMaxMeleeGear,
		mage: COXMaxMageGear,
		range: COXMaxRangeGear
	},
	{
		name: 'ToB',
		melee: TOBMaxMeleeGear,
		mage: TOBMaxMageGear,
		range: TOBMaxRangeGear
	},
	{
		name: 'Colosseum',
		melee: coloMelee,
		range: coloRange,
		mage: coloRange
	}
];

const openablesBank = new Bank();
for (const i of allOpenables.values()) {
	openablesBank.add(i.id, 100);
}

const equippablesBank = new Bank();
for (const i of Items.filter(item => Boolean(item.equipment) && Boolean(item.equipable)).values()) {
	if (ItemGroups.allUnobtainableItems.includes(i.id)) continue;
	equippablesBank.add(i.id);
}

const farmingPreset = new Bank();
for (const plant of Farming.Plants) {
	farmingPreset.add(plant.inputItems.clone().multiply(100));
	if (plant.protectionPayment) {
		farmingPreset.add(plant.protectionPayment.clone().multiply(100));
	}
}
farmingPreset.add('Ultracompost', 10_000);

export const usables = new Bank();
for (const usable of allUsableItems) usables.add(usable, 100);

const leaguesPreset = new Bank();
for (const a of leaguesCreatables) leaguesPreset.add(a.outputItems);

const allStashUnitItems = new Bank();
for (const unit of allStashUnitsFlat) {
	for (const i of [unit.items].flat(2)) {
		allStashUnitItems.add(i);
	}
}
for (const tier of allStashUnitTiers) {
	allStashUnitItems.add(tier.cost.clone().multiply(tier.units.length));
}

export const potionsPreset = new Bank();
for (const potion of potions) {
	for (const actualPotion of potion.items) {
		potionsPreset.addItem(actualPotion, 100_000);
	}
}

export const foodPreset = new Bank();
for (const food of Eatables.map(eatable => eatable.id)) {
	foodPreset.addItem(food, 100_000);
}

const anglerOutfit = resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']);
const fishingPreset = new Bank()
	.add('Fish sack barrel')
	.add('Fish barrel')
	.add("Rada's blessing 4")
	.add('Shark lure', MAX_INT_JAVA)
	.add('Feather', MAX_INT_JAVA)
	.add('Fishing bait', MAX_INT_JAVA)
	.add('Raw karambwanji', MAX_INT_JAVA)
	.add('Fishing bait', MAX_INT_JAVA)
	.add('Sandworms', MAX_INT_JAVA)
	.add('Spirit flakes', MAX_INT_JAVA)
	.add('Crystal shard', MAX_INT_JAVA)
	.add('Stripy feather', MAX_INT_JAVA)
	.add('Pearl fly fishing rod')
	.add('Pearl fishing rod')
	.add('Fly fishing rod')
	.add('Fishing rod')
	.add('Oily fishing rod')
	.add('Crystal harpoon')
	.add('Infernal harpoon')
	.add('Dark fishing bait', MAX_INT_JAVA);
for (const anglerPiece of [...spiritAnglerOutfit, ...anglerOutfit]) {
	fishingPreset.add(anglerPiece);
}

export const runePreset = new Bank()
	.add('Air rune', MAX_INT_JAVA)
	.add('Mind rune', MAX_INT_JAVA)
	.add('Water rune', MAX_INT_JAVA)
	.add('Earth rune', MAX_INT_JAVA)
	.add('Fire rune', MAX_INT_JAVA)
	.add('Body rune', MAX_INT_JAVA)
	.add('Cosmic rune', MAX_INT_JAVA)
	.add('Chaos rune', MAX_INT_JAVA)
	.add('Nature rune', MAX_INT_JAVA)
	.add('Law rune', MAX_INT_JAVA)
	.add('Death rune', MAX_INT_JAVA)
	.add('Astral rune', MAX_INT_JAVA)
	.add('Blood rune', MAX_INT_JAVA)
	.add('Soul rune', MAX_INT_JAVA)
	.add('Dust rune', MAX_INT_JAVA)
	.add('Lava rune', MAX_INT_JAVA)
	.add('Mist rune', MAX_INT_JAVA)
	.add('Mud rune', MAX_INT_JAVA)
	.add('Smoke rune', MAX_INT_JAVA)
	.add('Steam rune', MAX_INT_JAVA);

const shadesPreset = new Bank().add('Olive oil(4)', 100_000).add('Sacred oil(4)', 100_000);
for (const log of shadesLogs) {
	shadesPreset.add(log.normalLog.id, 100_000);
	shadesPreset.add(log.oiledLog.id, 100_000);
}
for (const shade of shades) {
	shadesPreset.add(shade.item.id, 100_000);
	if (shade.lowMetalKeys) {
		for (const key of shade.lowMetalKeys.items) {
			if (!shadesPreset.has(key)) shadesPreset.add(key, 100_000);
		}
	}
	if (shade.highMetalKeys) {
		for (const key of shade.highMetalKeys.items) {
			if (!shadesPreset.has(key)) shadesPreset.add(key, 100_000);
		}
	}
}
for (const coffin of ['Bronze coffin', 'Steel coffin', 'Black coffin', 'Silver coffin', 'Gold coffin']) {
	shadesPreset.add(coffin, 1);
}

export const spawnPresets = [
	['fishing', fishingPreset],
	['openables', openablesBank],
	['random', new Bank()],
	['equippables', equippablesBank],
	['farming', farmingPreset],
	['usables', usables],
	['leagues', leaguesPreset],
	['stashunits', allStashUnitItems],
	['potions', potionsPreset],
	['food', foodPreset],
	['runes', runePreset],
	['shades', shadesPreset]
] as const;
