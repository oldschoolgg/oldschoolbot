import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';

import { expertCapesSource } from '../../bso/expertCapes';
import { dyedItems } from '../../dyedItems';
import { MaterialBank } from '../../invention/MaterialBank';
import { nexBrokenArmorDetails } from '../../nex';
import Skillcapes from '../../skilling/skillcapes';
import { bones } from '../../skilling/skills/prayer';
import type { Bone } from '../../skilling/types';
import { seaMonkeyStaves } from '../../tames';
import { assert, resolveNameBank, stringMatches } from '../../util';
import getOSItem from '../../util/getOSItem';
import itemID from '../../util/itemID';
import resolveItems from '../../util/resolveItems';
import { brokenPernixOutfit, brokenTorvaOutfit, brokenVirtusOutfit } from '../CollectionsExport';
import type { Createable } from '../createables';
import { divinationCreatables } from './divinationCreatables';
import { ghostCreatables } from './ghostweaveCreatables';
import { slayerMaskCreatables } from './slayerMasks';

const dyeCreatables: Createable[] = [];
for (const { baseItem, dyedVersions } of dyedItems) {
	for (const dyedVersion of dyedVersions) {
		dyeCreatables.push({
			name: dyedVersion.item.name,
			inputItems: new Bank().add(baseItem.id).add(dyedVersion.dye.id).toJSON(),
			outputItems: new Bank().add(dyedVersion.item.id).toJSON()
		});
	}
}

const nexArmourCreatables: Createable[] = [];
for (const [component, brokenOutfit, repairedOutfit] of nexBrokenArmorDetails) {
	for (let i = 0; i < brokenOutfit.length; i++) {
		nexArmourCreatables.push({
			name: getOSItem(repairedOutfit[i]).name,
			inputItems: {
				[component.id]: 1,
				[brokenOutfit[i]]: 1
			},
			outputItems: {
				[repairedOutfit[i]]: 1
			},
			requiredSkills: { smithing: 80, crafting: 80 }
		});
	}
}

const nexCreatables: Createable[] = [
	{
		name: 'Virtus wand',
		inputItems: {
			[itemID('Kodai wand')]: 1,
			[itemID('Virtus crystal')]: 1
		},
		outputItems: {
			[itemID('Virtus wand')]: 1
		},
		requiredSkills: { smithing: 80, crafting: 80 }
	},
	{
		name: 'Virtus book',
		inputItems: {
			[itemID("Mage's book")]: 1,
			[itemID('Virtus crystal')]: 1
		},
		outputItems: {
			[itemID('Virtus book')]: 1
		},
		requiredSkills: { smithing: 80, crafting: 80 }
	},
	...nexArmourCreatables,
	...brokenPernixOutfit.map(piece => ({
		name: `Revert ${getOSItem(piece).name}`,
		inputItems: new Bank().add(piece),
		outputItems: {
			[itemID('Pernix components')]: 1
		},
		forceAddToCl: true
	})),
	...brokenTorvaOutfit.map(piece => ({
		name: `Revert ${getOSItem(piece).name}`,
		inputItems: new Bank().add(piece),
		outputItems: {
			[itemID('Bandosian components')]: 1
		},
		forceAddToCl: true
	})),
	...brokenVirtusOutfit.map(piece => ({
		name: `Revert ${getOSItem(piece).name}`,
		inputItems: new Bank().add(piece),
		outputItems: {
			[itemID('Ancestral components')]: 1
		},
		forceAddToCl: true
	}))
];

const masoriComponents: Createable[] = [
	{
		name: 'Revert masori mask',
		inputItems: new Bank().add('Masori mask'),
		outputItems: new Bank().add('Masori components', 2),
		forceAddToCl: true
	},
	{
		name: 'Revert masori body',
		inputItems: new Bank().add('Masori body'),
		outputItems: new Bank().add('Masori components', 4),
		forceAddToCl: true
	},
	{
		name: 'Revert masori chaps',
		inputItems: new Bank().add('Masori chaps'),
		outputItems: new Bank().add('Masori components', 3),
		forceAddToCl: true
	}
];

