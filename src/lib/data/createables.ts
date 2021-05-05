import { ItemBank } from '../types';
import { resolveNameBank } from '../util';
import itemID from '../util/itemID';

interface Createable {
	name: string;
	outputItems: ItemBank;
	inputItems: ItemBank;
	cantHaveItems?: ItemBank;
	requiredSkills?: Record<string, number>;
	QPRequired?: number;
	noCl?: boolean;
	GPCost?: number;
	cantBeInCL?: boolean;
}

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
		name: 'Blade of saeldor (c)',
		inputItems: {
			[itemID('Blade of saeldor (inactive)')]: 1,
			[itemID('Crystal shard')]: 1000
		},
		outputItems: {
			[itemID('Blade of saeldor (c)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	}
];

const ornamentKits: Createable[] = [
	{
		name: 'Dragon defender (t)',
		inputItems: resolveNameBank({ 'Dragon defender': 1, 'Dragon defender ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Dragon defender (t)': 1 })
	},
	{
		name: 'Dragon defender',
		inputItems: resolveNameBank({ 'Dragon defender (t)': 1 }),
		outputItems: resolveNameBank({ 'Dragon defender': 1, 'Dragon defender ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Rune defender (t)',
		inputItems: resolveNameBank({ 'Rune defender': 1, 'Rune defender ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Rune defender (t)': 1 })
	},
	{
		name: 'Rune defender',
		inputItems: resolveNameBank({ 'Rune defender (t)': 1 }),
		outputItems: resolveNameBank({ 'Rune defender': 1, 'Rune defender ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Dragon pickaxe (or)',
		inputItems: resolveNameBank({ 'Dragon pickaxe': 1, 'Zalcano shard': 1 }),
		outputItems: resolveNameBank({ 'Dragon pickaxe (or)': 1 })
	},
	{
		name: 'Dragon pickaxe',
		inputItems: resolveNameBank({ 'Dragon pickaxe (or)': 1 }),
		outputItems: resolveNameBank({ 'Dragon pickaxe': 1, 'Zalcano shard': 1 }),
		noCl: true
	},
	{
		name: 'Dragon sq shield (g)',
		inputItems: resolveNameBank({ 'Dragon sq shield ornament kit': 1, 'Dragon sq shield': 1 }),
		outputItems: resolveNameBank({ 'Dragon sq shield (g)': 1 })
	},
	{
		name: 'Revert dragon sq shield',
		inputItems: resolveNameBank({ 'Dragon sq shield (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon sq shield ornament kit': 1, 'Dragon sq shield': 1 }),
		noCl: true
	},
	{
		name: 'Dragon platelegs (g)',
		inputItems: resolveNameBank({ 'Dragon platelegs': 1, 'Dragon legs/skirt ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Dragon platelegs (g)': 1 })
	},
	{
		name: 'Dragon platelegs',
		inputItems: resolveNameBank({ 'Dragon platelegs (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon platelegs': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dragon plateskirt (g)',
		inputItems: resolveNameBank({
			'Dragon plateskirt': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		outputItems: resolveNameBank({ 'Dragon plateskirt (g)': 1 })
	},
	{
		name: 'Dragon plateskirt',
		inputItems: resolveNameBank({ 'Dragon plateskirt (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon plateskirt': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dragon chainbody (g)',
		inputItems: resolveNameBank({
			'Dragon chainbody': 1,
			'Dragon chainbody ornament kit': 1
		}),
		outputItems: resolveNameBank({ 'Dragon chainbody (g)': 1 })
	},
	{
		name: 'Dragon chainbody',
		inputItems: resolveNameBank({ 'Dragon chainbody (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon chainbody': 1,
			'Dragon chainbody ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Amulet of fury (or)',
		inputItems: resolveNameBank({ 'Amulet of fury': 1, 'Fury ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Amulet of fury (or)': 1
		})
	},
	{
		name: 'Amulet of fury',
		inputItems: resolveNameBank({
			'Amulet of fury (or)': 1
		}),
		outputItems: resolveNameBank({ 'Amulet of fury': 1, 'Fury ornament kit': 1 }),
		noCl: true
	},
	// Godswords
	{
		name: 'Zamorak godsword (or)',
		inputItems: resolveNameBank({ 'Zamorak godsword': 1, 'Zamorak godsword ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Zamorak godsword (or)': 1
		})
	},
	{
		name: 'Revert zamorak godsword',
		inputItems: resolveNameBank({
			'Zamorak godsword (or)': 1
		}),
		outputItems: resolveNameBank({ 'Zamorak godsword': 1, 'Zamorak godsword ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Bandos godsword (or)',
		inputItems: resolveNameBank({ 'Bandos godsword': 1, 'Bandos godsword ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Bandos godsword (or)': 1
		})
	},
	{
		name: 'Revert bandos godsword',
		inputItems: resolveNameBank({
			'Bandos godsword (or)': 1
		}),
		outputItems: resolveNameBank({ 'Bandos godsword': 1, 'Bandos godsword ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Saradomin godsword (or)',
		inputItems: resolveNameBank({
			'Saradomin godsword': 1,
			'Saradomin godsword ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Saradomin godsword (or)': 1
		})
	},
	{
		name: 'Revert saradomin godsword',
		inputItems: resolveNameBank({
			'Saradomin godsword (or)': 1
		}),
		outputItems: resolveNameBank({
			'Saradomin godsword': 1,
			'Saradomin godsword ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Armadyl godsword (or)',
		inputItems: resolveNameBank({
			'Armadyl godsword': 1,
			'Armadyl godsword ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Armadyl godsword (or)': 1
		})
	},
	{
		name: 'Revert Armadyl godsword',
		inputItems: resolveNameBank({
			'Armadyl godsword (or)': 1
		}),
		outputItems: resolveNameBank({
			'Armadyl godsword': 1,
			'Armadyl godsword ornament kit': 1
		}),
		noCl: true
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
		name: 'Dragonfire shield',
		inputItems: {
			[itemID('Draconic visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			// Uncharged dragonfire shield
			11284: 1
		},
		requiredSkills: { smithing: 90 }
	},
	{
		name: 'Dragonfire ward',
		inputItems: {
			[itemID('Skeletal visage')]: 1,
			[itemID('Anti-dragon shield')]: 1
		},
		outputItems: {
			// Uncharged Dragonfire ward
			22003: 1
		},
		requiredSkills: { smithing: 90 }
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
		name: '	Harmonised nightmare staff',
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
		name: `Zamorak's grapes`,
		inputItems: resolveNameBank({
			Grapes: 1,
			"Bologa's blessing": 1
		}),
		outputItems: {
			[itemID(`Zamorak's grapes`)]: 1
		}
	},
	{
		name: `Toad's legs`,
		inputItems: resolveNameBank({
			'Swamp toad': 1
		}),
		outputItems: {
			[itemID(`Toad's legs`)]: 1
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
	...crystalTools,
	...ornamentKits,
	...hunterClothing,
	...twistedAncestral
];

export default Createables;
