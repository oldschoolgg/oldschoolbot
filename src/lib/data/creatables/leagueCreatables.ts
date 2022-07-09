import { Bank } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import { Createable } from '../createables';

const toolCreatables: Createable[] = [
	{
		name: 'Dragon axe (or)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Dragon axe': 1
		}),
		outputItems: new Bank().add('Dragon axe (or)')
	},
	{
		name: 'Revert Dragon axe (or)',
		inputItems: new Bank({
			'Dragon axe (or)': 1
		}),
		outputItems: new Bank().add('Dragon axe').add('Trailblazer tool ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Dragon harpoon (or)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Dragon harpoon': 1
		}),
		outputItems: new Bank().add('Dragon harpoon (or)')
	},
	{
		name: 'Revert Dragon harpoon (or)',
		inputItems: new Bank({
			'Dragon harpoon (or)': 1
		}),
		outputItems: new Bank().add('Dragon harpoon').add('Trailblazer tool ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Infernal axe (or)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Infernal axe': 1
		}),
		outputItems: new Bank().add('Infernal axe (or)')
	},
	{
		name: 'Revert Infernal axe (or)',
		inputItems: new Bank({
			'Infernal axe (or)': 1
		}),
		outputItems: new Bank().add('Infernal axe').add('Trailblazer tool ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Infernal harpoon (or)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Infernal harpoon': 1
		}),
		outputItems: new Bank().add('Infernal harpoon (or)')
	},
	{
		name: 'Revert Infernal harpoon (or)',
		inputItems: new Bank({
			'Infernal harpoon (or)': 1
		}),
		outputItems: new Bank().add('Infernal harpoon').add('Trailblazer tool ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Infernal pickaxe (or)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Infernal pickaxe': 1
		}),
		outputItems: new Bank().add('Infernal pickaxe (or)')
	},
	{
		name: 'Revert Infernal pickaxe (or)',
		inputItems: new Bank({
			'Infernal pickaxe (or)': 1
		}),
		outputItems: new Bank().add('Infernal pickaxe').add('Trailblazer tool ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Dragon pickaxe (or) (Trailblazer)',
		inputItems: new Bank({
			'Trailblazer tool ornament kit': 1,
			'Dragon pickaxe': 1
		}),
		outputItems: new Bank().add('Dragon pickaxe (or) (Trailblazer)')
	},
	{
		name: 'Revert Dragon pickaxe (or) (Trailblazer)',
		inputItems: new Bank({
			'Dragon pickaxe (or) (Trailblazer)': 1
		}),
		outputItems: new Bank().add('Dragon pickaxe').add('Trailblazer tool ornament kit'),
		noCl: true
	}
];

const varietyOrnaments: Createable[] = [
	{
		name: 'Abyssal tentacle (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Abyssal tentacle': 1
		}),
		outputItems: new Bank().add('Abyssal tentacle (or)')
	},
	{
		name: 'Revert Abyssal tentacle (or)',
		inputItems: new Bank({
			'Abyssal tentacle (or)': 1
		}),
		outputItems: new Bank().add('Abyssal tentacle').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Abyssal whip (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Abyssal whip': 1
		}),
		outputItems: new Bank().add('Abyssal whip (or)')
	},
	{
		name: 'Revert Abyssal whip (or)',
		inputItems: new Bank({
			'Abyssal whip (or)': 1
		}),
		outputItems: new Bank().add('Abyssal whip').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Book of balance (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Book of balance': 1
		}),
		outputItems: new Bank().add('Book of balance (or)')
	},
	{
		name: 'Revert Book of balance (or)',
		inputItems: new Bank({
			'Book of balance (or)': 1
		}),
		outputItems: new Bank().add('Book of balance').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Book of darkness (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Book of darkness': 1
		}),
		outputItems: new Bank().add('Book of darkness (or)')
	},
	{
		name: 'Revert Book of darkness (or)',
		inputItems: new Bank({
			'Book of darkness (or)': 1
		}),
		outputItems: new Bank().add('Book of darkness').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Book of law (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Book of law': 1
		}),
		outputItems: new Bank().add('Book of law (or)')
	},
	{
		name: 'Revert Book of law (or)',
		inputItems: new Bank({
			'Book of law (or)': 1
		}),
		outputItems: new Bank().add('Book of law').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Book of war (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Book of war': 1
		}),
		outputItems: new Bank().add('Book of war (or)')
	},
	{
		name: 'Revert Book of war (or)',
		inputItems: new Bank({
			'Book of war (or)': 1
		}),
		outputItems: new Bank().add('Book of war').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Holy book (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Holy book': 1
		}),
		outputItems: new Bank().add('Holy book (or)')
	},
	{
		name: 'Revert Holy book (or)',
		inputItems: new Bank({
			'Holy book (or)': 1
		}),
		outputItems: new Bank().add('Holy book').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Unholy book (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Unholy book': 1
		}),
		outputItems: new Bank().add('Unholy book (or)')
	},
	{
		name: 'Revert Unholy book (or)',
		inputItems: new Bank({
			'Unholy book (or)': 1
		}),
		outputItems: new Bank().add('Unholy book').add('Shattered relics variety ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Rune crossbow (or)',
		inputItems: new Bank({
			'Shattered relics variety ornament kit': 1,
			'Rune crossbow': 1
		}),
		outputItems: new Bank().add('Rune crossbow (or)')
	},
	{
		name: 'Revert Rune crossbow (or)',
		inputItems: new Bank({
			'Rune crossbow (or)': 1
		}),
		outputItems: new Bank().add('Rune crossbow').add('Shattered relics variety ornament kit'),
		noCl: true
	}
];

