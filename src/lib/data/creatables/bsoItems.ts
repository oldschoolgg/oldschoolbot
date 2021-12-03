import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';

import { dyedItems } from '../../dyedItems';
import { resolveNameBank } from '../../util';
import itemID from '../../util/itemID';
import { Createable } from '../createables';

const dyeCreatables: Createable[] = [];
for (const { baseItem, dyedVersions } of dyedItems) {
	for (const dyedVersion of dyedVersions) {
		dyeCreatables.push({
			name: dyedVersion.item.name,
			inputItems: new Bank().add(baseItem.id).add(dyedVersion.dye.id).bank,
			outputItems: new Bank().add(dyedVersion.item.id).bank
		});
	}
}

const chaoticCreatables: Createable[] = [
	{
		name: 'Arcane blast necklace',
		inputItems: {
			[itemID('Occult necklace')]: 1,
			[itemID('Chaotic remnant')]: 1
		},
		outputItems: {
			[itemID('Arcane blast necklace')]: 1
		},
		requiredSkills: { dungeoneering: 99, crafting: 99 }
	},
	{
		name: 'Farsight snapshot necklace',
		inputItems: {
			[itemID('Necklace of anguish')]: 1,
			[itemID('Chaotic remnant')]: 1
		},
		outputItems: {
			[itemID('Farsight snapshot necklace')]: 1
		},
		requiredSkills: { dungeoneering: 99, crafting: 99 }
	},
	{
		name: "Brawler's hook necklace",
		inputItems: {
			[itemID('Amulet of torture')]: 1,
			[itemID('Chaotic remnant')]: 1
		},
		outputItems: {
			[itemID("Brawler's hook necklace")]: 1
		},
		requiredSkills: { dungeoneering: 99, crafting: 99 }
	},
	{
		name: 'Gorajan bonecrusher',
		inputItems: {
			[itemID('Gorajan shards')]: 3,
			[itemID('Gorajan bonecrusher (u)')]: 1
		},
		outputItems: {
			[itemID('Gorajan bonecrusher')]: 1
		},
		requiredSkills: { crafting: 120 }
	}
];

