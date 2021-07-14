import { blisterwoodRequirements, ivandisRequirements } from '../minions/data/templeTrekking';
import { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
import { ItemBank } from '../types';
import { itemNameFromID, resolveNameBank } from '../util';
import itemID from '../util/itemID';
import { ChambersOfXericMetamorphPets } from './CollectionsExport';
import { capeCreatables } from './creatables/capes';
import { dragonFireShieldCreatables } from './creatables/dragonfireShields';
import { ornamentKits } from './creatables/ornaments';
import { slayerCreatables } from './creatables/slayer';

export interface Createable {
	name: string;
	outputItems: ItemBank;
	inputItems: ItemBank;
	cantHaveItems?: ItemBank;
	requiredSkills?: Record<string, number>;
	QPRequired?: number;
	noCl?: boolean;
	GPCost?: number;
	cantBeInCL?: boolean;
	requiredSlayerUnlocks?: SlayerTaskUnlocksEnum[];
}

const metamorphPetCreatables: Createable[] = ChambersOfXericMetamorphPets.map(pet => ({
	name: itemNameFromID(pet)!,
	inputItems: {
		[itemID('Metamorphic dust')]: 1
	},
	outputItems: {
		[pet]: 1
	}
}));

const twistedAncestral: Createable[] = [
	{
		name: 'Twisted ancestral hat',
		inputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		outputItems: {
			[itemID('Twisted ancestral hat')]: 1
		}
	},
	{
		name: 'Twisted ancestral robe top',
		inputItems: {
			[itemID('Ancestral robe top')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		outputItems: {
			[itemID('Twisted ancestral robe top')]: 1
		}
	},
	{
		name: 'Twisted ancestral robe bottom',
		inputItems: {
			[itemID('Ancestral robe bottom')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		outputItems: {
			[itemID('Twisted ancestral robe bottom')]: 1
		}
	},
	{
		name: 'Revert ancestral robe bottom',
		inputItems: {
			[itemID('Twisted ancestral robe bottom')]: 1
		},
		outputItems: {
			[itemID('Ancestral robe bottom')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert ancestral robe top',
		inputItems: {
			[itemID('Twisted ancestral robe top')]: 1
		},
		outputItems: {
			[itemID('Ancestral robe top')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert ancestral hat',
		inputItems: {
			[itemID('Twisted ancestral hat')]: 1
		},
		outputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Twisted ancestral colour kit')]: 1
		},
		noCl: true
	}
];

const crystalTools: Createable[] = [
	{
		name: 'Crystal pickaxe',
		inputItems: {
			[itemID('Dragon pickaxe')]: 1,
			[itemID('Crystal tool seed')]: 1,
			[itemID('Crystal shard')]: 120
		},
		outputItems: {
			[itemID('Crystal pickaxe')]: 1
		},
		requiredSkills: { smithing: 76, crafting: 76 },
		QPRequired: 150
	},
	{
		name: 'Crystal harpoon',
		inputItems: {
			[itemID('Dragon harpoon')]: 1,
			[itemID('Crystal tool seed')]: 1,
			[itemID('Crystal shard')]: 120
		},
		outputItems: {
			[itemID('Crystal harpoon')]: 1
		},
		requiredSkills: { smithing: 76, crafting: 76 },
		QPRequired: 150
	},
	{
		name: 'Crystal axe',
		inputItems: {
			[itemID('Dragon axe')]: 1,
			[itemID('Crystal tool seed')]: 1,
			[itemID('Crystal shard')]: 120
		},
		outputItems: {
			[itemID('Crystal axe')]: 1
		},
		requiredSkills: { smithing: 76, crafting: 76 },
		QPRequired: 150
	},
	{
		name: 'Enhanced crystal key',
		inputItems: {
			[itemID('Crystal key')]: 1,
			[itemID('Crystal shard')]: 10
		},
		outputItems: {
			[itemID('Enhanced crystal key')]: 1
		},
		requiredSkills: { smithing: 80, crafting: 80 },
		QPRequired: 150
	},
	{
		name: 'Blade of saeldor (c)',
		inputItems: {
			[itemID('Blade of saeldor (inactive)')]: 1,
			[itemID('Crystal shard')]: 1000
		},
		outputItems: {
			[itemID('Blade of saeldor (c)')]: 1
		},
		requiredSkills: { smithing: 80, crafting: 80 },
		QPRequired: 150
	}
];

const hunterClothing: Createable[] = [
	{
		name: 'Polar camouflage gear',
		inputItems: resolveNameBank({ 'Polar kebbit fur': 4 }),
		outputItems: resolveNameBank({ 'Polar camo top': 1, 'Polar camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Woodland camouflage gear',
		inputItems: resolveNameBank({ 'Common kebbit fur': 4 }),
		outputItems: resolveNameBank({ 'Wood camo top': 1, 'Wood camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Jungle camouflage gear',
		inputItems: resolveNameBank({ 'Feldip weasel fur': 4 }),
		outputItems: resolveNameBank({ 'Jungle camo top': 1, 'Jungle camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Desert camouflage gear',
		inputItems: resolveNameBank({ 'Desert devil fur': 4 }),
		outputItems: resolveNameBank({ 'Desert camo top': 1, 'Desert camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Larupia hunter gear',
		inputItems: resolveNameBank({ 'Larupia fur': 1, 'Tatty larupia fur': 2 }),
		outputItems: resolveNameBank({ 'Larupia hat': 1, 'Larupia top': 1, 'Larupia legs': 1 }),
		GPCost: 700
	},
	{
		name: 'Graahk hunter gear',
		inputItems: resolveNameBank({ 'Graahk fur': 1, 'Tatty graahk fur': 2 }),
		outputItems: resolveNameBank({ 'Graahk headdress': 1, 'Graahk top': 1, 'Graahk legs': 1 }),
		GPCost: 1000
	},
	{
		name: 'Kyatt hunter gear',
		inputItems: resolveNameBank({ 'Kyatt fur': 1, 'Tatty kyatt fur': 2 }),
		outputItems: resolveNameBank({ 'Kyatt hat': 1, 'Kyatt top': 1, 'Kyatt legs': 1 }),
		GPCost: 1400
	},
	{
		name: 'Spotted cape',
		inputItems: resolveNameBank({ 'Spotted kebbit fur': 2 }),
		outputItems: resolveNameBank({ 'Spotted cape': 1 }),
		GPCost: 400
	},
	{
		name: 'Spottier cape',
		inputItems: resolveNameBank({ 'Dashing kebbit fur': 2 }),
		outputItems: resolveNameBank({ 'Spottier cape': 1 }),
		GPCost: 800
	},
	{
		name: 'Gloves of silence',
		inputItems: resolveNameBank({ 'Dark kebbit fur': 2 }),
		outputItems: resolveNameBank({ 'Gloves of silence': 1 }),
		GPCost: 600
	}
];

const Createables: Createable[] = [
	{
		name: 'Godsword blade',
		inputItems: {
			[itemID('Godsword shard 1')]: 1,
			[itemID('Godsword shard 2')]: 1,
			[itemID('Godsword shard 3')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1
		},
		requiredSkills: { smithing: 80 }
	},
	{
		name: 'Armadyl godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Armadyl hilt')]: 1
		},
		outputItems: {
			[itemID('Armadyl godsword')]: 1
		}
	},
	{
		name: 'Bandos godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Bandos hilt')]: 1
		},
		outputItems: {
			[itemID('Bandos godsword')]: 1
		}
	},
	{
		name: 'Saradomin godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Saradomin hilt')]: 1
		},
		outputItems: {
			[itemID('Saradomin godsword')]: 1
		}
	},
	{
		name: 'Zamorak godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Zamorak hilt')]: 1
		},
		outputItems: {
			[itemID('Zamorak godsword')]: 1
		}
	},
	{
		name: 'Infernal pickaxe',
		inputItems: {
			[itemID('Dragon pickaxe')]: 1,
			[itemID('Smouldering stone')]: 1
		},
		outputItems: {
			[itemID('Infernal pickaxe')]: 1
		},
		requiredSkills: { smithing: 85 }
	},
	{
		name: 'Malediction ward',
		inputItems: {
			[itemID('Malediction shard 1')]: 1,
			[itemID('Malediction shard 2')]: 1,
			[itemID('Malediction shard 3')]: 1
		},
		outputItems: {
			[itemID('Malediction ward')]: 1
		}
	},
	{
		name: 'Odium ward',
		inputItems: {
			[itemID('Odium shard 1')]: 1,
			[itemID('Odium shard 2')]: 1,
			[itemID('Odium shard 3')]: 1
		},
		outputItems: {
			[itemID('Odium ward')]: 1
		}
	},
	{
		name: 'Crystal key',
		inputItems: {
			[itemID('Loop half of key')]: 1,
			[itemID('Tooth half of key')]: 1
		},
		outputItems: {
			[itemID('Crystal key')]: 1
		}
	},
	{
		name: "Verac's armour set",
		inputItems: {
			[itemID("Verac's helm")]: 1,
			[itemID("Verac's brassard")]: 1,
			[itemID("Verac's plateskirt")]: 1,
			[itemID("Verac's flail")]: 1
		},
		outputItems: {
			[itemID("Verac's armour set")]: 1
		}
	},
	{
		name: 'Veracs',
		inputItems: {
			[itemID("Verac's armour set")]: 1
		},
		outputItems: {
			[itemID("Verac's helm")]: 1,
			[itemID("Verac's brassard")]: 1,
			[itemID("Verac's plateskirt")]: 1,
			[itemID("Verac's flail")]: 1
		},
		noCl: true
	},
	{
		name: "Dharok's armour set",
		inputItems: {
			[itemID("Dharok's helm")]: 1,
			[itemID("Dharok's platebody")]: 1,
			[itemID("Dharok's platelegs")]: 1,
			[itemID("Dharok's greataxe")]: 1
		},
		outputItems: {
			[itemID("Dharok's armour set")]: 1
		}
	},
	{
		name: 'Dharoks',
		inputItems: {
			[itemID("Dharok's armour set")]: 1
		},
		outputItems: {
			[itemID("Dharok's helm")]: 1,
			[itemID("Dharok's platebody")]: 1,
			[itemID("Dharok's platelegs")]: 1,
			[itemID("Dharok's greataxe")]: 1
		},
		noCl: true
	},
	{
		name: "Guthan's armour set",
		inputItems: {
			[itemID("Guthan's helm")]: 1,
			[itemID("Guthan's platebody")]: 1,
			[itemID("Guthan's chainskirt")]: 1,
			[itemID("Guthan's warspear")]: 1
		},
		outputItems: {
			[itemID("Guthan's armour set")]: 1
		},
		noCl: true
	},
	{
		name: 'Guthans',
		inputItems: {
			[itemID("Guthan's armour set")]: 1
		},
		outputItems: {
			[itemID("Guthan's helm")]: 1,
			[itemID("Guthan's platebody")]: 1,
			[itemID("Guthan's chainskirt")]: 1,
			[itemID("Guthan's warspear")]: 1
		},
		noCl: true
	},
	{
		name: "Ahrim's armour set",
		inputItems: {
			[itemID("Ahrim's hood")]: 1,
			[itemID("Ahrim's robetop")]: 1,
			[itemID("Ahrim's robeskirt")]: 1,
			[itemID("Ahrim's staff")]: 1
		},
		outputItems: {
			[itemID("Ahrim's armour set")]: 1
		},
		noCl: true
	},
	{
		name: 'Ahrims',
		inputItems: {
			[itemID("Ahrim's armour set")]: 1
		},
		outputItems: {
			[itemID("Ahrim's hood")]: 1,
			[itemID("Ahrim's robetop")]: 1,
			[itemID("Ahrim's robeskirt")]: 1,
			[itemID("Ahrim's staff")]: 1
		},
		noCl: true
	},
	{
		name: "Torag's armour set",
		inputItems: {
			[itemID("Torag's helm")]: 1,
			[itemID("Torag's platebody")]: 1,
			[itemID("Torag's platelegs")]: 1,
			[itemID("Torag's hammers")]: 1
		},
		outputItems: {
			[itemID("Torag's armour set")]: 1
		}
	},
	{
		name: 'Torags',
		inputItems: {
			[itemID("Torag's armour set")]: 1
		},
		outputItems: {
			[itemID("Torag's helm")]: 1,
			[itemID("Torag's platebody")]: 1,
			[itemID("Torag's platelegs")]: 1,
			[itemID("Torag's hammers")]: 1
		},
		noCl: true
	},
	{
		name: "Karil's armour set",
		inputItems: {
			[itemID("Karil's coif")]: 1,
			[itemID("Karil's leathertop")]: 1,
			[itemID("Karil's leatherskirt")]: 1,
			[itemID("Karil's crossbow")]: 1
		},
		outputItems: {
			[itemID("Karil's armour set")]: 1
		}
	},
	{
		name: 'Karils',
		inputItems: {
			[itemID("Karil's armour set")]: 1
		},
		outputItems: {
			[itemID("Karil's coif")]: 1,
			[itemID("Karil's leathertop")]: 1,
			[itemID("Karil's leatherskirt")]: 1,
			[itemID("Karil's crossbow")]: 1
		},
		noCl: true
	},
	/**
	 * Prospector outfit
	 */
	{
		name: 'Prospector helmet',
		outputItems: {
			[itemID('Prospector helmet')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 40
		}
	},
	{
		name: 'Prospector jacket',
		outputItems: {
			[itemID('Prospector jacket')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 60
		}
	},
	{
		name: 'Prospector legs',
		outputItems: {
			[itemID('Prospector legs')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 50
		}
	},
	{
		name: 'Prospector boots',
		outputItems: {
			[itemID('Prospector boots')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 30
		}
	},
	{
		name: 'Coal bag',
		outputItems: {
			[itemID('Coal bag')]: 1
		},
		inputItems: {
			[itemID('Golden nugget')]: 100
		}
	},
	{
		name: 'Mining gloves',
		outputItems: {
			[itemID('Mining gloves')]: 1
		},
		inputItems: {
			[itemID('Unidentified minerals')]: 60
		}
	},
	{
		name: 'Superior mining gloves',
		outputItems: {
			[itemID('Superior mining gloves')]: 1
		},
		inputItems: {
			[itemID('Unidentified minerals')]: 120
		}
	},
	{
		name: 'Expert mining gloves',
		outputItems: {
			[itemID('Expert mining gloves')]: 1
		},
		inputItems: {
			[itemID('Superior mining gloves')]: 1,
			[itemID('Mining gloves')]: 1,
			[itemID('Unidentified minerals')]: 60
		}
	},
	{
		name: 'Master clue',
		inputItems: {
			[itemID('Clue scroll (easy)')]: 1,
			[itemID('Clue scroll (medium)')]: 1,
			[itemID('Clue scroll (hard)')]: 1,
			[itemID('Clue scroll (elite)')]: 1
		},
		outputItems: {
			[itemID('Clue scroll (master)')]: 1
		},
		cantHaveItems: {
			[itemID('Clue scroll (master)')]: 1
		}
	},
	{
		name: 'Infernal axe',
		inputItems: {
			[itemID('Dragon axe')]: 1,
			[itemID('Smouldering stone')]: 1
		},
		outputItems: {
			[itemID('Infernal axe')]: 1
		},
		requiredSkills: { firemaking: 85 }
	},
	{
		name: 'Infernal harpoon',
		inputItems: {
			[itemID('Dragon harpoon')]: 1,
			[itemID('Smouldering stone')]: 1
		},
		outputItems: {
			[itemID('Infernal harpoon')]: 1
		},
		requiredSkills: { cooking: 85, fishing: 75 }
	},
	{
		name: 'Graceful',
		inputItems: {
			[itemID('Mark of grace')]: 260
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		}
	},
	{
		name: 'Graceful hood',
		inputItems: {
			[itemID('Mark of grace')]: 35
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		}
	},
	{
		name: 'Graceful top',
		inputItems: {
			[itemID('Mark of grace')]: 55
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		}
	},
	{
		name: 'Graceful legs',
		inputItems: {
			[itemID('Mark of grace')]: 60
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		}
	},
	{
		name: 'Graceful gloves',
		inputItems: {
			[itemID('Mark of grace')]: 30
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		}
	},
	{
		name: 'Graceful boots',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		}
	},
	{
		name: 'Graceful cape',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		}
	},
	{
		name: 'Hell cat ears',
		inputItems: {
			[itemID('Cat ears')]: 1,
			[itemID('Red dye')]: 1
		},
		outputItems: {
			[itemID('Hell cat ears')]: 1
		},
		cantHaveItems: {
			[itemID('Hell cat ears')]: 1
		}
	},
	/** Runecrafting Pouches */
	{
		name: 'Small pouch',
		inputItems: {
			[itemID('Leather')]: 10
		},
		outputItems: {
			[itemID('Small pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Small pouch')]: 1
		}
	},
	{
		name: 'Medium pouch',
		inputItems: {
			[itemID('Leather')]: 20
		},
		outputItems: {
			[itemID('Medium pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Medium pouch')]: 1
		},

		requiredSkills: { crafting: 10 }
	},
	{
		name: 'Large pouch',
		inputItems: {
			[itemID('Leather')]: 30
		},
		outputItems: {
			[itemID('Large pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Large pouch')]: 1
		},

		requiredSkills: { crafting: 20 }
	},
	{
		name: 'Giant pouch',
		inputItems: {
			[itemID('Leather')]: 40
		},
		outputItems: {
			[itemID('Giant pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Giant pouch')]: 1
		},

		requiredSkills: { crafting: 30 }
	},
	// Spirit Shields
	{
		name: 'Blessed spirit shield',
		inputItems: {
			[itemID('Spirit shield')]: 1,
			[itemID('Holy elixir')]: 1
		},
		outputItems: {
			[itemID('Blessed spirit shield')]: 1
		},
		requiredSkills: { prayer: 85 }
	},
	{
		name: 'Spectral spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Spectral sigil')]: 1
		},
		outputItems: {
			[itemID('Spectral spirit shield')]: 1
		},
		requiredSkills: { prayer: 90, smithing: 85 }
	},
	{
		name: 'Arcane spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Arcane sigil')]: 1
		},
		outputItems: {
			[itemID('Arcane spirit shield')]: 1
		},
		requiredSkills: { prayer: 90, smithing: 85 }
	},
	{
		name: 'Elysian spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Elysian sigil')]: 1
		},
		outputItems: {
			[itemID('Elysian spirit shield')]: 1
		},
		requiredSkills: { prayer: 90, smithing: 85 }
	},
	{
		name: 'Holy book',
		inputItems: resolveNameBank({
			'Saradomin page 1': 1,
			'Saradomin page 2': 1,
			'Saradomin page 3': 1,
			'Saradomin page 4': 1
		}),
		outputItems: resolveNameBank({
			'Holy book': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of balance',
		inputItems: resolveNameBank({
			'Guthix page 1': 1,
			'Guthix page 2': 1,
			'Guthix page 3': 1,
			'Guthix page 4': 1
		}),
		outputItems: resolveNameBank({
			'Book of balance': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Unholy book',
		inputItems: resolveNameBank({
			'Zamorak page 1': 1,
			'Zamorak page 2': 1,
			'Zamorak page 3': 1,
			'Zamorak page 4': 1
		}),
		outputItems: resolveNameBank({
			'Unholy book': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of law',
		inputItems: resolveNameBank({
			'Armadyl page 1': 1,
			'Armadyl page 2': 1,
			'Armadyl page 3': 1,
			'Armadyl page 4': 1
		}),
		outputItems: resolveNameBank({
			'Book of law': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of war',
		inputItems: resolveNameBank({
			'Bandos page 1': 1,
			'Bandos page 2': 1,
			'Bandos page 3': 1,
			'Bandos page 4': 1
		}),
		outputItems: resolveNameBank({
			'Book of war': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of darkness',
		inputItems: resolveNameBank({
			'Ancient page 1': 1,
			'Ancient page 2': 1,
			'Ancient page 3': 1,
			'Ancient page 4': 1
		}),
		outputItems: resolveNameBank({
			'Book of darkness': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: "Ava's accumulator",
		inputItems: resolveNameBank({
			'Steel arrow': 75
		}),
		outputItems: resolveNameBank({
			"Ava's accumulator": 1
		}),
		QPRequired: 30
	},
	{
		name: "Ava's assembler",
		inputItems: resolveNameBank({
			'Mithril arrow': 75,
			"Ava's accumulator": 1,
			"Vorkath's head": 1
		}),
		outputItems: resolveNameBank({
			"Ava's assembler": 1
		}),
		QPRequired: 205
	},
	{
		name: 'Dragon sq shield',
		inputItems: resolveNameBank({
			'Shield right half': 1,
			'Shield left half': 1
		}),
		outputItems: resolveNameBank({
			'Dragon sq shield': 1
		}),
		QPRequired: 111,
		requiredSkills: { smithing: 60 }
	},
	{
		name: 'Coconut milk',
		inputItems: resolveNameBank({
			Vial: 1,
			Coconut: 1
		}),
		outputItems: resolveNameBank({
			'Coconut milk': 1,
			'Coconut shell': 1
		})
	},
	{
		name: 'Zamorakian hasta',
		inputItems: resolveNameBank({
			'Zamorakian spear': 1
		}),
		outputItems: resolveNameBank({
			'Zamorakian hasta': 1
		}),
		QPRequired: 3,
		requiredSkills: {
			fishing: 55,
			firemaking: 35,
			crafting: 11,
			smithing: 5
		},
		GPCost: 300_000
	},
	{
		name: 'Zamorakian spear',
		inputItems: resolveNameBank({
			'Zamorakian hasta': 1
		}),
		outputItems: resolveNameBank({
			'Zamorakian spear': 1
		}),
		noCl: true
	},
	{
		name: 'Ultracompost',
		inputItems: resolveNameBank({
			Supercompost: 1,
			'Volcanic ash': 2
		}),
		outputItems: resolveNameBank({
			Ultracompost: 1
		})
	},
	{
		name: 'Tomatoes(5)',
		inputItems: resolveNameBank({
			Tomato: 5
		}),
		outputItems: resolveNameBank({
			'Tomatoes(5)': 1
		})
	},
	{
		name: 'Tomato',
		inputItems: resolveNameBank({
			'Tomatoes(5)': 1
		}),
		outputItems: resolveNameBank({
			Tomato: 5
		})
	},
	{
		name: 'Apples(5)',
		inputItems: resolveNameBank({
			'Cooking apple': 5
		}),
		outputItems: resolveNameBank({
			'Apples(5)': 1
		})
	},
	{
		name: 'Cooking apple',
		inputItems: resolveNameBank({
			'Apples(5)': 1
		}),
		outputItems: resolveNameBank({
			'Cooking Apple': 5
		})
	},
	{
		name: 'Bananas(5)',
		inputItems: resolveNameBank({
			Banana: 5
		}),
		outputItems: resolveNameBank({
			'Bananas(5)': 1
		})
	},
	{
		name: 'Banana',
		inputItems: resolveNameBank({
			'Bananas(5)': 1
		}),
		outputItems: resolveNameBank({
			Banana: 5
		})
	},
	{
		name: 'Strawberries(5)',
		inputItems: resolveNameBank({
			Strawberry: 5
		}),
		outputItems: resolveNameBank({
			'Strawberries(5)': 1
		})
	},
	{
		name: 'Strawberry',
		inputItems: resolveNameBank({
			'Strawberries(5)': 1
		}),
		outputItems: resolveNameBank({
			Strawberry: 5
		})
	},
	{
		name: 'Oranges(5)',
		inputItems: resolveNameBank({
			Orange: 5
		}),
		outputItems: resolveNameBank({
			'Oranges(5)': 1
		})
	},
	{
		name: 'Orange',
		inputItems: resolveNameBank({
			'Oranges(5)': 1
		}),
		outputItems: resolveNameBank({
			Orange: 5
		})
	},
	{
		name: 'Potatoes(10)',
		inputItems: resolveNameBank({
			Potato: 10
		}),
		outputItems: resolveNameBank({
			'Potatoes(10)': 1
		})
	},
	{
		name: 'Potato',
		inputItems: resolveNameBank({
			'Potatoes(10)': 1
		}),
		outputItems: resolveNameBank({
			Potato: 10
		})
	},
	{
		name: 'Onions(10)',
		inputItems: resolveNameBank({
			Onion: 10
		}),
		outputItems: resolveNameBank({
			'Onions(10)': 1
		})
	},
	{
		name: 'Onion',
		inputItems: resolveNameBank({
			'Onions(10)': 1
		}),
		outputItems: resolveNameBank({
			Onion: 10
		})
	},
	{
		name: 'Cabbages(10)',
		inputItems: resolveNameBank({
			Cabbage: 10
		}),
		outputItems: resolveNameBank({
			'Cabbages(10)': 1
		})
	},
	{
		name: 'Cabbage',
		inputItems: resolveNameBank({
			'Cabbages(10)': 1
		}),
		outputItems: resolveNameBank({
			Cabbage: 10
		})
	},
	/* {
		name: 'Toxic blowpipe (empty)',
		inputItems: {
			[itemID('Toxic blowpipe')]: 1
		},
		outputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		}
	}, */
	// Nightmare
	{
		name: 'Eldritch nightmare staff',
		inputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Eldritch orb': 1
		}),
		outputItems: resolveNameBank({
			'Eldritch nightmare staff': 1
		})
	},
	{
		name: 'Harmonised nightmare staff',
		inputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Harmonised orb': 1
		}),
		outputItems: resolveNameBank({
			'Harmonised nightmare staff': 1
		})
	},
	{
		name: 'Volatile nightmare staff',
		inputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Volatile orb': 1
		}),
		outputItems: resolveNameBank({
			'Volatile nightmare staff': 1
		})
	},
	{
		name: 'Volatile orb',
		outputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Volatile orb': 1
		}),
		inputItems: resolveNameBank({
			'Volatile nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: 'Harmonised orb',
		outputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Harmonised orb': 1
		}),
		inputItems: resolveNameBank({
			'Harmonised nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: 'Eldritch orb',
		outputItems: resolveNameBank({
			'Nightmare staff': 1,
			'Eldritch orb': 1
		}),
		inputItems: resolveNameBank({
			'Eldritch nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: "Inquisitor's",
		inputItems: resolveNameBank({
			"Inquisitor's armour set": 1
		}),
		outputItems: resolveNameBank({
			"Inquisitor's great helm": 1,
			"Inquisitor's hauberk": 1,
			"Inquisitor's plateskirt": 1
		}),
		noCl: true
	},
	{
		name: "Inquisitor's armour set",
		inputItems: resolveNameBank({
			"Inquisitor's great helm": 1,
			"Inquisitor's hauberk": 1,
			"Inquisitor's plateskirt": 1
		}),
		outputItems: resolveNameBank({
			"Inquisitor's armour set": 1
		})
	},
	{
		name: "Zamorak's grapes",
		inputItems: resolveNameBank({
			Grapes: 1,
			"Bologa's blessing": 1
		}),
		outputItems: {
			[itemID("Zamorak's grapes")]: 1
		}
	},
	{
		name: "Toad's legs",
		inputItems: resolveNameBank({
			'Swamp toad': 1
		}),
		outputItems: {
			[itemID("Toad's legs")]: 1
		}
	},
	{
		name: 'Pegasian boots',
		inputItems: {
			[itemID('Pegasian crystal')]: 1,
			[itemID('Ranger boots')]: 1
		},
		outputItems: {
			[itemID('Pegasian boots')]: 1
		},
		requiredSkills: { magic: 60, runecraft: 60 }
	},
	{
		name: 'Primordial boots',
		inputItems: {
			[itemID('Primordial crystal')]: 1,
			[itemID('Dragon boots')]: 1
		},
		outputItems: {
			[itemID('Primordial boots')]: 1
		},
		requiredSkills: { magic: 60, runecraft: 60 }
	},
	{
		name: 'Eternal boots',
		inputItems: {
			[itemID('Eternal crystal')]: 1,
			[itemID('Infinity boots')]: 1
		},
		outputItems: {
			[itemID('Eternal boots')]: 1
		},
		requiredSkills: { magic: 60, runecraft: 60 }
	},
	{
		name: 'Kodai wand',
		inputItems: {
			[itemID('Master wand')]: 1,
			[itemID('Kodai insignia')]: 1
		},
		outputItems: {
			[itemID('Kodai wand')]: 1
		}
	},
	{
		name: 'Partyhat & specs',
		inputItems: {
			[itemID('Blue partyhat')]: 1,
			[itemID('Sagacious spectacles')]: 1
		},
		outputItems: {
			[itemID('Partyhat & specs')]: 1
		}
	},
	{
		name: 'Blue partyhat',
		inputItems: {
			[itemID('Partyhat & specs')]: 1
		},
		outputItems: {
			[itemID('Blue partyhat')]: 1,
			[itemID('Sagacious spectacles')]: 1
		},
		noCl: true
	},
	{
		name: 'Ivandis Flail',
		inputItems: {
			[itemID('Silver sickle')]: 1,
			[itemID('Emerald')]: 1
		},
		outputItems: {
			[itemID('Ivandis flail')]: 1
		},
		QPRequired: 75,
		requiredSkills: ivandisRequirements
	},
	{
		name: 'Blisterwood Flail',
		inputItems: {
			[itemID('Ivandis flail')]: 1,
			[itemID('Ruby')]: 1
		},
		outputItems: {
			[itemID('Blisterwood flail')]: 1
		},
		QPRequired: 125,
		requiredSkills: blisterwoodRequirements
	},
	{
		name: 'Revert red decorative full helm',
		inputItems: {
			[itemID('Red decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 5
		}
	},

	{
		name: 'Revert red decorative helm',
		inputItems: {
			[itemID('Red decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 4
		}
	},
	{
		name: 'Revert red decorative body',
		inputItems: {
			[itemID('Red decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 8
		}
	},
	{
		name: 'Revert red decorative legs',
		inputItems: {
			[itemID('Red decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		}
	},
	{
		name: 'Revert red decorative skirt',
		inputItems: {
			[itemID('Red decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		}
	},
	{
		name: 'Revert red decorative boots',
		inputItems: {
			[itemID('Red decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 4
		}
	},
	{
		name: 'Revert red decorative shield',
		inputItems: {
			[itemID('Red decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		}
	},
	{
		name: 'Revert red decorative sword',
		inputItems: {
			[itemID('Red decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 5
		}
	},
	{
		name: 'Revert white decorative full helm',
		inputItems: {
			[itemID('White decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 50
		}
	},
	{
		name: 'Revert white decorative helm',
		inputItems: {
			[itemID('White decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		}
	},
	{
		name: 'Revert white decorative body',
		inputItems: {
			[itemID('White decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 80
		}
	},
	{
		name: 'Revert white decorative legs',
		inputItems: {
			[itemID('White decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		}
	},
	{
		name: 'Revert white decorative skirt',
		inputItems: {
			[itemID('White decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		}
	},
	{
		name: 'Revert white decorative boots',
		inputItems: {
			[itemID('White decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		}
	},
	{
		name: 'Revert white decorative shield',
		inputItems: {
			[itemID('White decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		}
	},
	{
		name: 'Revert white decorative sword',
		inputItems: {
			[itemID('White decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 50
		}
	},
	{
		name: 'Revert gold decorative full helm',
		inputItems: {
			[itemID('Gold decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 500
		}
	},
	{
		name: 'Revert gold decorative helm',
		inputItems: {
			[itemID('Gold decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 400
		}
	},
	{
		name: 'Revert gold decorative body',
		inputItems: {
			[itemID('Gold decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 800
		}
	},
	{
		name: 'Revert gold decorative legs',
		inputItems: {
			[itemID('Gold decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		}
	},
	{
		name: 'Revert gold decorative skirt',
		inputItems: {
			[itemID('Gold decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		}
	},
	{
		name: 'Revert gold decorative boots',
		inputItems: {
			[itemID('Gold decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 400
		}
	},
	{
		name: 'Revert gold decorative shield',
		inputItems: {
			[itemID('Gold decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		}
	},
	{
		name: 'Revert gold decorative sword',
		inputItems: {
			[itemID('Gold decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 500
		}
	},
	{
		name: 'Revert zamorak castlewars hood',
		inputItems: {
			[itemID('Zamorak castlewars hood')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		}
	},
	{
		name: 'Revert zamorak castlewars cloak',
		inputItems: {
			[itemID('Zamorak castlewars cloak')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		}
	},
	{
		name: 'Revert saradomin castlewars hood',
		inputItems: {
			[itemID('Saradomin castlewars hood')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		}
	},
	{
		name: 'Revert saradomin castlewars cloak',
		inputItems: {
			[itemID('Saradomin castlewars cloak')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		}
	},
	{
		name: 'Revert saradomin banner',
		inputItems: {
			[itemID('Saradomin banner')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 100
		}
	},
	{
		name: 'Revert zamorak banner',
		inputItems: {
			[itemID('Zamorak banner')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 100
		}
	},
	{
		name: 'Revert decorative magic hat',
		inputItems: {
			[itemID('Decorative magic hat')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 20
		}
	},
	{
		name: 'Revert decorative magic top',
		inputItems: {
			[itemID('Decorative magic top')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		}
	},
	{
		name: 'Revert decorative magic robe',
		inputItems: {
			[itemID('Decorative magic robe')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 30
		}
	},
	{
		name: 'Revert decorative ranged top',
		inputItems: {
			[itemID('Decorative ranged top')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		}
	},

	{
		name: 'Revert decorative ranged legs',
		inputItems: {
			[itemID('Decorative ranged legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 30
		}
	},
	{
		name: 'Revert decorative quiver',
		inputItems: {
			[itemID('Decorative quiver')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		}
	},
	{
		name: 'Revert saradomin halo',
		inputItems: {
			[itemID('Saradomin halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		}
	},
	{
		name: 'Revert zamorak halo',
		inputItems: {
			[itemID('Zamorak halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		}
	},
	{
		name: 'Revert guthix halo',
		inputItems: {
			[itemID('Guthix halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		}
	},
	{
		name: 'Spirit angler headband',
		inputItems: {
			[itemID('Angler hat')]: 1,
			[itemID('Spirit flakes')]: 1200
		},
		outputItems: {
			[itemID('Spirit angler headband')]: 1
		}
	},
	{
		name: 'Spirit angler top',
		inputItems: {
			[itemID('Angler top')]: 1,
			[itemID('Spirit flakes')]: 1200
		},
		outputItems: {
			[itemID('Spirit angler top')]: 1
		}
	},
	{
		name: 'Spirit angler waders',
		inputItems: {
			[itemID('Angler waders')]: 1,
			[itemID('Spirit flakes')]: 1200
		},
		outputItems: {
			[itemID('Spirit angler waders')]: 1
		}
	},
	{
		name: 'Spirit angler boots',
		inputItems: {
			[itemID('Angler boots')]: 1,
			[itemID('Spirit flakes')]: 1200
		},
		outputItems: {
			[itemID('Spirit angler boots')]: 1
		}
	},
	{
		name: 'Bottled dragonbreath',
		inputItems: resolveNameBank({
			Dragonfruit: 10,
			Vial: 1
		}),
		outputItems: {
			[itemID('Bottled dragonbreath')]: 1
		},
		requiredSkills: {
			slayer: 62
		}
	},
	...crystalTools,
	...ornamentKits,
	...hunterClothing,
	...twistedAncestral,
	...metamorphPetCreatables,
	...slayerCreatables,
	...capeCreatables,
	...dragonFireShieldCreatables
];

export default Createables;