const voidOrnaments: Createable[] = [
	{
		name: 'Elite void robe (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Elite void robe': 1
		}),
		outputItems: new Bank().add('Elite void robe (or)')
	},
	{
		name: 'Revert Elite void robe (or))',
		inputItems: new Bank({
			'Elite void robe (or)': 1
		}),
		outputItems: new Bank().add('Elite void robe').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Elite void top (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Elite void top': 1
		}),
		outputItems: new Bank().add('Elite void top (or)')
	},
	{
		name: 'Revert Elite void top (or))',
		inputItems: new Bank({
			'Elite void top (or)': 1
		}),
		outputItems: new Bank().add('Elite void top').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void knight gloves (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void knight gloves': 1
		}),
		outputItems: new Bank().add('Void knight gloves (or)')
	},
	{
		name: 'Revert Void knight gloves (or)',
		inputItems: new Bank({
			'Void knight gloves (or)': 1
		}),
		outputItems: new Bank().add('Void knight gloves').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void knight top (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void knight top': 1
		}),
		outputItems: new Bank().add('Void knight top (or)')
	},
	{
		name: 'Revert Void knight top (or)',
		inputItems: new Bank({
			'Void knight top (or)': 1
		}),
		outputItems: new Bank().add('Void knight top').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void knight robe (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void knight robe': 1
		}),
		outputItems: new Bank().add('Void knight robe (or)')
	},
	{
		name: 'Revert Void knight robe (or)',
		inputItems: new Bank({
			'Void knight robe (or)': 1
		}),
		outputItems: new Bank().add('Void knight robe').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void mage helm (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void mage helm': 1
		}),
		outputItems: new Bank().add('Void mage helm (or)')
	},
	{
		name: 'Revert Void mage helm (or)',
		inputItems: new Bank({
			'Void mage helm (or)': 1
		}),
		outputItems: new Bank().add('Void mage helm').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void melee helm (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void melee helm': 1
		}),
		outputItems: new Bank().add('Void melee helm (or)')
	},
	{
		name: 'Revert Void melee helm (or)',
		inputItems: new Bank({
			'Void melee helm (or)': 1
		}),
		outputItems: new Bank().add('Void melee helm').add('Shattered relics void ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Void ranger helm (or)',
		inputItems: new Bank({
			'Shattered relics void ornament kit': 1,
			'Void ranger helm': 1
		}),
		outputItems: new Bank().add('Void ranger helm (or)')
	},
	{
		name: 'Revert Void ranger helm (or)',
		inputItems: new Bank({
			'Void ranger helm (or)': 1
		}),
		outputItems: new Bank().add('Void ranger helm').add('Shattered relics void ornament kit'),
		noCl: true
	}
];

