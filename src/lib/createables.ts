import { Bank } from './types';
import itemID from './util/itemID';
import { resolveNameBank } from './util';

interface Createable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	smithingLevel?: number;
	cantHaveItems?: Bank;
	firemakingLevel?: number;
	craftingLevel?: number;
	prayerLevel?: number;
	agilityLevel?: number;
	fletchingLevel?: number;
	QPRequired?: number;
	noCl?: boolean;
	unlockListName?: string;
}

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
		smithingLevel: 80
	},
	{
		name: 'Armadyl godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Armadyl hilt')]: 1
		},
		outputItems: {
			[itemID('Armadyl godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Bandos godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Bandos hilt')]: 1
		},
		outputItems: {
			[itemID('Bandos godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Saradomin godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Saradomin hilt')]: 1
		},
		outputItems: {
			[itemID('Saradomin godsword')]: 1
		},
		smithingLevel: 80
	},
	{
		name: 'Zamorak godsword',
		inputItems: {
			[itemID('Godsword blade')]: 1,
			[itemID('Zamorak hilt')]: 1
		},
		outputItems: {
			[itemID('Zamorak godsword')]: 1
		},
		smithingLevel: 80
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
		smithingLevel: 90
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
		smithingLevel: 90
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
		smithingLevel: 85
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
		firemakingLevel: 85
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

		craftingLevel: 10
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

		craftingLevel: 20
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
		craftingLevel: 30
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
		prayerLevel: 85
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
		prayerLevel: 90,
		smithingLevel: 85
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
		prayerLevel: 90,
		smithingLevel: 85
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
		prayerLevel: 90,
		smithingLevel: 85
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
		agilityLevel: 35,
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
		agilityLevel: 35,
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
		agilityLevel: 35,
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
		agilityLevel: 35,
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
		agilityLevel: 35,
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
		agilityLevel: 35,
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
	// Slayer helmets
	{
		name: 'Slayer helmet',
		inputItems: resolveNameBank({
			'Black mask': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		outputItems: resolveNameBank({
			'Slayer helmet': 1
		}),
		craftingLevel: 55,
		unlockListName: 'Malevolent masquerade'
	},
	{
		name: 'Slayer helmet (i)',
		inputItems: resolveNameBank({
			'Black mask (i)': 1,
			Earmuffs: 1,
			Facemask: 1,
			'Nose peg': 1,
			'Spiny helmet': 1,
			'Enchanted gem': 1
		}),
		outputItems: resolveNameBank({
			'Slayer helmet (i)': 1
		}),
		craftingLevel: 55,
		unlockListName: 'Malevolent masquerade'
	},
	{
		name: 'Black slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Kbd heads': 1
		}),
		outputItems: resolveNameBank({
			'Black slayer helmet': 1
		}),
		unlockListName: 'King black bonnet'
	},
	{
		name: 'Black slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Kbd heads': 1
		}),
		outputItems: resolveNameBank({
			'Black slayer helmet (i)': 1
		}),
		unlockListName: 'King black bonnet'
	},
	{
		name: 'Green slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Kq head': 1
		}),
		outputItems: resolveNameBank({
			'Green slayer helmet': 1
		}),
		unlockListName: 'Kalphite khat'
	},
	{
		name: 'Green slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Kq head': 1
		}),
		outputItems: resolveNameBank({
			'Green slayer helmet (i)': 1
		}),
		unlockListName: 'Kalphite khat'
	},
	{
		name: 'Red slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Abyssal head': 1
		}),
		outputItems: resolveNameBank({
			'Red slayer helmet': 1
		}),
		unlockListName: 'Unholy helmet'
	},
	{
		name: 'Red slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Abyssal head': 1
		}),
		outputItems: resolveNameBank({
			'Red slayer helmet (i)': 1
		}),
		unlockListName: 'Unholy helmet'
	},
	{
		name: 'Purple slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Dark claw': 1
		}),
		outputItems: resolveNameBank({
			'Purple slayer helmet': 1
		}),
		unlockListName: 'Dark Mantle'
	},
	{
		name: 'Purple slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Dark claw': 1
		}),
		outputItems: resolveNameBank({
			'Purple slayer helmet (i)': 1
		}),
		unlockListName: 'Dark Mantle'
	},
	{
		name: 'Turquoise slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			"Vorkath's head": 1
		}),
		outputItems: resolveNameBank({
			'Turquoise slayer helmet': 1
		}),
		unlockListName: 'Undead Head'
	},
	{
		name: 'Turquoise slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			"Vorkath's head": 1
		}),
		outputItems: resolveNameBank({
			'Turquoise slayer helmet (i)': 1
		}),
		unlockListName: 'Undead Head'
	},
	{
		name: 'Hydra slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Alchemical hydra heads': 1
		}),
		outputItems: resolveNameBank({
			'Hydra slayer helmet': 1
		}),
		unlockListName: 'Use more head'
	},
	{
		name: 'Hydra slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Alchemical hydra heads': 1
		}),
		outputItems: resolveNameBank({
			'Hydra slayer helmet (i)': 1
		}),
		unlockListName: 'Use more head'
	},
	{
		name: 'Twisted slayer helmet',
		inputItems: resolveNameBank({
			'Slayer helmet': 1,
			'Twisted horns': 1
		}),
		outputItems: resolveNameBank({
			'Twisted slayer helmet': 1
		}),
		unlockListName: 'Twisted Vision'
	},
	{
		name: 'Twisted slayer helmet (i)',
		inputItems: resolveNameBank({
			'Slayer helmet (i)': 1,
			'Twisted horns': 1
		}),
		outputItems: resolveNameBank({
			'Twisted slayer helmet (i)': 1
		}),
		unlockListName: 'Twisted Vision'
	},
	{
		name: 'Slayer ring',
		inputItems: resolveNameBank({
			'Enchanted gem': 1,
			'Gold bar': 1
		}),
		outputItems: resolveNameBank({
			'Slayer ring (8)': 1
		}),
		craftingLevel: 75,
		unlockListName: 'Ring bling'
	},
	{
		name: 'Slayer ring (eternal)',
		inputItems: resolveNameBank({
			'Eternal gem': 1,
			'Gold bar': 1
		}),
		outputItems: resolveNameBank({
			'Slayer ring (eternal)': 1
		}),
		craftingLevel: 75,
		unlockListName: 'Ring bling'
	},
	{
		name: 'Dark totem',
		inputItems: resolveNameBank({
			'Dark totem top': 1,
			'Dark totem middle': 1,
			'Dark totem base': 1
		}),
		outputItems: resolveNameBank({
			'Dark totem': 1
		})
	}
	/* , {
		name: 'Toxic blowpipe (empty)',
		inputItems: {
			[itemID('Toxic blowpipe')]: 1
		},
		outputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		}
	},
	{
		name: 'Toxic blowpipe',
		inputItems: {
			[itemID('Toxic blowpipe (empty)')]: 1,
			[itemID(`Zulrah's Scales`)]: 25000
		},
		outputItems: {
			[itemID('Toxic blowpipe')]: 1
		}
	} */
];

export default Createables;
