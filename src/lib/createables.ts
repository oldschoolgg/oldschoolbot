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
	/**
	 * Prospector outfit
	 */
	{
		name: 'Prospector',
		inputItems: {
			[itemID('Golden nugget')]: 180
		},
		outputItems: {
			[itemID('Prospector helmet')]: 1,
			[itemID('Prospector jacket')]: 1,
			[itemID('Prospector legs')]: 1,
			[itemID('Prospector boots')]: 1
		}
	},
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
		smithingLevel: 60
	},
	{
		name: 'Avernic defender',
		inputItems: {
			[itemID('Avernic defender hilt')]: 1,
			[itemID('Dragon defender')]: 1
		},
		outputItems: {
			[itemID('Avernic defender')]: 1
		},
		noCl: true
	},
	{
		name: 'Kodai wand',
		inputItems: {
			[itemID('master wand')]: 1,
			[itemID('kodai insignia')]: 1
		},
		outputItems: {
			[itemID('kodai wand')]: 1
		},
		noCl: true
	},
	// Melee armour sets
	// bronze
	{
		name: 'Bronze (lg)',
		inputItems: {
			[itemID('Bronze set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze platelegs')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze set (lg)',
		inputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze platelegs')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bronze set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze (sk)',
		inputItems: {
			[itemID('Bronze set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze plateskirt')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze set (sk)',
		inputItems: {
			[itemID('Bronze full helm')]: 1,
			[itemID('Bronze platebody')]: 1,
			[itemID('Bronze plateskirt')]: 1,
			[itemID('Bronze kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bronze set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed (lg)',
		inputItems: {
			[itemID('Bronze trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze platelegs (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed set (lg)',
		inputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze platelegs (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Bronze trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed (sk)',
		inputItems: {
			[itemID('Bronze trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze plateskirt (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze trimmed set (sk)',
		inputItems: {
			[itemID('Bronze full helm (t)')]: 1,
			[itemID('Bronze platebody (t)')]: 1,
			[itemID('Bronze plateskirt (t)')]: 1,
			[itemID('Bronze kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Bronze trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed (lg)',
		inputItems: {
			[itemID('Bronze gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze platelegs (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed set (lg)',
		inputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze platelegs (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Bronze gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed (sk)',
		inputItems: {
			[itemID('Bronze gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze plateskirt (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Bronze gold-trimmed set (sk)',
		inputItems: {
			[itemID('Bronze full helm (g)')]: 1,
			[itemID('Bronze platebody (g)')]: 1,
			[itemID('Bronze plateskirt (g)')]: 1,
			[itemID('Bronze kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Bronze gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// iron
	{
		name: 'iron (lg)',
		inputItems: {
			[itemID('iron set (lg)')]: 1
		},
		outputItems: {
			[itemID('iron full helm')]: 1,
			[itemID('iron platebody')]: 1,
			[itemID('iron platelegs')]: 1,
			[itemID('iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'iron set (lg)',
		inputItems: {
			[itemID('iron full helm')]: 1,
			[itemID('iron platebody')]: 1,
			[itemID('iron platelegs')]: 1,
			[itemID('iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('iron set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron (sk)',
		inputItems: {
			[itemID('iron set (sk)')]: 1
		},
		outputItems: {
			[itemID('iron full helm')]: 1,
			[itemID('iron platebody')]: 1,
			[itemID('iron plateskirt')]: 1,
			[itemID('iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'iron set (sk)',
		inputItems: {
			[itemID('iron full helm')]: 1,
			[itemID('iron platebody')]: 1,
			[itemID('iron plateskirt')]: 1,
			[itemID('iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('iron set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron trimmed (lg)',
		inputItems: {
			[itemID('iron trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('iron full helm (t)')]: 1,
			[itemID('iron platebody (t)')]: 1,
			[itemID('iron platelegs (t)')]: 1,
			[itemID('iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron trimmed set (lg)',
		inputItems: {
			[itemID('iron full helm (t)')]: 1,
			[itemID('iron platebody (t)')]: 1,
			[itemID('iron platelegs (t)')]: 1,
			[itemID('iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('iron trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron trimmed (sk)',
		inputItems: {
			[itemID('iron trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('iron full helm (t)')]: 1,
			[itemID('iron platebody (t)')]: 1,
			[itemID('iron plateskirt (t)')]: 1,
			[itemID('iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron trimmed set (sk)',
		inputItems: {
			[itemID('iron full helm (t)')]: 1,
			[itemID('iron platebody (t)')]: 1,
			[itemID('iron plateskirt (t)')]: 1,
			[itemID('iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('iron trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron gold-trimmed (lg)',
		inputItems: {
			[itemID('iron gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('iron full helm (g)')]: 1,
			[itemID('iron platebody (g)')]: 1,
			[itemID('iron platelegs (g)')]: 1,
			[itemID('iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron gold-trimmed set (lg)',
		inputItems: {
			[itemID('iron full helm (g)')]: 1,
			[itemID('iron platebody (g)')]: 1,
			[itemID('iron platelegs (g)')]: 1,
			[itemID('iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('iron gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron gold-trimmed (sk)',
		inputItems: {
			[itemID('iron gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('iron full helm (g)')]: 1,
			[itemID('iron platebody (g)')]: 1,
			[itemID('iron plateskirt (g)')]: 1,
			[itemID('iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'iron gold-trimmed set (sk)',
		inputItems: {
			[itemID('iron full helm (g)')]: 1,
			[itemID('iron platebody (g)')]: 1,
			[itemID('iron plateskirt (g)')]: 1,
			[itemID('iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('iron gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// steel
	{
		name: 'steel (lg)',
		inputItems: {
			[itemID('steel set (lg)')]: 1
		},
		outputItems: {
			[itemID('steel full helm')]: 1,
			[itemID('steel platebody')]: 1,
			[itemID('steel platelegs')]: 1,
			[itemID('steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'steel set (lg)',
		inputItems: {
			[itemID('steel full helm')]: 1,
			[itemID('steel platebody')]: 1,
			[itemID('steel platelegs')]: 1,
			[itemID('steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('steel set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel (sk)',
		inputItems: {
			[itemID('steel set (sk)')]: 1
		},
		outputItems: {
			[itemID('steel full helm')]: 1,
			[itemID('steel platebody')]: 1,
			[itemID('steel plateskirt')]: 1,
			[itemID('steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'steel set (sk)',
		inputItems: {
			[itemID('steel full helm')]: 1,
			[itemID('steel platebody')]: 1,
			[itemID('steel plateskirt')]: 1,
			[itemID('steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('steel set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel trimmed (lg)',
		inputItems: {
			[itemID('steel trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('steel full helm (t)')]: 1,
			[itemID('steel platebody (t)')]: 1,
			[itemID('steel platelegs (t)')]: 1,
			[itemID('steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel trimmed set (lg)',
		inputItems: {
			[itemID('steel full helm (t)')]: 1,
			[itemID('steel platebody (t)')]: 1,
			[itemID('steel platelegs (t)')]: 1,
			[itemID('steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('steel trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel trimmed (sk)',
		inputItems: {
			[itemID('steel trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('steel full helm (t)')]: 1,
			[itemID('steel platebody (t)')]: 1,
			[itemID('steel plateskirt (t)')]: 1,
			[itemID('steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel trimmed set (sk)',
		inputItems: {
			[itemID('steel full helm (t)')]: 1,
			[itemID('steel platebody (t)')]: 1,
			[itemID('steel plateskirt (t)')]: 1,
			[itemID('steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('steel trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel gold-trimmed (lg)',
		inputItems: {
			[itemID('steel gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('steel full helm (g)')]: 1,
			[itemID('steel platebody (g)')]: 1,
			[itemID('steel platelegs (g)')]: 1,
			[itemID('steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel gold-trimmed set (lg)',
		inputItems: {
			[itemID('steel full helm (g)')]: 1,
			[itemID('steel platebody (g)')]: 1,
			[itemID('steel platelegs (g)')]: 1,
			[itemID('steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('steel gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel gold-trimmed (sk)',
		inputItems: {
			[itemID('steel gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('steel full helm (g)')]: 1,
			[itemID('steel platebody (g)')]: 1,
			[itemID('steel plateskirt (g)')]: 1,
			[itemID('steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'steel gold-trimmed set (sk)',
		inputItems: {
			[itemID('steel full helm (g)')]: 1,
			[itemID('steel platebody (g)')]: 1,
			[itemID('steel plateskirt (g)')]: 1,
			[itemID('steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('steel gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// black
	{
		name: 'black (lg)',
		inputItems: {
			[itemID('black set (lg)')]: 1
		},
		outputItems: {
			[itemID('black full helm')]: 1,
			[itemID('black platebody')]: 1,
			[itemID('black platelegs')]: 1,
			[itemID('black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'black set (lg)',
		inputItems: {
			[itemID('black full helm')]: 1,
			[itemID('black platebody')]: 1,
			[itemID('black platelegs')]: 1,
			[itemID('black kiteshield')]: 1
		},
		outputItems: {
			[itemID('black set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'black (sk)',
		inputItems: {
			[itemID('black set (sk)')]: 1
		},
		outputItems: {
			[itemID('black full helm')]: 1,
			[itemID('black platebody')]: 1,
			[itemID('black plateskirt')]: 1,
			[itemID('black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'black set (sk)',
		inputItems: {
			[itemID('black full helm')]: 1,
			[itemID('black platebody')]: 1,
			[itemID('black plateskirt')]: 1,
			[itemID('black kiteshield')]: 1
		},
		outputItems: {
			[itemID('black set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'black trimmed (lg)',
		inputItems: {
			[itemID('black trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('black full helm (t)')]: 1,
			[itemID('black platebody (t)')]: 1,
			[itemID('black platelegs (t)')]: 1,
			[itemID('black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'black trimmed set (lg)',
		inputItems: {
			[itemID('black full helm (t)')]: 1,
			[itemID('black platebody (t)')]: 1,
			[itemID('black platelegs (t)')]: 1,
			[itemID('black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('black trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'black trimmed (sk)',
		inputItems: {
			[itemID('black trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('black full helm (t)')]: 1,
			[itemID('black platebody (t)')]: 1,
			[itemID('black plateskirt (t)')]: 1,
			[itemID('black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'black trimmed set (sk)',
		inputItems: {
			[itemID('black full helm (t)')]: 1,
			[itemID('black platebody (t)')]: 1,
			[itemID('black plateskirt (t)')]: 1,
			[itemID('black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('black trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'black gold-trimmed (lg)',
		inputItems: {
			[itemID('black gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('black full helm (g)')]: 1,
			[itemID('black platebody (g)')]: 1,
			[itemID('black platelegs (g)')]: 1,
			[itemID('black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'black gold-trimmed set (lg)',
		inputItems: {
			[itemID('black full helm (g)')]: 1,
			[itemID('black platebody (g)')]: 1,
			[itemID('black platelegs (g)')]: 1,
			[itemID('black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('black gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'black gold-trimmed (sk)',
		inputItems: {
			[itemID('black gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('black full helm (g)')]: 1,
			[itemID('black platebody (g)')]: 1,
			[itemID('black plateskirt (g)')]: 1,
			[itemID('black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'black gold-trimmed set (sk)',
		inputItems: {
			[itemID('black full helm (g)')]: 1,
			[itemID('black platebody (g)')]: 1,
			[itemID('black plateskirt (g)')]: 1,
			[itemID('black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('black gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// mithril
	{
		name: 'mithril (lg)',
		inputItems: {
			[itemID('mithril set (lg)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm')]: 1,
			[itemID('mithril platebody')]: 1,
			[itemID('mithril platelegs')]: 1,
			[itemID('mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril set (lg)',
		inputItems: {
			[itemID('mithril full helm')]: 1,
			[itemID('mithril platebody')]: 1,
			[itemID('mithril platelegs')]: 1,
			[itemID('mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('mithril set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril (sk)',
		inputItems: {
			[itemID('mithril set (sk)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm')]: 1,
			[itemID('mithril platebody')]: 1,
			[itemID('mithril plateskirt')]: 1,
			[itemID('mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril set (sk)',
		inputItems: {
			[itemID('mithril full helm')]: 1,
			[itemID('mithril platebody')]: 1,
			[itemID('mithril plateskirt')]: 1,
			[itemID('mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('mithril set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril trimmed (lg)',
		inputItems: {
			[itemID('mithril trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm (t)')]: 1,
			[itemID('mithril platebody (t)')]: 1,
			[itemID('mithril platelegs (t)')]: 1,
			[itemID('mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril trimmed set (lg)',
		inputItems: {
			[itemID('mithril full helm (t)')]: 1,
			[itemID('mithril platebody (t)')]: 1,
			[itemID('mithril platelegs (t)')]: 1,
			[itemID('mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('mithril trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril trimmed (sk)',
		inputItems: {
			[itemID('mithril trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm (t)')]: 1,
			[itemID('mithril platebody (t)')]: 1,
			[itemID('mithril plateskirt (t)')]: 1,
			[itemID('mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril trimmed set (sk)',
		inputItems: {
			[itemID('mithril full helm (t)')]: 1,
			[itemID('mithril platebody (t)')]: 1,
			[itemID('mithril plateskirt (t)')]: 1,
			[itemID('mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('mithril trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril gold-trimmed (lg)',
		inputItems: {
			[itemID('mithril gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm (g)')]: 1,
			[itemID('mithril platebody (g)')]: 1,
			[itemID('mithril platelegs (g)')]: 1,
			[itemID('mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril gold-trimmed set (lg)',
		inputItems: {
			[itemID('mithril full helm (g)')]: 1,
			[itemID('mithril platebody (g)')]: 1,
			[itemID('mithril platelegs (g)')]: 1,
			[itemID('mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('mithril gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril gold-trimmed (sk)',
		inputItems: {
			[itemID('mithril gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('mithril full helm (g)')]: 1,
			[itemID('mithril platebody (g)')]: 1,
			[itemID('mithril plateskirt (g)')]: 1,
			[itemID('mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'mithril gold-trimmed set (sk)',
		inputItems: {
			[itemID('mithril full helm (g)')]: 1,
			[itemID('mithril platebody (g)')]: 1,
			[itemID('mithril plateskirt (g)')]: 1,
			[itemID('mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('mithril gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// adamant
	{
		name: 'adamant (lg)',
		inputItems: {
			[itemID('adamant set (lg)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm')]: 1,
			[itemID('adamant platebody')]: 1,
			[itemID('adamant platelegs')]: 1,
			[itemID('adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant set (lg)',
		inputItems: {
			[itemID('adamant full helm')]: 1,
			[itemID('adamant platebody')]: 1,
			[itemID('adamant platelegs')]: 1,
			[itemID('adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('adamant set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant (sk)',
		inputItems: {
			[itemID('adamant set (sk)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm')]: 1,
			[itemID('adamant platebody')]: 1,
			[itemID('adamant plateskirt')]: 1,
			[itemID('adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant set (sk)',
		inputItems: {
			[itemID('adamant full helm')]: 1,
			[itemID('adamant platebody')]: 1,
			[itemID('adamant plateskirt')]: 1,
			[itemID('adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('adamant set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant trimmed (lg)',
		inputItems: {
			[itemID('adamant trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm (t)')]: 1,
			[itemID('adamant platebody (t)')]: 1,
			[itemID('adamant platelegs (t)')]: 1,
			[itemID('adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant trimmed set (lg)',
		inputItems: {
			[itemID('adamant full helm (t)')]: 1,
			[itemID('adamant platebody (t)')]: 1,
			[itemID('adamant platelegs (t)')]: 1,
			[itemID('adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('adamant trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant trimmed (sk)',
		inputItems: {
			[itemID('adamant trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm (t)')]: 1,
			[itemID('adamant platebody (t)')]: 1,
			[itemID('adamant plateskirt (t)')]: 1,
			[itemID('adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant trimmed set (sk)',
		inputItems: {
			[itemID('adamant full helm (t)')]: 1,
			[itemID('adamant platebody (t)')]: 1,
			[itemID('adamant plateskirt (t)')]: 1,
			[itemID('adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('adamant trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant gold-trimmed (lg)',
		inputItems: {
			[itemID('adamant gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm (g)')]: 1,
			[itemID('adamant platebody (g)')]: 1,
			[itemID('adamant platelegs (g)')]: 1,
			[itemID('adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant gold-trimmed set (lg)',
		inputItems: {
			[itemID('adamant full helm (g)')]: 1,
			[itemID('adamant platebody (g)')]: 1,
			[itemID('adamant platelegs (g)')]: 1,
			[itemID('adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('adamant gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant gold-trimmed (sk)',
		inputItems: {
			[itemID('adamant gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('adamant full helm (g)')]: 1,
			[itemID('adamant platebody (g)')]: 1,
			[itemID('adamant plateskirt (g)')]: 1,
			[itemID('adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'adamant gold-trimmed set (sk)',
		inputItems: {
			[itemID('adamant full helm (g)')]: 1,
			[itemID('adamant platebody (g)')]: 1,
			[itemID('adamant plateskirt (g)')]: 1,
			[itemID('adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('adamant gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	// rune
	{
		name: 'rune (lg)',
		inputItems: {
			[itemID('rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('rune full helm')]: 1,
			[itemID('rune platebody')]: 1,
			[itemID('rune platelegs')]: 1,
			[itemID('rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'rune set (lg)',
		inputItems: {
			[itemID('rune full helm')]: 1,
			[itemID('rune platebody')]: 1,
			[itemID('rune platelegs')]: 1,
			[itemID('rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune (sk)',
		inputItems: {
			[itemID('rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('rune full helm')]: 1,
			[itemID('rune platebody')]: 1,
			[itemID('rune plateskirt')]: 1,
			[itemID('rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'rune set (sk)',
		inputItems: {
			[itemID('rune full helm')]: 1,
			[itemID('rune platebody')]: 1,
			[itemID('rune plateskirt')]: 1,
			[itemID('rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('rune armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune trimmed (lg)',
		inputItems: {
			[itemID('rune trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('rune full helm (t)')]: 1,
			[itemID('rune platebody (t)')]: 1,
			[itemID('rune platelegs (t)')]: 1,
			[itemID('rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune trimmed set (lg)',
		inputItems: {
			[itemID('rune full helm (t)')]: 1,
			[itemID('rune platebody (t)')]: 1,
			[itemID('rune platelegs (t)')]: 1,
			[itemID('rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('rune trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune trimmed (sk)',
		inputItems: {
			[itemID('rune trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('rune full helm (t)')]: 1,
			[itemID('rune platebody (t)')]: 1,
			[itemID('rune plateskirt (t)')]: 1,
			[itemID('rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune trimmed set (sk)',
		inputItems: {
			[itemID('rune full helm (t)')]: 1,
			[itemID('rune platebody (t)')]: 1,
			[itemID('rune plateskirt (t)')]: 1,
			[itemID('rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('rune trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed (lg)',
		inputItems: {
			[itemID('rune gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune platelegs (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed set (lg)',
		inputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune platelegs (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('rune gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed (sk)',
		inputItems: {
			[itemID('rune gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune plateskirt (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed set (sk)',
		inputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune plateskirt (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('rune gold-trimmed set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed (lg)',
		inputItems: {
			[itemID('rune gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune platelegs (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'rune gold-trimmed set (lg)',
		inputItems: {
			[itemID('rune full helm (g)')]: 1,
			[itemID('rune platebody (g)')]: 1,
			[itemID('rune platelegs (g)')]: 1,
			[itemID('rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('rune gold-trimmed set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded (lg)',
		inputItems: {
			[itemID('gilded armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('gilded full helm')]: 1,
			[itemID('gilded platebody')]: 1,
			[itemID('gilded platelegs')]: 1,
			[itemID('gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded set (lg)',
		inputItems: {
			[itemID('gilded full helm')]: 1,
			[itemID('gilded platebody')]: 1,
			[itemID('gilded platelegs')]: 1,
			[itemID('gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('gilded armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded (sk)',
		inputItems: {
			[itemID('gilded armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('gilded full helm')]: 1,
			[itemID('gilded platebody')]: 1,
			[itemID('gilded plateskirt')]: 1,
			[itemID('gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded set (sk)',
		inputItems: {
			[itemID('gilded full helm')]: 1,
			[itemID('gilded platebody')]: 1,
			[itemID('gilded plateskirt')]: 1,
			[itemID('gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('gilded armour set (sk)')]: 1
		},
		noCl: true
	},
	// rune god armours
	{
		name: 'guthix (lg)',
		inputItems: {
			[itemID('guthix armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('guthix full helm')]: 1,
			[itemID('guthix platebody')]: 1,
			[itemID('guthix platelegs')]: 1,
			[itemID('guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'guthix set (lg)',
		inputItems: {
			[itemID('guthix full helm')]: 1,
			[itemID('guthix platebody')]: 1,
			[itemID('guthix platelegs')]: 1,
			[itemID('guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'guthix (sk)',
		inputItems: {
			[itemID('rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('guthix full helm')]: 1,
			[itemID('guthix platebody')]: 1,
			[itemID('guthix plateskirt')]: 1,
			[itemID('guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'guthix set (sk)',
		inputItems: {
			[itemID('guthix full helm')]: 1,
			[itemID('guthix platebody')]: 1,
			[itemID('guthix plateskirt')]: 1,
			[itemID('guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('guthix armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin (lg)',
		inputItems: {
			[itemID('saradomin armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('saradomin full helm')]: 1,
			[itemID('saradomin platebody')]: 1,
			[itemID('saradomin platelegs')]: 1,
			[itemID('saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin set (lg)',
		inputItems: {
			[itemID('saradomin full helm')]: 1,
			[itemID('saradomin platebody')]: 1,
			[itemID('saradomin platelegs')]: 1,
			[itemID('saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin (sk)',
		inputItems: {
			[itemID('rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('saradomin full helm')]: 1,
			[itemID('saradomin platebody')]: 1,
			[itemID('saradomin plateskirt')]: 1,
			[itemID('saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin set (sk)',
		inputItems: {
			[itemID('saradomin full helm')]: 1,
			[itemID('saradomin platebody')]: 1,
			[itemID('saradomin plateskirt')]: 1,
			[itemID('saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('saradomin armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak (lg)',
		inputItems: {
			[itemID('zamorak armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('zamorak full helm')]: 1,
			[itemID('zamorak platebody')]: 1,
			[itemID('zamorak platelegs')]: 1,
			[itemID('zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak set (lg)',
		inputItems: {
			[itemID('zamorak full helm')]: 1,
			[itemID('zamorak platebody')]: 1,
			[itemID('zamorak platelegs')]: 1,
			[itemID('zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak (sk)',
		inputItems: {
			[itemID('rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('zamorak full helm')]: 1,
			[itemID('zamorak platebody')]: 1,
			[itemID('zamorak plateskirt')]: 1,
			[itemID('zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak set (sk)',
		inputItems: {
			[itemID('zamorak full helm')]: 1,
			[itemID('zamorak platebody')]: 1,
			[itemID('zamorak plateskirt')]: 1,
			[itemID('zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('zamorak armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient (lg)',
		inputItems: {
			[itemID('ancient rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('ancient full helm')]: 1,
			[itemID('ancient platebody')]: 1,
			[itemID('ancient platelegs')]: 1,
			[itemID('ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient set (lg)',
		inputItems: {
			[itemID('ancient full helm')]: 1,
			[itemID('ancient platebody')]: 1,
			[itemID('ancient platelegs')]: 1,
			[itemID('ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('ancient rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient (sk)',
		inputItems: {
			[itemID('ancient rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('ancient full helm')]: 1,
			[itemID('ancient platebody')]: 1,
			[itemID('ancient plateskirt')]: 1,
			[itemID('ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient set (sk)',
		inputItems: {
			[itemID('ancient full helm')]: 1,
			[itemID('ancient platebody')]: 1,
			[itemID('ancient plateskirt')]: 1,
			[itemID('ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('ancient rune armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl (lg)',
		inputItems: {
			[itemID('armadyl rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('armadyl full helm')]: 1,
			[itemID('armadyl platebody')]: 1,
			[itemID('armadyl platelegs')]: 1,
			[itemID('armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl set (lg)',
		inputItems: {
			[itemID('armadyl full helm')]: 1,
			[itemID('armadyl platebody')]: 1,
			[itemID('armadyl platelegs')]: 1,
			[itemID('armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('armadyl rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl (sk)',
		inputItems: {
			[itemID('armadyl rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('armadyl full helm')]: 1,
			[itemID('armadyl platebody')]: 1,
			[itemID('armadyl plateskirt')]: 1,
			[itemID('armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl set (sk)',
		inputItems: {
			[itemID('armadyl full helm')]: 1,
			[itemID('armadyl platebody')]: 1,
			[itemID('armadyl plateskirt')]: 1,
			[itemID('armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('armadyl rune armour set (sk)')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos (lg)',
		inputItems: {
			[itemID('bandos rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('bandos full helm')]: 1,
			[itemID('bandos platebody')]: 1,
			[itemID('bandos platelegs')]: 1,
			[itemID('bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos set (lg)',
		inputItems: {
			[itemID('bandos full helm')]: 1,
			[itemID('bandos platebody')]: 1,
			[itemID('bandos platelegs')]: 1,
			[itemID('bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('bandos rune armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos (sk)',
		inputItems: {
			[itemID('bandos rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('bandos full helm')]: 1,
			[itemID('bandos platebody')]: 1,
			[itemID('bandos plateskirt')]: 1,
			[itemID('bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos set (sk)',
		inputItems: {
			[itemID('bandos full helm')]: 1,
			[itemID('bandos platebody')]: 1,
			[itemID('bandos plateskirt')]: 1,
			[itemID('bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('bandos rune armour set (sk)')]: 1
		},
		noCl: true
	},
	// dragon
	{
		name: 'dragon (lg)',
		inputItems: {
			[itemID('dragon armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('dragon full helm')]: 1,
			[itemID('dragon platebody')]: 1,
			[itemID('dragon platelegs')]: 1,
			[itemID('dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'dragon set (lg)',
		inputItems: {
			[itemID('dragon full helm')]: 1,
			[itemID('dragon platebody')]: 1,
			[itemID('dragon platelegs')]: 1,
			[itemID('dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('dragon armour set (lg)')]: 1
		},
		noCl: true
	},
	{
		name: 'dragon (sk)',
		inputItems: {
			[itemID('dragon armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('dragon full helm')]: 1,
			[itemID('dragon platebody')]: 1,
			[itemID('dragon plateskirt')]: 1,
			[itemID('dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'dragon set (sk)',
		inputItems: {
			[itemID('dragon full helm')]: 1,
			[itemID('dragon platebody')]: 1,
			[itemID('dragon plateskirt')]: 1,
			[itemID('dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('dragon armour set (sk)')]: 1
		},
		noCl: true
	},
	// barrows
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
	// inquisitor
	{
		name: "Inquisitor's",
		inputItems: {
			[itemID("Inquisitor's armour set")]: 1
		},
		outputItems: {
			[itemID("Inquisitor's great helm")]: 1,
			[itemID("Inquisitor's hauberk")]: 1,
			[itemID("Inquisitor's plateskirt")]: 1
		},
		noCl: true
	},
	{
		name: "Inquisitor's armour set",
		inputItems: {
			[itemID("Inquisitor's great helm")]: 1,
			[itemID("Inquisitor's hauberk")]: 1,
			[itemID("Inquisitor's plateskirt")]: 1
		},
		outputItems: {
			[itemID("Inquisitor's armour set")]: 1
		}
	},
	// justiciar
	{
		name: 'Justiciar',
		inputItems: {
			[itemID('Justiciar armour set')]: 1
		},
		outputItems: {
			[itemID('Justiciar faceguard')]: 1,
			[itemID('Justiciar chestguard')]: 1,
			[itemID('Justiciar legguards')]: 1
		},
		noCl: true
	},
	{
		name: 'Justiciar armour set',
		inputItems: {
			[itemID('Justiciar faceguard')]: 1,
			[itemID('Justiciar chestguard')]: 1,
			[itemID('Justiciar legguards')]: 1
		},
		outputItems: {
			[itemID('Justiciar armour set')]: 1
		}
	},
	// obsidian
	{
		name: 'obsidian armour',
		inputItems: {
			[itemID('obsidian armour set')]: 1
		},
		outputItems: {
			[itemID('obsidian helmet')]: 1,
			[itemID('obsidian platebody')]: 1,
			[itemID('obsidian platelegs')]: 1
		},
		noCl: true
	},
	{
		name: 'obsidian armour set',
		inputItems: {
			[itemID('obsidian helmet')]: 1,
			[itemID('obsidian platebody')]: 1,
			[itemID('obsidian platelegs')]: 1
		},
		outputItems: {
			[itemID('obsidian armour set')]: 1
		}
	},
	// dragonstone
	{
		name: 'dragonstone armour',
		inputItems: {
			[itemID('dragonstone armour set')]: 1
		},
		outputItems: {
			[itemID('dragonstone full helm')]: 1,
			[itemID('dragonstone platebody')]: 1,
			[itemID('dragonstone platelegs')]: 1,
			[itemID('dragonstone gauntlets')]: 1,
			[itemID('dragonstone boots')]: 1
		},
		noCl: true
	},
	{
		name: 'dragonstone armour set',
		inputItems: {
			[itemID('dragonstone full helm')]: 1,
			[itemID('dragonstone platebody')]: 1,
			[itemID('dragonstone platelegs')]: 1,
			[itemID('dragonstone gauntlets')]: 1,
			[itemID('dragonstone boots')]: 1
		},
		outputItems: {
			[itemID('dragonstone armour set')]: 1
		}
	},
	// temple knight
	{
		name: 'initiate',
		inputItems: {
			[itemID('initiate harness m')]: 1
		},
		outputItems: {
			[itemID('initiate sallet')]: 1,
			[itemID('initiate hauberk')]: 1,
			[itemID('initiate cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'initiate set',
		inputItems: {
			[itemID('initiate sallet')]: 1,
			[itemID('initiate hauberk')]: 1,
			[itemID('initiate cuisse')]: 1
		},
		outputItems: {
			[itemID('initiate harness m')]: 1
		},
		noCl: true
	},
	{
		name: 'proselyte (lg)',
		inputItems: {
			[itemID('proselyte harness m')]: 1
		},
		outputItems: {
			[itemID('proselyte sallet')]: 1,
			[itemID('proselyte hauberk')]: 1,
			[itemID('proselyte cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'proselyte set (lg)',
		inputItems: {
			[itemID('proselyte sallet')]: 1,
			[itemID('proselyte hauberk')]: 1,
			[itemID('proselyte cuisse')]: 1
		},
		outputItems: {
			[itemID('proselyte harness m')]: 1
		},
		noCl: true
	},
	{
		name: 'proselyte (sk)',
		inputItems: {
			[itemID('proselyte harness f')]: 1
		},
		outputItems: {
			[itemID('proselyte sallet')]: 1,
			[itemID('proselyte hauberk')]: 1,
			[itemID('proselyte tasset')]: 1
		},
		noCl: true
	},
	{
		name: 'proselyte set (sk)',
		inputItems: {
			[itemID('proselyte sallet')]: 1,
			[itemID('proselyte hauberk')]: 1,
			[itemID('proselyte tasset')]: 1
		},
		outputItems: {
			[itemID('proselyte harness f')]: 1
		},
		noCl: true
	},
	// range sets
	// dragonhide
	{
		name: 'green dragonhide',
		inputItems: {
			[itemID('green dragonhide set')]: 1
		},
		outputItems: {
			[itemID("green d'hide body")]: 1,
			[itemID("green d'hide chaps")]: 1,
			[itemID("green d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'green dragonhide set',
		inputItems: {
			[itemID("green d'hide body")]: 1,
			[itemID("green d'hide chaps")]: 1,
			[itemID("green d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('green dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'blue dragonhide',
		inputItems: {
			[itemID('blue dragonhide set')]: 1
		},
		outputItems: {
			[itemID("blue d'hide body")]: 1,
			[itemID("blue d'hide chaps")]: 1,
			[itemID("blue d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'blue dragonhide set',
		inputItems: {
			[itemID("blue d'hide body")]: 1,
			[itemID("blue d'hide chaps")]: 1,
			[itemID("blue d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('blue dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'red dragonhide',
		inputItems: {
			[itemID('red dragonhide set')]: 1
		},
		outputItems: {
			[itemID("red d'hide body")]: 1,
			[itemID("red d'hide chaps")]: 1,
			[itemID("red d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'red dragonhide set',
		inputItems: {
			[itemID("red d'hide body")]: 1,
			[itemID("red d'hide chaps")]: 1,
			[itemID("red d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('red dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'black dragonhide',
		inputItems: {
			[itemID('black dragonhide set')]: 1
		},
		outputItems: {
			[itemID("black d'hide body")]: 1,
			[itemID("black d'hide chaps")]: 1,
			[itemID("black d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'black dragonhide set',
		inputItems: {
			[itemID("black d'hide body")]: 1,
			[itemID("black d'hide chaps")]: 1,
			[itemID("black d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('black dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'gilded dragonhide',
		inputItems: {
			[itemID('gilded dragonhide set')]: 1
		},
		outputItems: {
			[itemID("gilded d'hide body")]: 1,
			[itemID("gilded d'hide chaps")]: 1,
			[itemID("gilded d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'gilded dragonhide set',
		inputItems: {
			[itemID("gilded d'hide body")]: 1,
			[itemID("gilded d'hide chaps")]: 1,
			[itemID("gilded d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('gilded dragonhide set')]: 1
		},
		noCl: true
	},
	// blessed dragonhide
	{
		name: 'guthix dragonhide',
		inputItems: {
			[itemID('guthix dragonhide set')]: 1
		},
		outputItems: {
			[itemID('guthix coif')]: 1,
			[itemID("guthix d'hide body")]: 1,
			[itemID('guthix chaps')]: 1,
			[itemID('guthix bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'guthix dragonhide set',
		inputItems: {
			[itemID('guthix coif')]: 1,
			[itemID("guthix d'hide body")]: 1,
			[itemID('guthix chaps')]: 1,
			[itemID('guthix bracers')]: 1
		},
		outputItems: {
			[itemID('guthix dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin dragonhide',
		inputItems: {
			[itemID('saradomin dragonhide set')]: 1
		},
		outputItems: {
			[itemID('saradomin coif')]: 1,
			[itemID("saradomin d'hide body")]: 1,
			[itemID('saradomin chaps')]: 1,
			[itemID('saradomin bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'saradomin dragonhide set',
		inputItems: {
			[itemID('saradomin coif')]: 1,
			[itemID("saradomin d'hide body")]: 1,
			[itemID('saradomin chaps')]: 1,
			[itemID('saradomin bracers')]: 1
		},
		outputItems: {
			[itemID('saradomin dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak dragonhide',
		inputItems: {
			[itemID('zamorak dragonhide set')]: 1
		},
		outputItems: {
			[itemID('zamorak coif')]: 1,
			[itemID("zamorak d'hide body")]: 1,
			[itemID('zamorak chaps')]: 1,
			[itemID('zamorak bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'zamorak dragonhide set',
		inputItems: {
			[itemID('zamorak coif')]: 1,
			[itemID("zamorak d'hide body")]: 1,
			[itemID('zamorak chaps')]: 1,
			[itemID('zamorak bracers')]: 1
		},
		outputItems: {
			[itemID('zamorak dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient dragonhide',
		inputItems: {
			[itemID('ancient dragonhide set')]: 1
		},
		outputItems: {
			[itemID('ancient coif')]: 1,
			[itemID("ancient d'hide body")]: 1,
			[itemID('ancient chaps')]: 1,
			[itemID('ancient bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'ancient dragonhide set',
		inputItems: {
			[itemID('ancient coif')]: 1,
			[itemID("ancient d'hide body")]: 1,
			[itemID('ancient chaps')]: 1,
			[itemID('ancient bracers')]: 1
		},
		outputItems: {
			[itemID('ancient dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl dragonhide',
		inputItems: {
			[itemID('armadyl dragonhide set')]: 1
		},
		outputItems: {
			[itemID('armadyl coif')]: 1,
			[itemID("armadyl d'hide body")]: 1,
			[itemID('armadyl chaps')]: 1,
			[itemID('armadyl bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'armadyl dragonhide set',
		inputItems: {
			[itemID('armadyl coif')]: 1,
			[itemID("armadyl d'hide body")]: 1,
			[itemID('armadyl chaps')]: 1,
			[itemID('armadyl bracers')]: 1
		},
		outputItems: {
			[itemID('armadyl dragonhide set')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos dragonhide',
		inputItems: {
			[itemID('bandos dragonhide set')]: 1
		},
		outputItems: {
			[itemID('bandos coif')]: 1,
			[itemID("bandos d'hide body")]: 1,
			[itemID('bandos chaps')]: 1,
			[itemID('bandos bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'bandos dragonhide set',
		inputItems: {
			[itemID('bandos coif')]: 1,
			[itemID("bandos d'hide body")]: 1,
			[itemID('bandos chaps')]: 1,
			[itemID('bandos bracers')]: 1
		},
		outputItems: {
			[itemID('bandos dragonhide set')]: 1
		},
		noCl: true
	},
	// mage sets
	{
		name: 'mystic (blue)',
		inputItems: {
			[itemID('mystic set (blue)')]: 1
		},
		outputItems: {
			[itemID('mystic hat')]: 1,
			[itemID('mystic robe top')]: 1,
			[itemID('mystic robe bottom')]: 1,
			[itemID('mystic gloves')]: 1,
			[itemID('mystic boots')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic set (blue)',
		inputItems: {
			[itemID('mystic hat')]: 1,
			[itemID('mystic robe top')]: 1,
			[itemID('mystic robe bottom')]: 1,
			[itemID('mystic gloves')]: 1,
			[itemID('mystic boots')]: 1
		},
		outputItems: {
			[itemID('mystic set (blue)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic (dark)',
		inputItems: {
			[itemID('mystic set (dark)')]: 1
		},
		outputItems: {
			[itemID('mystic hat (dark)')]: 1,
			[itemID('mystic robe top (dark)')]: 1,
			[itemID('mystic robe bottom (dark)')]: 1,
			[itemID('mystic gloves (dark)')]: 1,
			[itemID('mystic boots (dark)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic set (dark)',
		inputItems: {
			[itemID('mystic hat (dark)')]: 1,
			[itemID('mystic robe top (dark)')]: 1,
			[itemID('mystic robe bottom (dark)')]: 1,
			[itemID('mystic gloves (dark)')]: 1,
			[itemID('mystic boots (dark)')]: 1
		},
		outputItems: {
			[itemID('mystic set (dark)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic (light)',
		inputItems: {
			[itemID('mystic set (light)')]: 1
		},
		outputItems: {
			[itemID('mystic hat (light)')]: 1,
			[itemID('mystic robe top (light)')]: 1,
			[itemID('mystic robe bottom (light)')]: 1,
			[itemID('mystic gloves (light)')]: 1,
			[itemID('mystic boots (light)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic set (light)',
		inputItems: {
			[itemID('mystic hat (light)')]: 1,
			[itemID('mystic robe top (light)')]: 1,
			[itemID('mystic robe bottom (light)')]: 1,
			[itemID('mystic gloves (light)')]: 1,
			[itemID('mystic boots (light)')]: 1
		},
		outputItems: {
			[itemID('mystic set (light)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic (dusk)',
		inputItems: {
			[itemID('mystic set (dusk)')]: 1
		},
		outputItems: {
			[itemID('mystic hat (dusk)')]: 1,
			[itemID('mystic robe top (dusk)')]: 1,
			[itemID('mystic robe bottom (dusk)')]: 1,
			[itemID('mystic gloves (dusk)')]: 1,
			[itemID('mystic boots (dusk)')]: 1
		},
		noCl: true
	},
	{
		name: 'mystic set (dusk)',
		inputItems: {
			[itemID('mystic hat (dusk)')]: 1,
			[itemID('mystic robe top (dusk)')]: 1,
			[itemID('mystic robe bottom (dusk)')]: 1,
			[itemID('mystic gloves (dusk)')]: 1,
			[itemID('mystic boots (dusk)')]: 1
		},
		outputItems: {
			[itemID('mystic set (dusk)')]: 1
		},
		noCl: true
	},
	{
		name: "Dagon'hai",
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
	},
	{
		name: 'ancestral robes',
		inputItems: {
			[itemID('ancestral robes set')]: 1
		},
		outputItems: {
			[itemID('ancestral hat')]: 1,
			[itemID('ancestral robe top')]: 1,
			[itemID('ancestral robe bottom')]: 1
		},
		noCl: true
	},
	{
		name: 'ancestral robes set',
		inputItems: {
			[itemID('ancestral hat')]: 1,
			[itemID('ancestral robe top')]: 1,
			[itemID('ancestral robe bottom')]: 1
		},
		outputItems: {
			[itemID('ancestral robes set')]: 1
		}
	},
	// god books
	{
		name: 'book of balance pages',
		inputItems: {
			[itemID('book of balance page set')]: 1
		},
		outputItems: {
			[itemID('guthix page 1')]: 1,
			[itemID('guthix page 2')]: 1,
			[itemID('guthix page 3')]: 1,
			[itemID('guthix page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'book of balance page set',
		inputItems: {
			[itemID('guthix page 1')]: 1,
			[itemID('guthix page 2')]: 1,
			[itemID('guthix page 3')]: 1,
			[itemID('guthix page 4')]: 1
		},
		outputItems: {
			[itemID('book of balance page set')]: 1
		}
	},
	{
		name: 'holy book pages',
		inputItems: {
			[itemID('holy book page set')]: 1
		},
		outputItems: {
			[itemID('saradomin page 1')]: 1,
			[itemID('saradomin page 2')]: 1,
			[itemID('saradomin page 3')]: 1,
			[itemID('saradomin page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'holy book page set',
		inputItems: {
			[itemID('saradomin page 1')]: 1,
			[itemID('saradomin page 2')]: 1,
			[itemID('saradomin page 3')]: 1,
			[itemID('saradomin page 4')]: 1
		},
		outputItems: {
			[itemID('holy book page set')]: 1
		}
	},
	{
		name: 'unholy book pages',
		inputItems: {
			[itemID('unholy book page set')]: 1
		},
		outputItems: {
			[itemID('zamorak page 1')]: 1,
			[itemID('zamorak page 2')]: 1,
			[itemID('zamorak page 3')]: 1,
			[itemID('zamorak page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'unholy book page set',
		inputItems: {
			[itemID('zamorak page 1')]: 1,
			[itemID('zamorak page 2')]: 1,
			[itemID('zamorak page 3')]: 1,
			[itemID('zamorak page 4')]: 1
		},
		outputItems: {
			[itemID('unholy book page set')]: 1
		}
	},
	{
		name: 'book of darkness pages',
		inputItems: {
			[itemID('book of darkness page set')]: 1
		},
		outputItems: {
			[itemID('ancient page 1')]: 1,
			[itemID('ancient page 2')]: 1,
			[itemID('ancient page 3')]: 1,
			[itemID('ancient page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'book of darkness page set',
		inputItems: {
			[itemID('ancient page 1')]: 1,
			[itemID('ancient page 2')]: 1,
			[itemID('ancient page 3')]: 1,
			[itemID('ancient page 4')]: 1
		},
		outputItems: {
			[itemID('book of darkness page set')]: 1
		}
	},
	{
		name: 'book of law pages',
		inputItems: {
			[itemID('book of law page set')]: 1
		},
		outputItems: {
			[itemID('armadyl page 1')]: 1,
			[itemID('armadyl page 2')]: 1,
			[itemID('armadyl page 3')]: 1,
			[itemID('armadyl page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'book of law page set',
		inputItems: {
			[itemID('armadyl page 1')]: 1,
			[itemID('armadyl page 2')]: 1,
			[itemID('armadyl page 3')]: 1,
			[itemID('armadyl page 4')]: 1
		},
		outputItems: {
			[itemID('book of law page set')]: 1
		}
	},
	{
		name: 'book of war pages',
		inputItems: {
			[itemID('book of war page set')]: 1
		},
		outputItems: {
			[itemID('bandos page 1')]: 1,
			[itemID('bandos page 2')]: 1,
			[itemID('bandos page 3')]: 1,
			[itemID('bandos page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'book of war page set',
		inputItems: {
			[itemID('bandos page 1')]: 1,
			[itemID('bandos page 2')]: 1,
			[itemID('bandos page 3')]: 1,
			[itemID('bandos page 4')]: 1
		},
		outputItems: {
			[itemID('book of war page set')]: 1
		}
	},
	// twisted relichunter
	{
		name: 'twisted relichunter (t1) armour',
		inputItems: {
			[itemID('twisted relichunter (t1) armour set')]: 1
		},
		outputItems: {
			[itemID('twisted hat (t1)')]: 1,
			[itemID('twisted coat (t1)')]: 1,
			[itemID('twisted trousers (t1)')]: 1,
			[itemID('twisted boots (t1)')]: 1
		},
		noCl: true
	},
	{
		name: 'twisted relichunter (t1) armour set',
		inputItems: {
			[itemID('twisted hat (t1)')]: 1,
			[itemID('twisted coat (t1)')]: 1,
			[itemID('twisted trousers (t1)')]: 1,
			[itemID('twisted boots (t1)')]: 1
		},
		outputItems: {
			[itemID('twisted relichunter (t1) armour set')]: 1
		}
	},
	{
		name: 'twisted relichunter (t2) armour',
		inputItems: {
			[itemID('twisted relichunter (t2) armour set')]: 1
		},
		outputItems: {
			[itemID('twisted hat (t2)')]: 1,
			[itemID('twisted coat (t2)')]: 1,
			[itemID('twisted trousers (t2)')]: 1,
			[itemID('twisted boots (t2)')]: 1
		},
		noCl: true
	},
	{
		name: 'twisted relichunter (t2) armour set',
		inputItems: {
			[itemID('twisted hat (t2)')]: 1,
			[itemID('twisted coat (t2)')]: 1,
			[itemID('twisted trousers (t2)')]: 1,
			[itemID('twisted boots (t2)')]: 1
		},
		outputItems: {
			[itemID('twisted relichunter (t2) armour set')]: 1
		}
	},
	{
		name: 'twisted relichunter (t3) armour',
		inputItems: {
			[itemID('twisted relichunter (t3) armour set')]: 1
		},
		outputItems: {
			[itemID('twisted hat (t3)')]: 1,
			[itemID('twisted coat (t3)')]: 1,
			[itemID('twisted trousers (t3)')]: 1,
			[itemID('twisted boots (t3)')]: 1
		},
		noCl: true
	},
	{
		name: 'twisted relichunter (t3) armour set',
		inputItems: {
			[itemID('twisted hat (t3)')]: 1,
			[itemID('twisted coat (t3)')]: 1,
			[itemID('twisted trousers (t3)')]: 1,
			[itemID('twisted boots (t3)')]: 1
		},
		outputItems: {
			[itemID('twisted relichunter (t3) armour set')]: 1
		}
	},
	// holiday
	{
		name: 'partyhats',
		inputItems: {
			[itemID('partyhat set')]: 1
		},
		outputItems: {
			[itemID('red partyhat')]: 1,
			[itemID('yellow partyhat')]: 1,
			[itemID('green partyhat')]: 1,
			[itemID('blue partyhat')]: 1,
			[itemID('purple partyhat')]: 1,
			[itemID('white partyhat')]: 1
		}
	},
	{
		name: 'partyhat set',
		inputItems: {
			[itemID('red partyhat')]: 1,
			[itemID('yellow partyhat')]: 1,
			[itemID('green partyhat')]: 1,
			[itemID('blue partyhat')]: 1,
			[itemID('purple partyhat')]: 1,
			[itemID('white partyhat')]: 1
		},
		outputItems: {
			[itemID('partyhat set')]: 1
		}
	},
	{
		name: 'halloween masks',
		inputItems: {
			[itemID('halloween mask set')]: 1
		},
		outputItems: {
			[itemID('red halloween mask')]: 1,
			[itemID('green halloween mask')]: 1,
			[itemID('blue halloween mask')]: 1
		}
	},
	{
		name: 'halloween mask set',
		inputItems: {
			[itemID('red halloween mask')]: 1,
			[itemID('green halloween mask')]: 1,
			[itemID('blue halloween mask')]: 1
		},
		outputItems: {
			[itemID('halloween mask set')]: 1
		}
	},
	// misc
	{
		name: 'combat potions',
		inputItems: {
			[itemID('combat potion set')]: 1
		},
		outputItems: {
			[itemID('attack potion(4)')]: 1,
			[itemID('strength potion(4)')]: 1,
			[itemID('defence potion(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'combat potion set',
		inputItems: {
			[itemID('attack potion(4)')]: 1,
			[itemID('strength potion(4)')]: 1,
			[itemID('defence potion(4)')]: 1
		},
		outputItems: {
			[itemID('combat potion set')]: 1
		}
	},
	{
		name: 'super potions',
		inputItems: {
			[itemID('super potion set')]: 1
		},
		outputItems: {
			[itemID('super attack(4)')]: 1,
			[itemID('super strength(4)')]: 1,
			[itemID('super defence(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'super potion set',
		inputItems: {
			[itemID('super attack(4)')]: 1,
			[itemID('super strength(4)')]: 1,
			[itemID('super defence(4)')]: 1
		},
		outputItems: {
			[itemID('super potion set')]: 1
		}
	},
	{
		name: 'Dwarf cannon',
		inputItems: {
			[itemID('Dwarf cannon set')]: 1
		},
		outputItems: {
			[itemID('Cannon barrels')]: 1,
			[itemID('Cannon base')]: 1,
			[itemID('Cannon furnace')]: 1,
			[itemID('Cannon stand')]: 1
		},
		noCl: true
	},
	{
		name: 'Dwarf cannon set',
		inputItems: {
			[itemID('Cannon barrels')]: 1,
			[itemID('Cannon base')]: 1,
			[itemID('Cannon furnace')]: 1,
			[itemID('Cannon stand')]: 1
		},
		outputItems: {
			[itemID('Dwarf cannon set')]: 1
		}
	}
	/* {
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