const componentRevertables: Createable[] = [
	{
		name: 'Revert bandos chestplate',
		inputItems: {
			[itemID('Bandos chestplate')]: 1
		},
		outputItems: {
			[itemID('Bandosian components')]: 3
		},
		forceAddToCl: true
	},
	{
		name: 'Revert bandos tassets',
		inputItems: {
			[itemID('Bandos tassets')]: 1
		},
		outputItems: {
			[itemID('Bandosian components')]: 2
		},
		forceAddToCl: true
	},
	{
		name: 'Revert armadyl helmet (components)',
		inputItems: {
			[itemID('Armadyl helmet')]: 1
		},
		outputItems: {
			[itemID('Armadylean components')]: 1
		},
		forceAddToCl: true
	},
	{
		name: 'Revert armadyl chestplate (components)',
		inputItems: {
			[itemID('Armadyl chestplate')]: 1
		},
		outputItems: {
			[itemID('Armadylean components')]: 3
		},
		forceAddToCl: true
	},
	{
		name: 'Revert armadyl chainskirt (components)',
		inputItems: {
			[itemID('Armadyl chainskirt')]: 1
		},
		outputItems: {
			[itemID('Armadylean components')]: 2
		},
		forceAddToCl: true
	},
	{
		name: 'Revert ancestral hat',
		inputItems: {
			[itemID('Ancestral hat')]: 1
		},
		outputItems: {
			[itemID('Ancestral components')]: 2
		},
		forceAddToCl: true
	},
	{
		name: 'Revert ancestral robe top',
		inputItems: {
			[itemID('Ancestral robe top')]: 1
		},
		outputItems: {
			[itemID('Ancestral components')]: 3
		},
		forceAddToCl: true
	},
	{
		name: 'Revert ancestral robe bottom',
		inputItems: {
			[itemID('Ancestral robe bottom')]: 1
		},
		outputItems: {
			[itemID('Ancestral components')]: 3
		},
		forceAddToCl: true
	},
	...masoriComponents
];

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
	},
	{
		name: 'Revert gorajan bonecrusher',
		inputItems: new Bank().add('Gorajan bonecrusher (u)'),
		outputItems: new Bank().add('Gorajan shards', 1),
		requiredSkills: { crafting: 120 },
		noCl: true
	}
];

const brokenItems: Createable[] = [
	{
		name: 'Fix fire cape',
		inputItems: {
			20445: 1
		},
		outputItems: {
			[itemID('Fire cape')]: 1
		},
		noCl: true
	},
	{
		name: 'Fix fire max cape',
		inputItems: {
			20447: 1
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
			21287: 1
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
			21289: 1
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
			21916: 1
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
			24236: 1
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
			24238: 1
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
			24240: 1
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
			24242: 1
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
			24244: 1
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
			24246: 1
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
			20463: 1
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
			22441: 1
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
			20465: 1
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
			20469: 1
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
			20467: 1
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
			20471: 1
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
			20475: 1
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
			20477: 1
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
			20479: 1
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
			20481: 1
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
		name: 'Vasa cloak',
		inputItems: user => {
			const cost = new Bank({ 'Tattered robes of Vasa': 1, 'Abyssal cape': 1 });
			const capes = resolveItems(['Imbued saradomin cape', 'Imbued zamorak cape', 'Imbued guthix cape']);
			const capeToUse =
				user.bank.items().filter(i => capes.includes(i?.[0]?.id))?.[0]?.[0]?.id ??
				itemID('Imbued saradomin cape');
			cost.add(capeToUse);
			return cost;
		},
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
		},
		requiredSkills: {
			farming: 80
		}
	},
	{
		name: 'Polypore staff',
		inputItems: {
			[itemID('Polypore stick')]: 1,
			[itemID('Polypore spore')]: 7000
		},
		outputItems: {
			[itemID('Polypore staff')]: 1
		}
	},
	{
		name: 'Golden partyhat',
		inputItems: {
			[itemID('Golden shard')]: 7
		},
		outputItems: {
			[itemID('Golden partyhat')]: 1
		}
	},
	{
		name: 'Crystal fishing rod',
		inputItems: {
			[itemID('Contest rod')]: 1,
			[itemID('Crystal tool seed')]: 1
		},
		outputItems: {
			[itemID('Crystal fishing rod')]: 1
		}
	},
	{
		name: 'Void staff (u)',
		inputItems: resolveNameBank({
			'Virtus wand': 1,
			'Dark crystal': 1,
			'Dark animica': 750
		}),
		outputItems: resolveNameBank({
			'Void staff (u)': 1
		}),
		requiredSkills: {
			magic: 110,
			runecraft: 110,
			crafting: 110
		}
	},
	{
		name: 'Void staff',
		inputItems: resolveNameBank({
			'Void staff (u)': 1
		}),
		outputItems: resolveNameBank({
			'Void staff': 1
		})
	},
	{
		name: 'Revert void staff',
		inputItems: resolveNameBank({
			'Void staff': 1
		}),
		outputItems: resolveNameBank({
			'Void staff (u)': 1
		})
	},
	{
		name: 'Abyssal tome',
		inputItems: resolveNameBank({
			'Tattered tome': 1,
			'Virtus book': 1
		}),
		outputItems: resolveNameBank({
			'Abyssal tome': 1
		})
	},
	{
		name: 'Spellbound ring(i)',
		inputItems: resolveNameBank({
			'Spellbound ring': 1,
			'Magus scroll': 1
		}),
		outputItems: resolveNameBank({
			'Spellbound ring(i)': 1
		})
	},
	{
		name: 'Black swan',
		inputItems: resolveNameBank({
			Seer: 1,
			'Squid dye': 1
		}),
		outputItems: resolveNameBank({
			'Black swan': 1
		})
	},
	{
		name: 'Nexterminator',
		inputItems: resolveNameBank({
			'Bloodsoaked feather': 1
		}),
		outputItems: resolveNameBank({
			Nexterminator: 1
		})
	}
];