const mysticOrnaments: Createable[] = [
	{
		name: 'Mystic boots (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Mystic boots': 1
		}),
		outputItems: new Bank().add('Mystic boots (or)')
	},
	{
		name: 'Revert Mystic boots (or)',
		inputItems: new Bank({
			'Mystic boots (or)': 1
		}),
		outputItems: new Bank().add('Mystic boots').add('Shattered relics mystic ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Mystic gloves (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Mystic gloves': 1
		}),
		outputItems: new Bank().add('Mystic gloves (or)')
	},
	{
		name: 'Revert Mystic gloves (or)',
		inputItems: new Bank({
			'Mystic gloves (or)': 1
		}),
		outputItems: new Bank().add('Mystic gloves').add('Shattered relics mystic ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Mystic hat (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Mystic hat': 1
		}),
		outputItems: new Bank().add('Mystic hat (or)')
	},
	{
		name: 'Revert Mystic hat (or)',
		inputItems: new Bank({
			'Mystic hat (or)': 1
		}),
		outputItems: new Bank().add('Mystic hat').add('Shattered relics mystic ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Mystic robe bottom (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Mystic robe bottom': 1
		}),
		outputItems: new Bank().add('Mystic robe bottom (or)')
	},
	{
		name: 'Revert Mystic robe bottom (or)',
		inputItems: new Bank({
			'Mystic robe bottom (or)': 1
		}),
		outputItems: new Bank().add('Mystic robe bottom').add('Shattered relics mystic ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Mystic robe top (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Mystic robe top': 1
		}),
		outputItems: new Bank().add('Mystic robe top (or)')
	},
	{
		name: 'Revert Mystic robe top (or)',
		inputItems: new Bank({
			'Mystic robe top (or)': 1
		}),
		outputItems: new Bank().add('Mystic robe top').add('Shattered relics mystic ornament kit'),
		noCl: true
	}
];

const cannonOrnaments: Createable[] = [
	{
		name: 'Cannon barrels (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Cannon barrels': 1
		}),
		outputItems: new Bank().add('Cannon barrels (or)')
	},
	{
		name: 'Revert Cannon barrels (or)',
		inputItems: new Bank({
			'Cannon barrels (or)': 1
		}),
		outputItems: new Bank().add('Cannon barrels').add('Shattered cannon ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Cannon base (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Cannon base': 1
		}),
		outputItems: new Bank().add('Cannon base (or)')
	},
	{
		name: 'Revert Cannon base (or)',
		inputItems: new Bank({
			'Cannon base (or)': 1
		}),
		outputItems: new Bank().add('Cannon base').add('Shattered cannon ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Cannon furnace (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Cannon furnace': 1
		}),
		outputItems: new Bank().add('Cannon furnace (or)')
	},
	{
		name: 'Revert Cannon furnace (or)',
		inputItems: new Bank({
			'Cannon furnace (or)': 1
		}),
		outputItems: new Bank().add('Cannon furnace').add('Shattered cannon ornament kit'),
		noCl: true
	},
	//
	{
		name: 'Cannon stand (or)',
		inputItems: new Bank({
			'Shattered relics mystic ornament kit': 1,
			'Cannon stand': 1
		}),
		outputItems: new Bank().add('Cannon stand (or)')
	},
	{
		name: 'Revert Cannon stand (or)',
		inputItems: new Bank({
			'Cannon stand (or)': 1
		}),
		outputItems: new Bank().add('Cannon stand').add('Shattered cannon ornament kit'),
		noCl: true
	}
];

const other: Createable[] = [
	{
		name: 'Twisted slayer helmet',
		inputItems: new Bank({
			'Twisted horns': 1,
			'Slayer helmet': 1
		}),
		outputItems: new Bank().add('Twisted slayer helmet'),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Revert Twisted slayer helmet',
		inputItems: new Bank({
			'Twisted slayer helmet': 1
		}),
		outputItems: new Bank().add('Slayer helmet').add('Twisted horns'),
		noCl: true,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Twisted slayer helmet (i)',
		inputItems: new Bank({
			'Twisted horns': 1,
			'Slayer helmet (i)': 1
		}),
		outputItems: new Bank().add('Twisted slayer helmet (i)'),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.TwistedVision]
	},
	{
		name: 'Revert Twisted slayer helmet (i)',
		inputItems: new Bank({
			'Twisted slayer helmet (i)': 1
		}),
		outputItems: new Bank().add('Slayer helmet (i)').add('Twisted horns'),
		noCl: true,
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.TwistedVision]
	}
];

export const leaguesCreatables = [
	...toolCreatables,
	...varietyOrnaments,
	...voidOrnaments,
	...cannonOrnaments,
	...mysticOrnaments,
	...other
];
console.log(leaguesCreatables.map(i => `${i.name} - Created with ${i.inputItems} - Gives ${i.outputItems}`).join('\n'));