const brokenItems: Createable[] = [
	{
		name: 'Fix fire cape',
		inputItems: {
			20_445: 1
		},
		outputItems: {
			[itemID('Fire cape')]: 1
		},
		noCl: true
	},
	{
		name: 'Fix fire max cape',
		inputItems: {
			20_447: 1
		},
		outputItems: {
			[itemID('Fire max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix infernal cape',
		inputItems: {
			21_287: 1
		},
		outputItems: {
			[itemID('Infernal cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix infernal max cape',
		inputItems: {
			21_289: 1
		},
		outputItems: {
			[itemID('Infernal max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix assembler max cape',
		inputItems: {
			21_916: 1
		},
		outputItems: {
			[itemID('Assembler max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued saradomin cape',
		inputItems: {
			24_236: 1
		},
		outputItems: {
			[itemID('Imbued saradomin cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued saradomin max cape',
		inputItems: {
			24_238: 1
		},
		outputItems: {
			[itemID('Imbued saradomin max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued guthix cape',
		inputItems: {
			24_240: 1
		},
		outputItems: {
			[itemID('Imbued guthix cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued guthix max cape',
		inputItems: {
			24_242: 1
		},
		outputItems: {
			[itemID('Imbued guthix max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued zamorak cape',
		inputItems: {
			24_244: 1
		},
		outputItems: {
			[itemID('Imbued zamorak cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix imbued zamorak max cape',
		inputItems: {
			24_246: 1
		},
		outputItems: {
			[itemID('Imbued zamorak max cape')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix dragon defender',
		inputItems: {
			20_463: 1
		},
		outputItems: {
			[itemID('Dragon defender')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix avernic defender',
		inputItems: {
			22_441: 1
		},
		outputItems: {
			[itemID('Avernic defender')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void knight top',
		inputItems: {
			20_465: 1
		},
		outputItems: {
			[itemID('Void knight top')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void knight robe',
		inputItems: {
			20_469: 1
		},
		outputItems: {
			[itemID('Void knight robe')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix elite void top',
		inputItems: {
			20_467: 1
		},
		outputItems: {
			[itemID('Elite void top')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix elite void robe',
		inputItems: {
			20_471: 1
		},
		outputItems: {
			[itemID('Elite void robe')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void knight gloves',
		inputItems: {
			20_475: 1
		},
		outputItems: {
			[itemID('Void knight gloves')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void mage helm',
		inputItems: {
			20_477: 1
		},
		outputItems: {
			[itemID('Void mage helm')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void ranger helm',
		inputItems: {
			20_479: 1
		},
		outputItems: {
			[itemID('Void ranger helm')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix void melee helm',
		inputItems: {
			20_481: 1
		},
		outputItems: {
			[itemID('Void melee helm')]: 1
		},
		GPCost: 100_000_000,
		noCl: true
	},
	{
		name: 'Fix hellfire bow',
		inputItems: resolveBank({
			'Hellfire bow (broken)': 1,
			'Ignecarus dragonclaw': 1,
			'Smouldering stone': 1,
			"Dragon's fury": 1
		}),
		outputItems: {
			[itemID('Hellfire bow')]: 1
		},
		GPCost: 200_000_000,
		noCl: true
	},
	{
		name: 'Fix hellfire bownana',
		inputItems: resolveBank({
			'Hellfire bownana (broken)': 1,
			'Ignecarus dragonclaw': 1,
			'Smouldering stone': 1,
			"Dragon's fury": 1
		}),
		outputItems: {
			[itemID('Hellfire bownana')]: 1
		},
		GPCost: 200_000_000,
		noCl: true
	}
];

const lockedItems: Createable[] = [
	{
		name: 'Unlock dragon defender',
		inputItems: { [itemID('Dragon defender (l)')]: 1 },
		outputItems: { [itemID('Dragon defender')]: 1 },
		noCl: true
	}
];

const bsoArmorSets: Createable[] = [
	// twisted relichunter
	{
		name: 'Unpack twisted relichunter (t1) armour set',
		inputItems: {
			[itemID('Twisted relichunter (t1) armour set')]: 1
		},
		outputItems: {
			[itemID('Twisted hat (t1)')]: 1,
			[itemID('Twisted coat (t1)')]: 1,
			[itemID('Twisted trousers (t1)')]: 1,
			[itemID('Twisted boots (t1)')]: 1
		},
		noCl: true
	},
	{
		name: 'Twisted relichunter (t1) armour set',
		inputItems: {
			[itemID('Twisted hat (t1)')]: 1,
			[itemID('Twisted coat (t1)')]: 1,
			[itemID('Twisted trousers (t1)')]: 1,
			[itemID('Twisted boots (t1)')]: 1
		},
		outputItems: {
			[itemID('Twisted relichunter (t1) armour set')]: 1
		}
	},
	{
		name: 'Unpack twisted relichunter (t2) armour set',
		inputItems: {
			[itemID('Twisted relichunter (t2) armour set')]: 1
		},
		outputItems: {
			[itemID('Twisted hat (t2)')]: 1,
			[itemID('Twisted coat (t2)')]: 1,
			[itemID('Twisted trousers (t2)')]: 1,
			[itemID('Twisted boots (t2)')]: 1
		},
		noCl: true
	},
	{
		name: 'Twisted relichunter (t2) armour set',
		inputItems: {
			[itemID('Twisted hat (t2)')]: 1,
			[itemID('Twisted coat (t2)')]: 1,
			[itemID('Twisted trousers (t2)')]: 1,
			[itemID('Twisted boots (t2)')]: 1
		},
		outputItems: {
			[itemID('Twisted relichunter (t2) armour set')]: 1
		}
	},
	{
		name: 'Unpack twisted relichunter (t3) armour set',
		inputItems: {
			[itemID('Twisted relichunter (t3) armour set')]: 1
		},
		outputItems: {
			[itemID('Twisted hat (t3)')]: 1,
			[itemID('Twisted coat (t3)')]: 1,
			[itemID('Twisted trousers (t3)')]: 1,
			[itemID('Twisted boots (t3)')]: 1
		},
		noCl: true
	},
	{
		name: 'Twisted relichunter (t3) armour set',
		inputItems: {
			[itemID('Twisted hat (t3)')]: 1,
			[itemID('Twisted coat (t3)')]: 1,
			[itemID('Twisted trousers (t3)')]: 1,
			[itemID('Twisted boots (t3)')]: 1
		},
		outputItems: {
			[itemID('Twisted relichunter (t3) armour set')]: 1
		}
	},
	// trailblazer relichunter
	{
		name: 'Unpack trailblazer relichunter (t1) armour set',
		inputItems: {
			[itemID('Trailblazer relichunter (t1) armour set')]: 1
		},
		outputItems: {
			[itemID('Trailblazer hood (t1)')]: 1,
			[itemID('Trailblazer top (t1)')]: 1,
			[itemID('Trailblazer trousers (t1)')]: 1,
			[itemID('Trailblazer boots (t1)')]: 1
		},
		noCl: true
	},
	{
		name: 'Trailblazer relichunter (t1) armour set',
		inputItems: {
			[itemID('Trailblazer hood (t1)')]: 1,
			[itemID('Trailblazer top (t1)')]: 1,
			[itemID('Trailblazer trousers (t1)')]: 1,
			[itemID('Trailblazer boots (t1)')]: 1
		},
		outputItems: {
			[itemID('Trailblazer relichunter (t1) armour set')]: 1
		}
	},
	{
		name: 'Unpack trailblazer relichunter (t2) armour set',
		inputItems: {
			[itemID('Trailblazer relichunter (t2) armour set')]: 1
		},
		outputItems: {
			[itemID('Trailblazer hood (t2)')]: 1,
			[itemID('Trailblazer top (t2)')]: 1,
			[itemID('Trailblazer trousers (t2)')]: 1,
			[itemID('Trailblazer boots (t2)')]: 1
		},
		noCl: true
	},
	{
		name: 'Trailblazer relichunter (t2) armour set',
		inputItems: {
			[itemID('Trailblazer hood (t2)')]: 1,
			[itemID('Trailblazer top (t2)')]: 1,
			[itemID('Trailblazer trousers (t2)')]: 1,
			[itemID('Trailblazer boots (t2)')]: 1
		},
		outputItems: {
			[itemID('Trailblazer relichunter (t2) armour set')]: 1
		}
	},
	{
		name: 'Unpack trailblazer relichunter (t3) armour set',
		inputItems: {
			[itemID('Trailblazer relichunter (t3) armour set')]: 1
		},
		outputItems: {
			[itemID('Trailblazer hood (t3)')]: 1,
			[itemID('Trailblazer top (t3)')]: 1,
			[itemID('Trailblazer trousers (t3)')]: 1,
			[itemID('Trailblazer boots (t3)')]: 1
		},
		noCl: true
	},
	{
		name: 'Trailblazer relichunter (t3) armour set',
		inputItems: {
			[itemID('Trailblazer hood (t3)')]: 1,
			[itemID('Trailblazer top (t3)')]: 1,
			[itemID('Trailblazer trousers (t3)')]: 1,
			[itemID('Trailblazer boots (t3)')]: 1
		},
		outputItems: {
			[itemID('Trailblazer relichunter (t3) armour set')]: 1
		}
	},
	{
		// TODO - Move to main createables when released
		name: "Unpack dagon'hai robes set",
		inputItems: {
			[itemID("Dagon'hai robes set")]: 1
		},
		outputItems: {
			[itemID("Dagon'hai hat")]: 1,
			[itemID("Dagon'hai robe top")]: 1,
			[itemID("Dagon'hai robe bottom")]: 1
		},
		noCl: true
	},
	{
		name: "Dagon'hai robes set",
		inputItems: {
			[itemID("Dagon'hai hat")]: 1,
			[itemID("Dagon'hai robe top")]: 1,
			[itemID("Dagon'hai robe bottom")]: 1
		},
		outputItems: {
			[itemID("Dagon'hai robes set")]: 1
		}
	}
];

const bsoItems: Createable[] = [
	{
		name: 'Divine spirit shield',
		inputItems: {
			[itemID('Blessed spirit shield')]: 1,
			[itemID('Divine sigil')]: 1
		},
		outputItems: {
			[itemID('Divine spirit shield')]: 1
		},
		requiredSkills: {
			prayer: 90,
			smithing: 85
		}
	},
	{
		name: 'Heart crystal',
		inputItems: resolveNameBank({
			'Chunk of crystal': 1,
			'Hunk of crystal': 1,
			'Lump of crystal': 1
		}),
		outputItems: {
			745: 1
		}
	},
	{
		name: 'Frozen key',
		inputItems: resolveNameBank({
			'Key piece 1': 1,
			'Key piece 2': 1,
			'Key piece 3': 1,
			'Key piece 4': 1
		}),
		outputItems: {
			[itemID('Frozen key')]: 1
		}
	},
	{
		name: 'Vasa cloak',
		inputItems: resolveNameBank({
			'Tattered robes of Vasa': 1,
			'Abyssal cape': 1
		}),
		outputItems: {
			[itemID('Vasa cloak')]: 1
		},
		requiredSkills: {
			crafting: 105,
			magic: 105,
			runecraft: 105
		}
	},
	{
		name: "Bryophyta's staff(i)",
		inputItems: resolveNameBank({
			"Bryophyta's staff": 1,
			'Magus scroll': 1
		}),
		outputItems: {
			[itemID("Bryophyta's staff(i)")]: 1
		},
		requiredSkills: {
			crafting: 105,
			magic: 105
		}
	},
	{
		name: 'Ignis ring(i)',
		inputItems: resolveNameBank({
			'Ignis ring': 1,
			'Magus scroll': 1
		}),
		outputItems: {
			[itemID('Ignis ring(i)')]: 1
		},
		requiredSkills: {
			crafting: 120,
			magic: 105
		}
	},
	{
		name: 'Abyssal pouch',
		inputItems: resolveNameBank({
			'Abyssal thread': 1,
			'Giant pouch': 1
		}),
		outputItems: resolveNameBank({
			'Abyssal pouch': 1
		})
	},
	{
		name: 'Elder pouch',
		inputItems: resolveNameBank({
			'Abyssal pouch': 1,
			'Elder thread': 1
		}),
		outputItems: resolveNameBank({
			'Elder pouch': 1
		})
	},
	{
		name: 'Bucket of sand',
		inputItems: resolveNameBank({
			Sand: 1,
			Bucket: 1
		}),
		outputItems: resolveNameBank({
			'Bucket of sand': 1
		})
	},
	{
		// TODO - Move to main createables when TOB is released
		name: 'Avernic defender',
		inputItems: {
			[itemID('Avernic defender hilt')]: 1,
			[itemID('Dragon defender')]: 1
		},
		outputItems: {
			[itemID('Avernic defender')]: 1
		}
	},
	{
		name: 'Breadcrumbs',
		inputItems: {
			[itemID('Bread')]: 1
		},
		outputItems: {
			[itemID('Breadcrumbs')]: 4
		}
	},
	{
		name: 'Infernal bulwark',
		inputItems: {
			[itemID("Dinh's bulwark")]: 1,
			[itemID('Onyx')]: 5,
			[itemID('Infernal core')]: 1
		},
		outputItems: {
			[itemID('Infernal bulwark')]: 1
		},
		requiredSkills: {
			smithing: 105
		}
	},
	{
		name: 'TzKal cape',
		inputItems: {
			[itemID("TzKal-Zuk's skin")]: 1,
			[itemID('Onyx')]: 20,
			[itemID('Infernal cape')]: 1,
			[itemID('Abyssal cape')]: 1
		},
		outputItems: {
			[itemID('TzKal cape')]: 1
		}
	},
	{
		name: 'Infernal slayer helmet',
		inputItems: {
			[itemID('Head of TzKal Zuk')]: 1,
			[itemID('Onyx')]: 30,
			[itemID('Black mask')]: 1
		},
		outputItems: {
			[itemID('Infernal slayer helmet')]: 1
		}
	},
	{
		name: 'Infernal slayer helmet(i)',
		inputItems: {
			[itemID('Infernal slayer helmet')]: 1,
			[itemID('Onyx')]: 10,
			[itemID('Magus scroll')]: 1,
			[itemID('Gorajan shards')]: 3,
			[itemID('Torva full helm')]: 1,
			[itemID('Pernix cowl')]: 1,
			[itemID('Virtus mask')]: 1
		},
		outputItems: {
			[itemID('Infernal slayer helmet(i)')]: 1
		}
	},
	{
		name: 'Royal crossbow',
		inputItems: {
			[itemID('Chaotic crossbow')]: 1,
			[itemID('Royal bolt stabiliser')]: 1,
			[itemID('Royal frame')]: 1,
			[itemID('Royal sight')]: 1,
			[itemID('Royal torsion spring')]: 1
		},
		outputItems: {
			[itemID('Royal crossbow')]: 1
		}
	}
];

const ganodermic: Createable[] = [
	{
		name: 'Ganodermic visor',
		inputItems: resolveNameBank({
			'Mycelium visor web': 1,
			'Ganodermic flake': 500
		}),
		outputItems: resolveNameBank({
			'Ganodermic visor': 1
		})
	},
	{
		name: 'Ganodermic poncho',
		inputItems: resolveNameBank({
			'Mycelium poncho web': 1,
			'Ganodermic flake': 5000
		}),
		outputItems: resolveNameBank({
			'Ganodermic poncho': 1
		})
	},
	{
		name: 'Ganodermic leggings',
		inputItems: resolveNameBank({
			'Mycelium leggings web': 1,
			'Ganodermic flake': 1500
		}),
		outputItems: resolveNameBank({
			'Ganodermic leggings': 1
		})
	}
];

const grifolic: Createable[] = [
	{
		name: 'Grifolic visor',
		inputItems: resolveNameBank({
			'Mycelium visor web': 1,
			'Grifolic flake': 500
		}),
		outputItems: resolveNameBank({
			'Grifolic visor': 1
		})
	},
	{
		name: 'Grifolic poncho',
		inputItems: resolveNameBank({
			'Mycelium poncho web': 1,
			'Grifolic flake': 5000
		}),
		outputItems: resolveNameBank({
			'Grifolic poncho': 1
		})
	},
	{
		name: 'Grifolic leggings',
		inputItems: resolveNameBank({
			'Mycelium leggings web': 1,
			'Grifolic flake': 1500
		}),
		outputItems: resolveNameBank({
			'Grifolic leggings': 1
		})
	}
];

const dragonBoneCreatables: Createable[] = [
	{
		name: 'Dragonbone boots',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Dragon boots': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone boots': 1
		})
	},
	{
		name: 'Dragonbone full helm',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Dragon full helm': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone full helm': 1
		})
	},
	{
		name: 'Dragonbone platebody',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Dragon platebody': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone platebody': 1
		})
	},
	{
		name: 'Dragonbone platelegs',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Dragon platelegs': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone platelegs': 1
		})
	},
	{
		name: 'Dragonbone gloves',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Dragon gloves': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone gloves': 1
		})
	},
	{
		name: 'Dragonbone mage boots',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Infinity boots': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone mage boots': 1
		})
	},
	{
		name: 'Dragonbone mage bottoms',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Infinity bottoms': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone mage bottoms': 1
		})
	},
	{
		name: 'Dragonbone mage hat',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Infinity hat': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone mage hat': 1
		})
	},
	{
		name: 'Dragonbone mage top',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Infinity top': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone mage top': 1
		})
	}
];

export const BsoCreateables: Createable[] = [
	...bsoItems,
	...chaoticCreatables,
	...brokenItems,
	...lockedItems,
	...bsoArmorSets,
	...dyeCreatables,
	...ganodermic,
	...grifolic,
	...dragonBoneCreatables
];