for (const staff of seaMonkeyStaves) {
	bsoItems.push({
		name: staff.item.name,
		inputItems: staff.creationCost,
		outputItems: new Bank().add(staff.item.id),
		requiredSkills: {
			magic: staff.userMagicLevel
		}
	});
}

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
		name: 'Dragonbone mage gloves',
		inputItems: resolveNameBank({
			'Dragonbone upgrade kit': 1,
			'Infinity gloves': 1
		}),
		outputItems: resolveNameBank({
			'Dragonbone mage gloves': 1
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
	},
	{
		name: 'Royal dragon platebody',
		inputItems: resolveNameBank({
			'Ruined dragon armour slice': 1,
			'Ruined dragon armour lump': 1,
			'Ruined dragon armour shard': 1
		}),
		outputItems: resolveNameBank({
			'Royal dragon platebody': 1
		})
	},
	{
		name: 'Frosty',
		inputItems: resolveNameBank({
			Snowball: 50,
			'Festive scarf': 1,
			'Snowman top hat': 1
		}),
		outputItems: resolveNameBank({
			Frosty: 1
		})
	}
];

const divineWaterBones = bones.map(bone => bone.name);

function divineWaterInputItems(user: MUser, preferredBone?: Bone) {
	const userBank = user.bank;
	const bonesToUse =
		preferredBone ??
		bones
			.filter(i => userBank.has(i.inputId))
			.sort((a, b) => userBank.amount(b.inputId) - userBank.amount(a.inputId))[0] ??
		bones[0];
	let perBone = 2000;
	if (bones.indexOf(bonesToUse) < bones.indexOf(bones.find(b => b.name === 'Dragon bones')!)) {
		perBone *= 2;
	}
	const quantity = Math.ceil(Math.floor(perBone / bonesToUse.xp));
	assert(quantity > 0);
	return new Bank().add(bonesToUse.inputId, quantity).add('Vial of water');
}

const divineWaterCreatbles: Createable[] = [
	{
		name: 'Divine water',
		inputItems: (user: MUser) => divineWaterInputItems(user),
		outputItems: resolveNameBank({
			'Divine water': 1
		})
	}
];

for (const bone of divineWaterBones) {
	const preferredBone = bones.find(b => stringMatches(b.name, bone))!;
	divineWaterCreatbles.push({
		name: `Divine water (${preferredBone.name})`,
		inputItems: (user: MUser) => divineWaterInputItems(user, preferredBone),
		outputItems: resolveNameBank({
			'Divine water': 1
		})
	});
}

