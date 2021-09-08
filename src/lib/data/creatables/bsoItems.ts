import { resolveBank } from 'oldschooljs/dist/util';

import { resolveNameBank } from '../../util';
import itemID from '../../util/itemID';
import { Createable } from '../createables';

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

const dwwhDyed: Createable[] = [
	{
		name: 'Dwarven warhammer (ice)',
		inputItems: {
			[itemID('Dwarven warhammer')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Dwarven warhammer (ice)': 1
		})
	},
	{
		name: 'Dwarven warhammer (blood)',
		inputItems: {
			[itemID('Dwarven warhammer')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Dwarven warhammer (blood)': 1
		})
	},
	{
		name: 'Dwarven warhammer (shadow)',
		inputItems: {
			[itemID('Dwarven warhammer')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Dwarven warhammer (shadow)': 1
		})
	},
	{
		name: 'Dwarven warhammer (3a)',
		inputItems: {
			[itemID('Dwarven warhammer')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Dwarven warhammer (3a)': 1
		})
	}
];

const dyedCreatables: Createable[] = [
	{
		name: 'Drygore longsword (ice)',
		inputItems: {
			[itemID('Drygore longsword')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore longsword (ice)': 1
		})
	},
	{
		name: 'Drygore longsword (blood)',
		inputItems: {
			[itemID('Drygore longsword')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore longsword (blood)': 1
		})
	},
	{
		name: 'Drygore longsword (shadow)',
		inputItems: {
			[itemID('Drygore longsword')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore longsword (shadow)': 1
		})
	},
	{
		name: 'Drygore longsword (3a)',
		inputItems: {
			[itemID('Drygore longsword')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore longsword (3a)': 1
		})
	},
	//
	{
		name: 'Offhand drygore longsword (ice)',
		inputItems: {
			[itemID('Offhand drygore longsword')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore longsword (ice)': 1
		})
	},
	{
		name: 'Offhand drygore longsword (blood)',
		inputItems: {
			[itemID('Offhand drygore longsword')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore longsword (blood)': 1
		})
	},
	{
		name: 'Offhand drygore longsword (shadow)',
		inputItems: {
			[itemID('Offhand drygore longsword')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore longsword (shadow)': 1
		})
	},
	{
		name: 'Offhand drygore longsword (3a)',
		inputItems: {
			[itemID('Offhand drygore longsword')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore longsword (3a)': 1
		})
	},
	//
	{
		name: 'Drygore mace (ice)',
		inputItems: {
			[itemID('Drygore mace')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore mace (ice)': 1
		})
	},
	{
		name: 'Drygore mace (blood)',
		inputItems: {
			[itemID('Drygore mace')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore mace (blood)': 1
		})
	},
	{
		name: 'Drygore mace (shadow)',
		inputItems: {
			[itemID('Drygore mace')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore mace (shadow)': 1
		})
	},
	{
		name: 'Drygore mace (3a)',
		inputItems: {
			[itemID('Drygore mace')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore mace (3a)': 1
		})
	},
	//
	{
		name: 'Offhand drygore mace (ice)',
		inputItems: {
			[itemID('Offhand drygore mace')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore mace (ice)': 1
		})
	},
	{
		name: 'Offhand drygore mace (blood)',
		inputItems: {
			[itemID('Offhand drygore mace')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore mace (blood)': 1
		})
	},
	{
		name: 'Offhand drygore mace (shadow)',
		inputItems: {
			[itemID('Offhand drygore mace')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore mace (shadow)': 1
		})
	},
	{
		name: 'Offhand drygore mace (3a)',
		inputItems: {
			[itemID('Offhand drygore mace')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore mace (3a)': 1
		})
	},
	//
	{
		name: 'Drygore rapier (ice)',
		inputItems: {
			[itemID('Drygore rapier')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore rapier (ice)': 1
		})
	},
	{
		name: 'Drygore rapier (blood)',
		inputItems: {
			[itemID('Drygore rapier')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore rapier (blood)': 1
		})
	},
	{
		name: 'Drygore rapier (shadow)',
		inputItems: {
			[itemID('Drygore rapier')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore rapier (shadow)': 1
		})
	},
	{
		name: 'Drygore rapier (3a)',
		inputItems: {
			[itemID('Drygore rapier')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Drygore rapier (3a)': 1
		})
	},
	//
	{
		name: 'Offhand drygore rapier (ice)',
		inputItems: {
			[itemID('Offhand drygore rapier')]: 1,
			[itemID('Ice dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore rapier (ice)': 1
		})
	},
	{
		name: 'Offhand drygore rapier (blood)',
		inputItems: {
			[itemID('Offhand drygore rapier')]: 1,
			[itemID('Blood dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore rapier (blood)': 1
		})
	},
	{
		name: 'Offhand drygore rapier (shadow)',
		inputItems: {
			[itemID('Offhand drygore rapier')]: 1,
			[itemID('Shadow dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore rapier (shadow)': 1
		})
	},
	{
		name: 'Offhand drygore rapier (3a)',
		inputItems: {
			[itemID('Offhand drygore rapier')]: 1,
			[itemID('Third age dye')]: 1
		},
		outputItems: resolveNameBank({
			'Offhand drygore rapier (3a)': 1
		})
	},
	...dwwhDyed
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
		// TODO - Move to main createables when TOB is released
		name: 'Avernic defender',
		inputItems: {
			[itemID('Avernic defender hilt')]: 1,
			[itemID('Dragon defender')]: 1
		},
		outputItems: {
			[itemID('Avernic defender')]: 1
		}
	}
];

export const BsoCreateables: Createable[] = [
	...bsoItems,
	...chaoticCreatables,
	...brokenItems,
	...lockedItems,
	...dyedCreatables,
	...bsoArmorSets
];
