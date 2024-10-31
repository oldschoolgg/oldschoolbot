import { Bank, EItem, deepResolveItems } from 'oldschooljs';

import { BitField } from '../constants';
import { blisterwoodRequirements, ivandisRequirements } from '../minions/data/templeTrekking';
import { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
import type { ItemBank, Skills } from '../types';
import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';
import { itemNameFromID } from '../util/smallUtils';
import { chambersOfXericMetamorphPets, tobMetamorphPets } from './CollectionsExport';
import { amrodCreatables } from './creatables/amrod';
import { armorAndItemPacks } from './creatables/armorPacks';
import { caCreatables } from './creatables/caCreatables';
import { capeCreatables } from './creatables/capes';
import { dragonFireShieldCreatables } from './creatables/dragonfireShields';
import { dtCreatables } from './creatables/dt';
import { forestryCreatables } from './creatables/forestryCreatables';
import { gracefulOutfitCreatables } from './creatables/gracefulOutfits';
import { guardiansOfTheRiftCreatables } from './creatables/guardiansOfTheRiftCreatables';
import { leaguesCreatables } from './creatables/leagueCreatables';
import { lmsCreatables } from './creatables/lms';
import { mysticStavesCreatables } from './creatables/mysticStaves';
import { nexCreatables } from './creatables/nex';
import { ornamentKits } from './creatables/ornaments';
import { shadesOfMortonCreatables } from './creatables/shadesOfMorton';
import { slayerCreatables } from './creatables/slayer';
import { toaCreatables } from './creatables/toa';
import { tobCreatables } from './creatables/tob';

export interface Createable {
	name: string;
	outputItems: ItemBank | Bank;
	inputItems: ItemBank | Bank;
	cantHaveItems?: ItemBank;
	requiredSkills?: Skills;
	QPRequired?: number;
	noCl?: boolean;
	forceAddToCl?: boolean;
	GPCost?: number;
	cantBeInCL?: boolean;
	requiredSlayerUnlocks?: SlayerTaskUnlocksEnum[];
	maxCanOwn?: number;
	onCreate?: (qty: number, user: MUser) => Promise<{ result: boolean; message: string }>;
	type?: 'pack' | 'unpack';
	customReq?: (user: MUser) => Promise<string | null>;
}

const bloodBarkPairs = [
	['Bloodbark helm', 'Splitbark helm', 250, 79],
	['Bloodbark body', 'Splitbark body', 500, 81],
	['Bloodbark legs', 'Splitbark legs', 500, 81],
	['Bloodbark boots', 'Splitbark boots', 100, 77],
	['Bloodbark gauntlets', 'Splitbark gauntlets', 100, 77]
] as const;

const bloodBarkCreatables: Createable[] = [];

for (const [bbPart, sbPart, bloodRunes, lvlReq] of bloodBarkPairs) {
	const bbItem = getOSItem(bbPart);
	const sbItem = getOSItem(sbPart);

	bloodBarkCreatables.push({
		name: bbItem.name,
		inputItems: new Bank().add(sbItem.id).add('Blood rune', bloodRunes),
		outputItems: new Bank().add(bbItem.id),
		requiredSkills: {
			runecraft: lvlReq
		},
		customReq: async (user: MUser) => {
			if (!user.bitfield.includes(BitField.HasBloodbarkScroll)) {
				return 'You need to have used a Runescroll of bloodbark to create this item!';
			}

			return null;
		}
	});
}

const swampBarkPairs = [
	['Swampbark helm', 'Splitbark helm', 250, 46],
	['Swampbark body', 'Splitbark body', 500, 48],
	['Swampbark legs', 'Splitbark legs', 500, 48],
	['Swampbark boots', 'Splitbark boots', 100, 42],
	['Swampbark gauntlets', 'Splitbark gauntlets', 100, 42]
] as const;

const swampBarkCreatables: Createable[] = [];

for (const [bbPart, sbPart, natRunes, lvlReq] of swampBarkPairs) {
	const bbItem = getOSItem(bbPart);
	const sbItem = getOSItem(sbPart);

	swampBarkCreatables.push({
		name: bbItem.name,
		inputItems: new Bank().add(sbItem.id).add('Nature rune', natRunes),
		outputItems: new Bank().add(bbItem.id),
		requiredSkills: {
			runecraft: lvlReq
		},
		customReq: async (user: MUser) => {
			if (!user.bitfield.includes(BitField.HasSwampbarkScroll)) {
				return 'You need to have used a Runescroll of Swampbark to create this item!';
			}

			return null;
		}
	});
}

const salveECustomReq: NonNullable<Createable['customReq']> = async user => {
	if (!user.owns("Tarn's diary")) {
		return "You need a 'Tarn's diary' to make this item.";
	}
	return null;
};

const goldenProspectorCreatables: Createable[] = [
	{
		name: 'Golden prospector boots',
		inputItems: new Bank({
			'Prospector boots': 1,
			'Star fragment': 1
		}),
		outputItems: new Bank({
			'Golden prospector boots': 1
		})
	},
	{
		name: 'Golden prospector helmet',
		inputItems: new Bank({
			'Prospector helmet': 1,
			'Star fragment': 1
		}),
		outputItems: new Bank({
			'Golden prospector helmet': 1
		})
	},
	{
		name: 'Golden prospector jacket',
		inputItems: new Bank({
			'Prospector jacket': 1,
			'Star fragment': 1
		}),
		outputItems: new Bank({
			'Golden prospector jacket': 1
		})
	},
	{
		name: 'Golden prospector legs',
		inputItems: new Bank({
			'Prospector legs': 1,
			'Star fragment': 1
		}),
		outputItems: new Bank({
			'Golden prospector legs': 1
		})
	}
];

const revWeapons: Createable[] = [
	{
		name: 'Bracelet of ethereum',
		inputItems: new Bank({
			'Bracelet of ethereum (uncharged)': 1,
			'Revenant ether': 2000
		}),
		outputItems: new Bank({
			'Bracelet of ethereum': 1
		})
	},
	{
		name: 'Revenant ether',
		inputItems: new Bank({
			'Bracelet of ethereum (uncharged)': 1
		}),
		outputItems: new Bank({
			'Revenant ether': 250
		}),
		noCl: true
	}
];

for (const [uWep, cWep, uUPWep, cUPWep] of [
	["Viggora's chainmace (u)", "Viggora's chainmace", 'Ursine chainmace (u)', 'Ursine chainmace'],
	["Craw's bow (u)", "Craw's bow", 'Webweaver bow (u)', 'Webweaver bow'],
	["Thammaron's sceptre (u)", "Thammaron's sceptre", 'Accursed sceptre (u)', 'Accursed sceptre']
]) {
	revWeapons.push({
		name: cWep,
		inputItems: {
			[itemID('Revenant ether')]: 7000,
			[itemID(uWep)]: 1
		},
		outputItems: {
			[itemID(cWep)]: 1
		}
	});
	revWeapons.push({
		name: `Revert ${cWep.toLowerCase()}`,
		inputItems: {
			[itemID(cWep)]: 1
		},
		outputItems: {
			[itemID('Revenant ether')]: 7000,
			[itemID(uWep)]: 1
		}
	});
	revWeapons.push({
		name: cUPWep,
		inputItems: {
			[itemID('Revenant ether')]: 7000,
			[itemID(uUPWep)]: 1
		},
		outputItems: {
			[itemID(cUPWep)]: 1
		}
	});
	revWeapons.push({
		name: `Revert ${cUPWep.toLowerCase()}`,
		inputItems: {
			[itemID(cUPWep)]: 1
		},
		outputItems: {
			[itemID('Revenant ether')]: 7000,
			[itemID(uUPWep)]: 1
		}
	});
	revWeapons.push({
		name: `Revert ${uWep.toLowerCase()}`,
		inputItems: {
			[itemID(uWep)]: 1
		},
		outputItems: {
			[itemID('Revenant ether')]: 7500
		}
	});
}

const metamorphPetCreatables: Createable[] = chambersOfXericMetamorphPets.map(pet => ({
	name: itemNameFromID(pet)!,
	inputItems: {
		[itemID('Metamorphic dust')]: 1
	},
	outputItems: {
		[pet]: 1
	}
}));

const tobMetamorphPetCreatables: Createable[] = tobMetamorphPets.map(pet => ({
	name: itemNameFromID(pet)!,
	inputItems: {
		[itemID('Sanguine dust')]: 1
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
		name: 'Revert twisted ancestral robe bottom',
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
		name: 'Revert twisted ancestral robe top',
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
		name: 'Revert twisted ancestral hat',
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
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Revert blade of saeldor (c)',
		inputItems: {
			[itemID('Blade of saeldor (c)')]: 1
		},
		outputItems: {
			[itemID('Blade of saeldor (inactive)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Bow of faerdhinen (c)',
		inputItems: {
			[itemID('Bow of faerdhinen (inactive)')]: 1,
			[itemID('Crystal shard')]: 2000
		},
		outputItems: {
			[itemID('Bow of faerdhinen (c)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Revert bow of faerdhinen (c)',
		inputItems: {
			[itemID('Bow of faerdhinen (c)')]: 1
		},
		outputItems: {
			[itemID('Bow of faerdhinen (inactive)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Blade of saeldor (inactive)',
		inputItems: {
			[itemID('Enhanced crystal weapon seed')]: 1,
			[itemID('Crystal shard')]: 100
		},
		outputItems: {
			[itemID('Blade of saeldor (inactive)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Revert blade of saeldor (inactive)',
		inputItems: {
			[itemID('Blade of saeldor (inactive)')]: 1,
			[itemID('Crystal shard')]: 250
		},
		outputItems: {
			[itemID('Enhanced crystal weapon seed')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Bow of faerdhinen (inactive)',
		inputItems: {
			[itemID('Enhanced crystal weapon seed')]: 1,
			[itemID('Crystal shard')]: 100
		},
		outputItems: {
			[itemID('Bow of faerdhinen (inactive)')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Revert bow of faerdhinen (inactive)',
		inputItems: {
			[itemID('Bow of faerdhinen (inactive)')]: 1,
			[itemID('Crystal shard')]: 250
		},
		outputItems: {
			[itemID('Enhanced crystal weapon seed')]: 1
		},
		requiredSkills: { smithing: 82, crafting: 82 },
		QPRequired: 150
	},
	{
		name: 'Crystal halberd',
		inputItems: new Bank({
			'Crystal weapon seed': 1,
			'Crystal shard': 40
		}),
		outputItems: {
			[itemID('Crystal halberd')]: 1
		},
		requiredSkills: { smithing: 78, crafting: 78 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Crystal bow',
		inputItems: new Bank({
			'Crystal weapon seed': 1,
			'Crystal shard': 40
		}),
		outputItems: {
			[itemID('Crystal bow')]: 1
		},
		requiredSkills: { smithing: 78, crafting: 78 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Crystal helm',
		inputItems: new Bank({
			'Crystal armour seed': 1,
			'Crystal shard': 150
		}),
		outputItems: {
			[itemID('Crystal helm')]: 1
		},
		requiredSkills: { smithing: 70, crafting: 70 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Crystal legs',
		inputItems: new Bank({
			'Crystal armour seed': 2,
			'Crystal shard': 300
		}),
		outputItems: {
			[itemID('Crystal legs')]: 1
		},
		requiredSkills: { smithing: 72, crafting: 72 },
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Crystal body',
		inputItems: new Bank({
			'Crystal armour seed': 3,
			'Crystal shard': 450
		}),
		outputItems: {
			[itemID('Crystal body')]: 1
		},
		requiredSkills: { smithing: 74, crafting: 74 },
		QPRequired: 150,
		noCl: true
	}
];

const hunterClothing: Createable[] = [
	{
		name: 'Polar camouflage gear',
		inputItems: new Bank({ 'Polar kebbit fur': 4 }),
		outputItems: new Bank({ 'Polar camo top': 1, 'Polar camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Woodland camouflage gear',
		inputItems: new Bank({ 'Common kebbit fur': 4 }),
		outputItems: new Bank({ 'Wood camo top': 1, 'Wood camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Jungle camouflage gear',
		inputItems: new Bank({ 'Feldip weasel fur': 4 }),
		outputItems: new Bank({ 'Jungle camo top': 1, 'Jungle camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Desert camouflage gear',
		inputItems: new Bank({ 'Desert devil fur': 4 }),
		outputItems: new Bank({ 'Desert camo top': 1, 'Desert camo legs': 1 }),
		GPCost: 40
	},
	{
		name: 'Larupia hunter gear',
		inputItems: new Bank({ 'Larupia fur': 1, 'Tatty larupia fur': 2 }),
		outputItems: new Bank({ 'Larupia hat': 1, 'Larupia top': 1, 'Larupia legs': 1 }),
		GPCost: 700
	},
	{
		name: 'Graahk hunter gear',
		inputItems: new Bank({ 'Graahk fur': 1, 'Tatty graahk fur': 2 }),
		outputItems: new Bank({ 'Graahk headdress': 1, 'Graahk top': 1, 'Graahk legs': 1 }),
		GPCost: 1000
	},
	{
		name: 'Kyatt hunter gear',
		inputItems: new Bank({ 'Kyatt fur': 1, 'Tatty kyatt fur': 2 }),
		outputItems: new Bank({ 'Kyatt hat': 1, 'Kyatt top': 1, 'Kyatt legs': 1 }),
		GPCost: 1400
	},
	{
		name: 'Spotted cape',
		inputItems: new Bank({ 'Spotted kebbit fur': 2 }),
		outputItems: new Bank({ 'Spotted cape': 1 }),
		GPCost: 400
	},
	{
		name: 'Spottier cape',
		inputItems: new Bank({ 'Dashing kebbit fur': 2 }),
		outputItems: new Bank({ 'Spottier cape': 1 }),
		GPCost: 800
	},
	{
		name: 'Gloves of silence',
		inputItems: new Bank({ 'Dark kebbit fur': 2 }),
		outputItems: new Bank({ 'Gloves of silence': 1 }),
		GPCost: 600
	}
];

const camdozaalItems: Createable[] = [
	{
		name: 'Barronite mace',
		inputItems: new Bank({
			'Barronite handle': 1,
			'Barronite guard': 1,
			'Barronite head': 1,
			'Barronite shards': 1500
		}),
		outputItems: new Bank({ 'Barronite mace	': 1 }),
		noCl: false
	},
	{
		name: 'Imcando hammer',
		inputItems: new Bank({ 'Imcando hammer (broken)': 1, 'Barronite shards': 1500 }),
		outputItems: new Bank({ 'Imcando hammer': 1 }),
		noCl: false
	}
];

const metamorphPets: Createable[] = [
	{
		name: 'Midnight',
		inputItems: {
			[itemID('Noon')]: 1
		},
		outputItems: {
			[itemID('Midnight')]: 1
		}
	},
	{
		name: 'Baby mole-rat',
		inputItems: {
			[itemID('Baby mole')]: 1,
			[itemID('Mole claw')]: 1
		},
		outputItems: {
			[itemID('Baby mole-rat')]: 1
		}
	},
	{
		name: 'Tzrek-zuk',
		inputItems: {
			[itemID('Jal-nib-rek')]: 1
		},
		outputItems: {
			[itemID('Tzrek-zuk')]: 1
		}
	},
	{
		name: 'Little parasite',
		inputItems: {
			[itemID('Parasitic egg')]: 1,
			[itemID('Little nightmare')]: 1
		},
		outputItems: {
			[itemID('Little parasite')]: 1
		}
	},
	{
		name: 'Ziggy',
		inputItems: {
			[itemID('Rocky')]: 1,
			[itemID('Poison ivy berries')]: 1
		},
		outputItems: {
			[itemID('Ziggy')]: 1
		}
	},
	{
		name: 'Red',
		inputItems: {
			[itemID('Rocky')]: 1,
			[itemID('Redberries')]: 1
		},
		outputItems: {
			[itemID('Red')]: 1
		}
	},
	{
		name: 'Great blue heron',
		inputItems: {
			[itemID('Heron')]: 1,
			[itemID('Spirit flakes')]: 3000
		},
		outputItems: {
			[itemID('Great blue heron')]: 1
		}
	},
	{
		name: 'Greatish guardian',
		inputItems: {
			[itemID('Rift guardian')]: 1,
			[itemID("Guardian's eye")]: 1
		},
		outputItems: {
			[itemID('Greatish guardian')]: 1
		}
	},
	{
		name: 'Dark squirrel',
		inputItems: {
			[itemID('Dark acorn')]: 1,
			[itemID('Giant squirrel')]: 1
		},
		outputItems: {
			[itemID('Dark squirrel')]: 1
		}
	},
	{
		name: 'Bone Squirrel',
		inputItems: {
			[itemID('Calcified acorn')]: 1,
			[itemID('Giant squirrel')]: 1
		},
		outputItems: {
			[itemID('Bone squirrel')]: 1
		}
	},
	{
		name: 'Corrupted youngllef',
		inputItems: new Bank().add('Youngllef').freeze(),
		outputItems: new Bank().add('Corrupted youngllef').freeze(),
		customReq: async user => {
			const [kcName, kcAmount] = await user.getKCByName('Corrupted gauntlet');
			if (kcAmount < 1) {
				return `You need to have at least 1 ${kcName} KC.`;
			}
			return null;
		}
	}
];

const revertMetamorphPets: Createable[] = [
	{
		name: 'Revert midnight',
		inputItems: {
			[itemID('Midnight')]: 1
		},
		outputItems: {
			[itemID('Noon')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert baby mole-rat',
		inputItems: {
			[itemID('Baby mole-rat')]: 1,
			[itemID('Mole skin')]: 1
		},
		outputItems: {
			[itemID('Baby mole')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert tzrek-zuk',
		inputItems: {
			[itemID('Tzrek-zuk')]: 1
		},
		outputItems: {
			[itemID('Jal-nib-rek')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert little parasite',
		inputItems: {
			[itemID('Little parasite')]: 1
		},
		outputItems: {
			[itemID('Little nightmare')]: 1,
			[itemID('Parasitic egg')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert ziggy',
		inputItems: {
			[itemID('Ziggy')]: 1,
			[itemID('White berries')]: 1
		},
		outputItems: {
			[itemID('Rocky')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert red',
		inputItems: {
			[itemID('Red')]: 1,
			[itemID('White berries')]: 1
		},
		outputItems: {
			[itemID('Rocky')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert great blue heron',
		inputItems: {
			[itemID('Great blue heron')]: 1
		},
		outputItems: {
			[itemID('Heron')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert greatish guardian',
		inputItems: {
			[itemID('Greatish guardian')]: 1
		},
		outputItems: {
			[itemID('Rift guardian')]: 1,
			[itemID("Guardian's eye")]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Dark squirrel',
		inputItems: {
			[itemID('Dark squirrel')]: 1
		},
		outputItems: {
			[itemID('Dark acorn')]: 1,
			[itemID('Giant squirrel')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Bone Squirrel',
		inputItems: {
			[itemID('Bone squirrel')]: 1
		},
		outputItems: {
			[itemID('Calcified acorn')]: 1,
			[itemID('Giant squirrel')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Corrupted youngllef',
		inputItems: new Bank().add('Corrupted youngllef').freeze(),
		outputItems: new Bank().add('Youngllef').freeze(),
		noCl: true
	}
];

const Reverteables: Createable[] = [
	{
		name: 'Revert tanzanite fang',
		inputItems: {
			[itemID('Tanzanite fang')]: 1
		},
		outputItems: {
			[itemID("Zulrah's scales")]: 20_000
		},
		noCl: true
	},
	{
		name: 'Revert toxic blowpipe (empty)',
		inputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1
		},
		outputItems: {
			[itemID("Zulrah's scales")]: 20_000
		},
		noCl: true
	},
	{
		name: 'Revert magic fang',
		inputItems: {
			[itemID('Magic fang')]: 1
		},
		outputItems: {
			[itemID("Zulrah's scales")]: 20_000
		},
		noCl: true
	},
	{
		name: 'Revert serpentine visage',
		inputItems: {
			[itemID('Serpentine visage')]: 1
		},
		outputItems: {
			[itemID("Zulrah's scales")]: 20_000
		},
		noCl: true
	},
	{
		name: 'Revert serpentine helm (uncharged)',
		inputItems: {
			[itemID('Serpentine helm (uncharged)')]: 1
		},
		outputItems: {
			[itemID("Zulrah's scales")]: 20_000
		},
		noCl: true
	},
	{
		name: 'Revert ancient icon',
		inputItems: {
			[itemID('Ancient icon')]: 1
		},
		outputItems: {
			[itemID('Ancient essence')]: 5000
		},
		noCl: true
	},
	{
		name: 'Revert venator shard',
		inputItems: {
			[itemID('Venator shard')]: 1
		},
		outputItems: {
			[itemID('Ancient essence')]: 50_000
		},
		noCl: true
	},
	{
		name: 'Revert volatile nightmare staff',
		outputItems: new Bank({
			'Nightmare staff': 1,
			'Volatile orb': 1
		}),
		inputItems: new Bank({
			'Volatile nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: 'Revert harmonised nightmare staff',
		outputItems: new Bank({
			'Nightmare staff': 1,
			'Harmonised orb': 1
		}),
		inputItems: new Bank({
			'Harmonised nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: 'Revert eldritch nightmare staff',
		outputItems: new Bank({
			'Nightmare staff': 1,
			'Eldritch orb': 1
		}),
		inputItems: new Bank({
			'Eldritch nightmare staff': 1
		}),
		noCl: true
	},
	{
		name: 'Revert red decorative full helm',
		inputItems: {
			[itemID('Red decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 5
		},
		noCl: true
	},
	{
		name: 'Revert red decorative helm',
		inputItems: {
			[itemID('Red decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 4
		},
		noCl: true
	},
	{
		name: 'Revert red decorative body',
		inputItems: {
			[itemID('Red decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 8
		},
		noCl: true
	},
	{
		name: 'Revert red decorative legs',
		inputItems: {
			[itemID('Red decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		},
		noCl: true
	},
	{
		name: 'Revert red decorative skirt',
		inputItems: {
			[itemID('Red decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		},
		noCl: true
	},
	{
		name: 'Revert red decorative boots',
		inputItems: {
			[itemID('Red decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 4
		},
		noCl: true
	},
	{
		name: 'Revert red decorative shield',
		inputItems: {
			[itemID('Red decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 6
		},
		noCl: true
	},
	{
		name: 'Revert red decorative sword',
		inputItems: {
			[itemID('Red decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 5
		},
		noCl: true
	},
	{
		name: 'Revert white decorative full helm',
		inputItems: {
			[itemID('White decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 50
		},
		noCl: true
	},
	{
		name: 'Revert white decorative helm',
		inputItems: {
			[itemID('White decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		},
		noCl: true
	},
	{
		name: 'Revert white decorative body',
		inputItems: {
			[itemID('White decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 80
		},
		noCl: true
	},
	{
		name: 'Revert white decorative legs',
		inputItems: {
			[itemID('White decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		},
		noCl: true
	},
	{
		name: 'Revert white decorative skirt',
		inputItems: {
			[itemID('White decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		},
		noCl: true
	},
	{
		name: 'Revert white decorative boots',
		inputItems: {
			[itemID('White decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		},
		noCl: true
	},
	{
		name: 'Revert white decorative shield',
		inputItems: {
			[itemID('White decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 60
		},
		noCl: true
	},
	{
		name: 'Revert white decorative sword',
		inputItems: {
			[itemID('White decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 50
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative full helm',
		inputItems: {
			[itemID('Gold decorative full helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 500
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative helm',
		inputItems: {
			[itemID('Gold decorative helm')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 400
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative body',
		inputItems: {
			[itemID('Gold decorative body')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 800
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative legs',
		inputItems: {
			[itemID('Gold decorative legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative skirt',
		inputItems: {
			[itemID('Gold decorative skirt')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative boots',
		inputItems: {
			[itemID('Gold decorative boots')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 400
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative shield',
		inputItems: {
			[itemID('Gold decorative shield')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 600
		},
		noCl: true
	},
	{
		name: 'Revert gold decorative sword',
		inputItems: {
			[itemID('Gold decorative sword')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 500
		},
		noCl: true
	},
	{
		name: 'Revert zamorak castlewars hood',
		inputItems: {
			[itemID('Zamorak castlewars hood')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		},
		noCl: true
	},
	{
		name: 'Revert zamorak castlewars cloak',
		inputItems: {
			[itemID('Zamorak castlewars cloak')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		},
		noCl: true
	},
	{
		name: 'Revert saradomin castlewars hood',
		inputItems: {
			[itemID('Saradomin castlewars hood')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		},
		noCl: true
	},
	{
		name: 'Revert saradomin castlewars cloak',
		inputItems: {
			[itemID('Saradomin castlewars cloak')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 10
		},
		noCl: true
	},
	{
		name: 'Revert saradomin banner',
		inputItems: {
			[itemID('Saradomin banner')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 100
		},
		noCl: true
	},
	{
		name: 'Revert zamorak banner',
		inputItems: {
			[itemID('Zamorak banner')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 100
		},
		noCl: true
	},
	{
		name: 'Revert decorative magic hat',
		inputItems: {
			[itemID('Decorative magic hat')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 20
		},
		noCl: true
	},
	{
		name: 'Revert decorative magic top',
		inputItems: {
			[itemID('Decorative magic top')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		},
		noCl: true
	},
	{
		name: 'Revert decorative magic robe',
		inputItems: {
			[itemID('Decorative magic robe')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 30
		},
		noCl: true
	},
	{
		name: 'Revert decorative ranged top',
		inputItems: {
			[itemID('Decorative ranged top')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		},
		noCl: true
	},
	{
		name: 'Revert decorative ranged legs',
		inputItems: {
			[itemID('Decorative ranged legs')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 30
		},
		noCl: true
	},
	{
		name: 'Revert decorative quiver',
		inputItems: {
			[itemID('Decorative quiver')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 40
		},
		noCl: true
	},
	{
		name: 'Revert saradomin halo',
		inputItems: {
			[itemID('Saradomin halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		},
		noCl: true
	},
	{
		name: 'Revert zamorak halo',
		inputItems: {
			[itemID('Zamorak halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		},
		noCl: true
	},
	{
		name: 'Revert guthix halo',
		inputItems: {
			[itemID('Guthix halo')]: 1
		},
		outputItems: {
			[itemID('Castle wars ticket')]: 75
		},
		noCl: true
	},
	{
		name: 'Revert partyhat & specs',
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
		name: 'Revert zamorakian hasta',
		inputItems: new Bank({
			'Zamorakian hasta': 1
		}),
		outputItems: new Bank({
			'Zamorakian spear': 1
		}),
		noCl: true
	},
	{
		name: 'Revert armadyl godsword',
		inputItems: {
			[itemID('Armadyl godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Armadyl hilt')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert bandos godsword',
		inputItems: {
			[itemID('Bandos godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Bandos hilt')]: 1
		}
	},
	{
		name: 'Revert saradomin godsword',
		inputItems: {
			[itemID('Saradomin godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Saradomin hilt')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert zamorak godsword',
		inputItems: {
			[itemID('Zamorak godsword')]: 1
		},
		outputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Zamorak hilt')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Fish sack barrel',
		inputItems: new Bank({
			[itemID('Fish sack barrel')]: 1
		}),
		outputItems: {
			[itemID('Fish sack')]: 1,
			[itemID('Fish barrel')]: 1
		},
		noCl: true
	},
	{
		name: "Revert xeric's talisman (inert)",
		inputItems: {
			[itemID("Xeric's talisman (inert)")]: 1
		},
		outputItems: {
			[itemID('Lizardman fang')]: 100
		},
		noCl: true
	},
	{
		name: "Revert Dizana's quiver (uncharged)",
		inputItems: new Bank().add("Dizana's quiver (uncharged)"),
		outputItems: new Bank().add('Sunfire splinters', 4000),
		noCl: true
	},
	...revertMetamorphPets
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
		},
		noCl: true
	},
	// Runecrafting Pouches
	{
		name: 'Small pouch',
		inputItems: {},
		outputItems: {
			[itemID('Small pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Small pouch')]: 1
		}
	},
	{
		name: 'Medium pouch',
		inputItems: {},
		outputItems: {
			[itemID('Medium pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Medium pouch')]: 1
		}
	},
	{
		name: 'Large pouch',
		inputItems: {},
		outputItems: {
			[itemID('Large pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Large pouch')]: 1
		}
	},
	{
		name: 'Giant pouch',
		inputItems: {},
		outputItems: {
			[itemID('Giant pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Giant pouch')]: 1
		}
	},
	{
		name: 'Colossal pouch',
		inputItems: {
			[itemID('Abyssal needle')]: 1,
			[itemID('Small pouch')]: 1,
			[itemID('Medium pouch')]: 1,
			[itemID('Large pouch')]: 1,
			[itemID('Giant pouch')]: 1
		},
		outputItems: {
			[itemID('Colossal pouch')]: 1
		},
		cantHaveItems: {
			[itemID('Colossal pouch')]: 1
		},
		requiredSkills: { runecraft: 85, crafting: 56 }
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
		inputItems: new Bank({
			'Saradomin page 1': 1,
			'Saradomin page 2': 1,
			'Saradomin page 3': 1,
			'Saradomin page 4': 1
		}),
		outputItems: new Bank({
			'Holy book': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of balance',
		inputItems: new Bank({
			'Guthix page 1': 1,
			'Guthix page 2': 1,
			'Guthix page 3': 1,
			'Guthix page 4': 1
		}),
		outputItems: new Bank({
			'Book of balance': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Unholy book',
		inputItems: new Bank({
			'Zamorak page 1': 1,
			'Zamorak page 2': 1,
			'Zamorak page 3': 1,
			'Zamorak page 4': 1
		}),
		outputItems: new Bank({
			'Unholy book': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of law',
		inputItems: new Bank({
			'Armadyl page 1': 1,
			'Armadyl page 2': 1,
			'Armadyl page 3': 1,
			'Armadyl page 4': 1
		}),
		outputItems: new Bank({
			'Book of law': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of war',
		inputItems: new Bank({
			'Bandos page 1': 1,
			'Bandos page 2': 1,
			'Bandos page 3': 1,
			'Bandos page 4': 1
		}),
		outputItems: new Bank({
			'Book of war': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: 'Book of darkness',
		inputItems: new Bank({
			'Ancient page 1': 1,
			'Ancient page 2': 1,
			'Ancient page 3': 1,
			'Ancient page 4': 1
		}),
		outputItems: new Bank({
			'Book of darkness': 1
		}),
		requiredSkills: { agility: 35 },
		QPRequired: 5
	},
	{
		name: "Ava's accumulator",
		inputItems: new Bank({
			'Steel arrow': 75
		}),
		outputItems: new Bank({
			"Ava's accumulator": 1
		}),
		QPRequired: 30
	},
	{
		name: "Ava's assembler",
		inputItems: new Bank({
			'Mithril arrow': 75,
			"Ava's accumulator": 1,
			"Vorkath's head": 1
		}),
		outputItems: new Bank({
			"Ava's assembler": 1
		}),
		QPRequired: 205
	},
	{
		name: 'Dragon sq shield',
		inputItems: new Bank({
			'Shield right half': 1,
			'Shield left half': 1
		}),
		outputItems: new Bank({
			'Dragon sq shield': 1
		}),
		QPRequired: 111,
		requiredSkills: { smithing: 60 }
	},
	{
		name: 'Dragon kiteshield',
		inputItems: new Bank({
			'Dragon sq shield': 1,
			'Dragon metal shard': 1,
			'Dragon metal slice': 1
		}),
		outputItems: new Bank({
			'Dragon kiteshield': 1
		}),
		QPRequired: 205,
		requiredSkills: { smithing: 75 }
	},
	{
		name: 'Dragon platebody',
		inputItems: new Bank({
			'Dragon chainbody': 1,
			'Dragon metal shard': 1,
			'Dragon metal lump': 1
		}),
		outputItems: new Bank({
			'Dragon platebody': 1
		}),
		QPRequired: 205,
		requiredSkills: { smithing: 90 }
	},
	{
		name: 'Coconut milk',
		inputItems: new Bank({
			Vial: 1,
			Coconut: 1
		}),
		outputItems: new Bank({
			'Coconut milk': 1,
			'Coconut shell': 1
		})
	},
	{
		name: 'Zamorakian hasta',
		inputItems: new Bank({
			'Zamorakian spear': 1
		}),
		outputItems: new Bank({
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
		name: 'Ultracompost',
		inputItems: new Bank({
			Supercompost: 1,
			'Volcanic ash': 2
		}),
		outputItems: new Bank({
			Ultracompost: 1
		})
	},
	{
		name: 'Tomatoes(5)',
		inputItems: new Bank({
			Tomato: 5
		}),
		outputItems: new Bank({
			'Tomatoes(5)': 1
		})
	},
	{
		name: 'Tomato',
		inputItems: new Bank({
			'Tomatoes(5)': 1
		}),
		outputItems: new Bank({
			Tomato: 5
		})
	},
	{
		name: 'Apples(5)',
		inputItems: new Bank({
			'Cooking apple': 5
		}),
		outputItems: new Bank({
			'Apples(5)': 1
		})
	},
	{
		name: 'Cooking apple',
		inputItems: new Bank({
			'Apples(5)': 1
		}),
		outputItems: new Bank({
			'Cooking Apple': 5
		})
	},
	{
		name: 'Bananas(5)',
		inputItems: new Bank({
			Banana: 5
		}),
		outputItems: new Bank({
			'Bananas(5)': 1
		})
	},
	{
		name: 'Banana',
		inputItems: new Bank({
			'Bananas(5)': 1
		}),
		outputItems: new Bank({
			Banana: 5
		})
	},
	{
		name: 'Strawberries(5)',
		inputItems: new Bank({
			Strawberry: 5
		}),
		outputItems: new Bank({
			'Strawberries(5)': 1
		})
	},
	{
		name: 'Strawberry',
		inputItems: new Bank({
			'Strawberries(5)': 1
		}),
		outputItems: new Bank({
			Strawberry: 5
		})
	},
	{
		name: 'Oranges(5)',
		inputItems: new Bank({
			Orange: 5
		}),
		outputItems: new Bank({
			'Oranges(5)': 1
		})
	},
	{
		name: 'Orange',
		inputItems: new Bank({
			'Oranges(5)': 1
		}),
		outputItems: new Bank({
			Orange: 5
		})
	},
	{
		name: 'Potatoes(10)',
		inputItems: new Bank({
			Potato: 10
		}),
		outputItems: new Bank({
			'Potatoes(10)': 1
		})
	},
	{
		name: 'Potato',
		inputItems: new Bank({
			'Potatoes(10)': 1
		}),
		outputItems: new Bank({
			Potato: 10
		})
	},
	{
		name: 'Onions(10)',
		inputItems: new Bank({
			Onion: 10
		}),
		outputItems: new Bank({
			'Onions(10)': 1
		})
	},
	{
		name: 'Onion',
		inputItems: new Bank({
			'Onions(10)': 1
		}),
		outputItems: new Bank({
			Onion: 10
		})
	},
	{
		name: 'Cabbages(10)',
		inputItems: new Bank({
			Cabbage: 10
		}),
		outputItems: new Bank({
			'Cabbages(10)': 1
		})
	},
	{
		name: 'Cabbage',
		inputItems: new Bank({
			'Cabbages(10)': 1
		}),
		outputItems: new Bank({
			Cabbage: 10
		})
	},
	{
		name: 'Bucket of sand (1kg)',
		inputItems: new Bank({
			'Sandstone (1kg)': 1,
			Bucket: 1
		}),
		outputItems: new Bank({
			'Bucket of sand': 1
		}),
		GPCost: 50
	},
	{
		name: 'Bucket of sand (2kg)',
		inputItems: new Bank({
			'Sandstone (2kg)': 1,
			Bucket: 2
		}),
		outputItems: new Bank({
			'Bucket of sand': 2
		}),
		GPCost: 100
	},
	{
		name: 'Bucket of sand (5kg)',
		inputItems: new Bank({
			'Sandstone (5kg)': 1,
			Bucket: 4
		}),
		outputItems: new Bank({
			'Bucket of sand': 4
		}),
		GPCost: 200
	},
	{
		name: 'Bucket of sand (10kg)',
		inputItems: new Bank({
			'Sandstone (10kg)': 1,
			Bucket: 8
		}),
		outputItems: new Bank({
			'Bucket of sand': 8
		}),
		GPCost: 400
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
	{
		name: 'Eldritch nightmare staff',
		inputItems: new Bank({
			'Nightmare staff': 1,
			'Eldritch orb': 1
		}),
		outputItems: new Bank({
			'Eldritch nightmare staff': 1
		})
	},
	{
		name: 'Harmonised nightmare staff',
		inputItems: new Bank({
			'Nightmare staff': 1,
			'Harmonised orb': 1
		}),
		outputItems: new Bank({
			'Harmonised nightmare staff': 1
		})
	},
	{
		name: 'Volatile nightmare staff',
		inputItems: new Bank({
			'Nightmare staff': 1,
			'Volatile orb': 1
		}),
		outputItems: new Bank({
			'Volatile nightmare staff': 1
		})
	},
	{
		name: "Zamorak's grapes",
		inputItems: new Bank({
			Grapes: 1,
			"Bologa's blessing": 1
		}),
		outputItems: {
			[itemID("Zamorak's grapes")]: 1
		}
	},
	{
		name: "Toad's legs",
		inputItems: new Bank({
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
		inputItems: new Bank({
			Dragonfruit: 10,
			Vial: 1
		}),
		outputItems: {
			[itemID('Bottled dragonbreath')]: 1
		}
	},
	{
		name: 'Ring of endurance',
		inputItems: new Bank({
			'Ring of endurance (uncharged)': 1,
			'Stamina potion (4)': 125
		}),
		outputItems: {
			[itemID('Ring of endurance')]: 1
		}
	},
	{
		name: 'Fish sack barrel',
		inputItems: new Bank({
			'Fish sack': 1,
			'Fish barrel': 1
		}),
		outputItems: {
			[itemID('Fish sack barrel')]: 1
		}
	},
	{
		name: 'Salve amulet (e)',
		inputItems: new Bank({
			'Salve amulet': 1
		}),
		outputItems: {
			[itemID('Salve amulet (e)')]: 1
		},
		customReq: salveECustomReq
	},
	{
		name: 'Salve amulet(ei)',
		inputItems: new Bank({
			'Salve amulet(i)': 1
		}),
		outputItems: {
			[itemID('Salve amulet(ei)')]: 1
		},
		customReq: salveECustomReq
	},
	{
		name: 'Ring of wealth (i)',
		inputItems: new Bank().add('Ring of wealth').add('Ring of wealth scroll'),
		GPCost: 50_000,
		outputItems: new Bank().add('Ring of wealth (i)')
	},
	{
		name: 'Strange hallowed tome',
		inputItems: new Bank({
			'Mysterious page 1': 1,
			'Mysterious page 2': 1,
			'Mysterious page 3': 1,
			'Mysterious page 4': 1,
			'Mysterious page 5': 1
		}),
		outputItems: {
			[itemID('Strange hallowed tome')]: 1
		}
	},
	{
		name: 'Frozen key',
		inputItems: new Bank({
			'Frozen key piece (bandos)': 1,
			'Frozen key piece (saradomin)': 1,
			'Frozen key piece (zamorak)': 1,
			'Frozen key piece (armadyl)': 1
		}),
		outputItems: {
			[itemID('Frozen key')]: 1
		}
	},
	{
		name: 'Ecumenical key',
		inputItems: new Bank({
			'Ecumenical key shard': 50
		}),
		outputItems: {
			[itemID('Ecumenical key')]: 1
		}
	},
	{
		name: 'Daeyalt essence',
		inputItems: new Bank({
			'Daeyalt shard': 1
		}),
		outputItems: new Bank({
			'Daeyalt essence': 1
		})
	},
	{
		name: 'Celestial signet',
		inputItems: new Bank({
			'Celestial ring': 1,
			'Elven signet': 1,
			Stardust: 1000,
			'Crystal shard': 100
		}),
		outputItems: new Bank().add('Celestial signet')
	},
	{
		name: 'Eternal teleport crystal',
		inputItems: new Bank({
			'Enhanced crystal teleport seed': 1,
			'Crystal shard': 100
		}),
		outputItems: new Bank({
			'Eternal teleport crystal': 1
		}),
		requiredSkills: { smithing: 80, crafting: 80 },
		QPRequired: 150
	},
	{
		name: 'Saturated heart',
		inputItems: new Bank({
			'Imbued heart': 1,
			'Ancient essence': 150_000
		}),
		outputItems: new Bank({
			'Saturated heart': 1
		})
	},
	{
		name: 'Trident of the swamp',
		inputItems: new Bank({
			'Trident of the seas (full)': 1,
			'Magic fang': 1
		}),
		outputItems: new Bank({
			'Trident of the swamp': 1
		})
	},
	{
		name: 'Voidwaker',
		inputItems: new Bank({
			'Voidwaker blade': 1,
			'Voidwaker hilt': 1,
			'Voidwaker gem': 1,
			Coins: 500_000
		}),
		outputItems: new Bank({
			Voidwaker: 1
		})
	},
	{
		name: 'Accursed sceptre (u)',
		inputItems: new Bank({
			"Thammaron's sceptre (u)": 1,
			"Skull of vet'ion": 1,
			Coins: 500_000
		}),
		outputItems: new Bank({
			'Accursed sceptre (u)': 1
		})
	},
	{
		name: 'Ursine chainmace (u)',
		inputItems: new Bank({
			"Viggora's chainmace (u)": 1,
			'Claws of callisto': 1,
			Coins: 500_000
		}),
		outputItems: new Bank({
			'Ursine chainmace (u)': 1
		})
	},
	{
		name: 'Webweaver bow (u)',
		inputItems: new Bank({
			"Craw's bow (u)": 1,
			'Fangs of venenatis': 1,
			Coins: 500_000
		}),
		outputItems: new Bank({
			'Webweaver bow (u)	': 1
		})
	},
	{
		name: 'Bone mace',
		inputItems: new Bank().add('Rune mace').add("Scurrius' spine"),
		outputItems: new Bank().add('Bone mace'),
		requiredSkills: {
			smithing: 35
		}
	},
	{
		name: 'Bone shortbow',
		inputItems: new Bank().add('Yew shortbow').add("Scurrius' spine"),
		outputItems: new Bank().add('Bone shortbow'),
		requiredSkills: {
			fletching: 35
		}
	},
	{
		name: 'Bone staff',
		inputItems: new Bank().add('Battlestaff').add('Chaos rune', 1000).add("Scurrius' spine"),
		outputItems: new Bank().add('Bone staff'),
		requiredSkills: {
			crafting: 35
		}
	},
	{
		name: 'Antique lamp (Historian Aldo)',
		inputItems: new Bank().add("Scurrius' spine"),
		outputItems: new Bank().add(28800)
	},
	{
		name: 'Venator bow (uncharged)',
		inputItems: new Bank().add('Venator shard', 5).freeze(),
		outputItems: new Bank().add('Venator bow (uncharged)').freeze()
	},
	{
		name: "Blessed dizana's quiver",
		inputItems: new Bank().add('Sunfire splinters', 150_000).add("Dizana's quiver (uncharged)").freeze(),
		outputItems: new Bank().add("Blessed dizana's quiver").freeze()
	},
	{
		name: "Dizana's max cape",
		inputItems: new Bank().add("Blessed dizana's quiver").add('Max cape').add('Max hood').freeze(),
		outputItems: new Bank().add("Dizana's max cape").add("Dizana's max hood").freeze()
	},
	{
		name: 'Noxious halberd',
		inputItems: new Bank().add('Noxious point').add('Noxious blade').add('Noxious pommel').freeze(),
		outputItems: new Bank().add('Noxious halberd').freeze(),
		requiredSkills: {
			smithing: 72,
			crafting: 72
		}
	},
	{
		name: 'Araxyte slayer helmet',
		inputItems: new Bank().add('Slayer helmet').add('Araxyte head').freeze(),
		outputItems: new Bank().add('Araxyte slayer helmet').freeze(),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.EyeSeeYou]
	},
	{
		name: 'Araxyte slayer helmet (i)',
		inputItems: new Bank().add('Slayer helmet (i)').add('Araxyte head').freeze(),
		outputItems: new Bank().add('Araxyte slayer helmet (i)').freeze(),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.EyeSeeYou]
	},
	{
		name: 'Rax',
		inputItems: new Bank().add('Coagulated venom').add('Nid').freeze(),
		outputItems: new Bank().add('Rax').freeze()
	},
	{
		name: 'Revert Rax',
		inputItems: new Bank().add('Rax').freeze(),
		outputItems: new Bank().add('Coagulated venom').add('Nid').freeze(),
		noCl: true
	},
	{
		name: 'Amulet of rancour (s)',
		inputItems: new Bank().add('Amulet of rancour').freeze(),
		outputItems: new Bank().add('Amulet of rancour (s)').freeze(),
		customReq: async user => {
			const requiredItems = deepResolveItems([
				'Amulet of rancour',
				'Aranea boots',
				[EItem.ARAXYTE_SLAYER_HELMET, EItem.ARAXYTE_SLAYER_HELMET_I],
				'Noxious halberd',
				['Rax', 'Nid']
			]);
			if (!requiredItems.every(item => (Array.isArray(item) ? item.some(i => user.owns(i)) : user.owns(item)))) {
				return `You need to own all these items to create the Amulet of rancour (s): ${requiredItems.map(item => (Array.isArray(item) ? item.map(itemNameFromID).join(' OR ') : itemNameFromID(item))).join(', ')}.`;
			}
			return null;
		}
	},
	{
		name: 'Revert Amulet of rancour (s)',
		inputItems: new Bank().add('Amulet of rancour (s)').freeze(),
		outputItems: new Bank().add('Amulet of rancour').freeze(),
		noCl: true
	},
	{
		name: 'Zombie axe',
		inputItems: new Bank().add('broken zombie axe').freeze(),
		outputItems: new Bank().add('Zombie axe').freeze(),
		requiredSkills: {
			smithing: 70
		}
	},
	{
		name: 'Strange skull',
		inputItems: new Bank({
			'Left skull half': 1,
			'Right skull half': 1
		}),
		outputItems: new Bank({
			'Strange skull': 1
		})
	},
	{
		name: 'Runed sceptre',
		inputItems: new Bank({
			'Top of sceptre': 1,
			'Bottom of sceptre': 1
		}),
		outputItems: new Bank({
			'Runed sceptre': 1
		})
	},
	{
		name: 'Skull sceptre',
		inputItems: new Bank({
			'Strange skull': 1,
			'Runed sceptre': 1
		}),
		outputItems: new Bank({
			'Skull sceptre': 1
		})
	},
	{
		name: 'Skull sceptre(i)',
		inputItems: new Bank({
			'Skull sceptre': 1
		}),
		outputItems: new Bank({
			'Skull sceptre(i)': 1
		}),
		customReq: async user => {
			const count = await prisma.activity.count({
				where: {
					user_id: BigInt(user.id),
					type: 'StrongholdOfSecurity'
				}
			});
			if (count === 0) return 'You must complete the Stronghold of Security to imbue your Skull sceptre';
			return null;
		}
	},
	...Reverteables,
	...crystalTools,
	...ornamentKits,
	...hunterClothing,
	...twistedAncestral,
	...metamorphPetCreatables,
	...tobMetamorphPetCreatables,
	...metamorphPets,
	...slayerCreatables,
	...capeCreatables,
	...dragonFireShieldCreatables,
	...revWeapons,
	...armorAndItemPacks,
	...gracefulOutfitCreatables,
	...tobCreatables,
	...lmsCreatables,
	...mysticStavesCreatables,
	...nexCreatables,
	...amrodCreatables,
	...goldenProspectorCreatables,
	...leaguesCreatables,
	...guardiansOfTheRiftCreatables,
	...shadesOfMortonCreatables,
	...toaCreatables,
	...bloodBarkCreatables,
	...swampBarkCreatables,
	...dtCreatables,
	...caCreatables,
	...forestryCreatables,
	...camdozaalItems
];

export default Createables;