export const BsoCreateables: Createable[] = [
	...bsoItems,
	...chaoticCreatables,
	...brokenItems,
	...lockedItems,
	...bsoArmorSets,
	...dyeCreatables,
	...ganodermic,
	...grifolic,
	...dragonBoneCreatables,
	...nexCreatables,
	...componentRevertables,
	...divineWaterCreatbles,
	{
		name: 'Crystal dust',
		inputItems: new Bank({
			'Crystal shard': 1
		}),
		outputItems: {
			[itemID('Crystal dust')]: 10
		}
	},
	...slayerMaskCreatables,
	{
		name: 'Titan ballista',
		inputItems: new Bank().add('Heavy ballista', 1).add('Monkey tail', 3),
		materialCost: new MaterialBank().add('heavy', 5000).add('flexible', 5000).add('powerful', 5000),
		outputItems: new Bank().add('Titan ballista'),
		requiredSkills: {
			crafting: 105,
			fletching: 105
		}
	},
	{
		name: 'Piercing trident',
		inputItems: new Bank().add('Merfolk trident', 2).add('Ignecarus dragonclaw', 3),
		outputItems: new Bank().add('Piercing trident'),
		requiredSkills: {
			crafting: 99,
			smithing: 99
		}
	},
	{
		name: 'Atlantean trident',
		inputItems: new Bank().add('Piercing trident').add('Oceanic relic'),
		outputItems: new Bank().add('Atlantean trident'),
		materialCost: new MaterialBank()
			.add('treasured', 5000)
			.add('magic', 5000)
			.add('precious', 1000)
			.add('powerful', 1000)
			.add('swift', 1000),
		requiredSkills: {
			crafting: 105,
			smithing: 105,
			magic: 105
		}
	},
	{
		name: 'Shark tooth necklace',
		inputItems: new Bank().add('Shark tooth', 5),
		outputItems: new Bank().add('Shark tooth necklace'),
		requiredSkills: {
			crafting: 105,
			magic: 105
		}
	},
	{
		name: 'Ring of piercing',
		inputItems: new Bank()
			.add('Archers ring', 10)
			.add('Masori components', 6)
			.add('Armadylean components', 3)
			.add('Aquifer aegis'),
		outputItems: new Bank().add('Ring of piercing'),
		requiredSkills: {
			crafting: 110
		}
	},
	{
		name: 'Ring of piercing (i)',
		inputItems: new Bank().add('Ring of piercing').add('Magus scroll'),
		outputItems: new Bank().add('Ring of piercing (i)')
	},
	{
		name: 'Tidal collector',
		inputItems: new Bank()
			.add('Masori assembler')
			.add('Shark jaw')
			.add('Masori components', 10)
			.add('Abyssal cape')
			.add('Armadylean components', 10),
		outputItems: new Bank().add('Tidal collector')
	},
	{
		name: 'Revert completionist cape',
		outputItems: user => {
			// check compCapeCreatableBank in skillcapes.ts to ensure all capes are being refunded
			const refundBank = new Bank();
			for (const { masterCape } of Skillcapes) {
				if (user.cl.has(masterCape.id)) {
					refundBank.add(masterCape);
				}
			}
			refundBank.add('Master quest cape');
			refundBank.add('Achievement diary cape (t)');
			refundBank.add('Music cape (t)');
			return refundBank;
		},
		inputItems: new Bank().add('Completionist cape').add('Completionist hood'),
		noCl: true
	},
	{
		name: 'Revert completionist cape (t)',
		inputItems: new Bank().add('Completionist cape (t)').add('Completionist hood (t)'),
		outputItems: new Bank().add('Completionist cape').add('Completionist hood'),
		noCl: true
	},
	...ghostCreatables,
	...divinationCreatables,
	{
		name: 'Sundial scimitar',
		inputItems: new Bank().add('Solite', 7500).add('Atomic energy', 30_000).add('Dragon scimitar'),
		outputItems: new Bank().add('Sundial scimitar')
	},
	{
		name: 'Offhand spidergore rapier',
		inputItems: new Bank().add('Offhand drygore rapier').add('Spiders leg bottom'),
		outputItems: new Bank().add('Offhand spidergore rapier')
	},
	{
		name: 'Lumina (Materials)',
		inputItems: new Bank().add('Elder rune', 30),
		outputItems: new Bank().add('Lumina'),
		materialCost: new MaterialBank({
			wooden: 15
		})
	},
	{
		name: 'Clue scroll (elder)',
		inputItems: new Bank().add('Elder scroll piece', 3),
		outputItems: new Bank().add('Clue scroll (elder)')
	},
	{
		name: 'Tidal collector (i)',
		inputItems: new Bank()
			.add('Masori components', 4)
			.add("Blessed dizana's quiver", 5)
			.add('Tidal collector')
			.add('Armadylean components', 10)
			.add('Pernix components', 3),
		outputItems: new Bank().add('Tidal collector (i)')
	}
];

const potionOfLightLogs = [
	{
		item: getOSItem('Elder logs'),
		qty: 5
	},
	{
		item: getOSItem('Redwood logs'),
		qty: 10
	},
	{
		item: getOSItem('Magic logs'),
		qty: 30
	},
	{
		item: getOSItem('Yew logs'),
		qty: 50
	}
];

for (const { item, qty } of potionOfLightLogs) {
	BsoCreateables.push({
		name: `Lumina (${item.name})`,
		inputItems: new Bank().add('Elder rune', 30).add(item, qty),
		outputItems: new Bank().add('Lumina')
	});
}

for (const { cape, skills } of expertCapesSource) {
	const capeBank = new Bank().add(cape.id).freeze();

	BsoCreateables.push({
		name: `Revert ${cape.name}`,
		inputItems: capeBank,
		outputItems: user => {
			const refundLoot = new Bank();
			for (const skill of skills) {
				const skillCape = Skillcapes.find(c => c.skill === skill)!;
				if (user.cl.has(skillCape.masterCape.id)) {
					refundLoot.add(skillCape.masterCape);
				}
			}
			return refundLoot;
		},
		noCl: true
	});
}
