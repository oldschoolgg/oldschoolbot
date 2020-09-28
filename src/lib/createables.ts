import { Bank } from './types';
import { resolveNameBank } from './util';
import itemID from './util/itemID';

interface Createable {
	name: string;
	outputItems: Bank;
	inputItems: Bank;
	cantHaveItems?: Bank;
	requiredSkills?: Record<string, number>;
	QPRequired?: number;
	noCl?: boolean;
	GPCost?: number;
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
		requiredSkills: {
			smithing: 60
		}
	},
	{
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
		name: 'Kodai wand',
		inputItems: {
			[itemID('Master wand')]: 1,
			[itemID('Kodai insignia')]: 1
		},
		outputItems: {
			[itemID('Kodai wand')]: 1
		}
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
		}
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
		}
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
		}
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
		}
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
		}
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
		}
	},
	// iron
	{
		name: 'Iron (lg)',
		inputItems: {
			[itemID('Iron set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron platelegs')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron set (lg)',
		inputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron platelegs')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('Iron set (lg)')]: 1
		}
	},
	{
		name: 'Iron (sk)',
		inputItems: {
			[itemID('Iron set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron plateskirt')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron set (sk)',
		inputItems: {
			[itemID('Iron full helm')]: 1,
			[itemID('Iron platebody')]: 1,
			[itemID('Iron plateskirt')]: 1,
			[itemID('Iron kiteshield')]: 1
		},
		outputItems: {
			[itemID('Iron set (sk)')]: 1
		}
	},
	{
		name: 'Iron trimmed (lg)',
		inputItems: {
			[itemID('Iron trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron platelegs (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron trimmed set (lg)',
		inputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron platelegs (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Iron trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Iron trimmed (sk)',
		inputItems: {
			[itemID('Iron trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron plateskirt (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron trimmed set (sk)',
		inputItems: {
			[itemID('Iron full helm (t)')]: 1,
			[itemID('Iron platebody (t)')]: 1,
			[itemID('Iron plateskirt (t)')]: 1,
			[itemID('Iron kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Iron trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Iron gold-trimmed (lg)',
		inputItems: {
			[itemID('Iron gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron platelegs (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron gold-trimmed set (lg)',
		inputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron platelegs (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Iron gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Iron gold-trimmed (sk)',
		inputItems: {
			[itemID('Iron gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron plateskirt (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Iron gold-trimmed set (sk)',
		inputItems: {
			[itemID('Iron full helm (g)')]: 1,
			[itemID('Iron platebody (g)')]: 1,
			[itemID('Iron plateskirt (g)')]: 1,
			[itemID('Iron kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Iron gold-trimmed set (sk)')]: 1
		}
	},
	// steel
	{
		name: 'Steel (lg)',
		inputItems: {
			[itemID('Steel set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel platelegs')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel set (lg)',
		inputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel platelegs')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('Steel set (lg)')]: 1
		}
	},
	{
		name: 'Steel (sk)',
		inputItems: {
			[itemID('Steel set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel plateskirt')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel set (sk)',
		inputItems: {
			[itemID('Steel full helm')]: 1,
			[itemID('Steel platebody')]: 1,
			[itemID('Steel plateskirt')]: 1,
			[itemID('Steel kiteshield')]: 1
		},
		outputItems: {
			[itemID('Steel set (sk)')]: 1
		}
	},
	{
		name: 'Steel trimmed (lg)',
		inputItems: {
			[itemID('Steel trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel platelegs (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel trimmed set (lg)',
		inputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel platelegs (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Steel trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Steel trimmed (sk)',
		inputItems: {
			[itemID('Steel trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel plateskirt (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel trimmed set (sk)',
		inputItems: {
			[itemID('Steel full helm (t)')]: 1,
			[itemID('Steel platebody (t)')]: 1,
			[itemID('Steel plateskirt (t)')]: 1,
			[itemID('Steel kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Steel trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Steel gold-trimmed (lg)',
		inputItems: {
			[itemID('Steel gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel platelegs (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel gold-trimmed set (lg)',
		inputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel platelegs (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Steel gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Steel gold-trimmed (sk)',
		inputItems: {
			[itemID('Steel gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel plateskirt (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Steel gold-trimmed set (sk)',
		inputItems: {
			[itemID('Steel full helm (g)')]: 1,
			[itemID('Steel platebody (g)')]: 1,
			[itemID('Steel plateskirt (g)')]: 1,
			[itemID('Steel kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Steel gold-trimmed set (sk)')]: 1
		}
	},
	// black
	{
		name: 'Black (lg)',
		inputItems: {
			[itemID('Black set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black platelegs')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Black set (lg)',
		inputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black platelegs')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		outputItems: {
			[itemID('Black set (lg)')]: 1
		}
	},
	{
		name: 'Black (sk)',
		inputItems: {
			[itemID('Black set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black plateskirt')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Black set (sk)',
		inputItems: {
			[itemID('Black full helm')]: 1,
			[itemID('Black platebody')]: 1,
			[itemID('Black plateskirt')]: 1,
			[itemID('Black kiteshield')]: 1
		},
		outputItems: {
			[itemID('Black set (sk)')]: 1
		}
	},
	{
		name: 'Black trimmed (lg)',
		inputItems: {
			[itemID('Black trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black platelegs (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black trimmed set (lg)',
		inputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black platelegs (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Black trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Black trimmed (sk)',
		inputItems: {
			[itemID('Black trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black plateskirt (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black trimmed set (sk)',
		inputItems: {
			[itemID('Black full helm (t)')]: 1,
			[itemID('Black platebody (t)')]: 1,
			[itemID('Black plateskirt (t)')]: 1,
			[itemID('Black kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Black trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Black gold-trimmed (lg)',
		inputItems: {
			[itemID('Black gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black platelegs (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black gold-trimmed set (lg)',
		inputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black platelegs (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Black gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Black gold-trimmed (sk)',
		inputItems: {
			[itemID('Black gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black plateskirt (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Black gold-trimmed set (sk)',
		inputItems: {
			[itemID('Black full helm (g)')]: 1,
			[itemID('Black platebody (g)')]: 1,
			[itemID('Black plateskirt (g)')]: 1,
			[itemID('Black kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Black gold-trimmed set (sk)')]: 1
		}
	},
	// mithril
	{
		name: 'Mithril (lg)',
		inputItems: {
			[itemID('Mithril set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril platelegs')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril set (lg)',
		inputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril platelegs')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('Mithril set (lg)')]: 1
		}
	},
	{
		name: 'Mithril (sk)',
		inputItems: {
			[itemID('Mithril set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril plateskirt')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril set (sk)',
		inputItems: {
			[itemID('Mithril full helm')]: 1,
			[itemID('Mithril platebody')]: 1,
			[itemID('Mithril plateskirt')]: 1,
			[itemID('Mithril kiteshield')]: 1
		},
		outputItems: {
			[itemID('Mithril set (sk)')]: 1
		}
	},
	{
		name: 'Mithril trimmed (lg)',
		inputItems: {
			[itemID('Mithril trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril platelegs (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril trimmed set (lg)',
		inputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril platelegs (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Mithril trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Mithril trimmed (sk)',
		inputItems: {
			[itemID('Mithril trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril plateskirt (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril trimmed set (sk)',
		inputItems: {
			[itemID('Mithril full helm (t)')]: 1,
			[itemID('Mithril platebody (t)')]: 1,
			[itemID('Mithril plateskirt (t)')]: 1,
			[itemID('Mithril kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Mithril trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Mithril gold-trimmed (lg)',
		inputItems: {
			[itemID('Mithril gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril platelegs (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril gold-trimmed set (lg)',
		inputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril platelegs (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Mithril gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Mithril gold-trimmed (sk)',
		inputItems: {
			[itemID('Mithril gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril plateskirt (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mithril gold-trimmed set (sk)',
		inputItems: {
			[itemID('Mithril full helm (g)')]: 1,
			[itemID('Mithril platebody (g)')]: 1,
			[itemID('Mithril plateskirt (g)')]: 1,
			[itemID('Mithril kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Mithril gold-trimmed set (sk)')]: 1
		}
	},
	// adamant
	{
		name: 'Adamant (lg)',
		inputItems: {
			[itemID('Adamant set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant platelegs')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant set (lg)',
		inputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant platelegs')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('Adamant set (lg)')]: 1
		}
	},
	{
		name: 'Adamant (sk)',
		inputItems: {
			[itemID('Adamant set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant plateskirt')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant set (sk)',
		inputItems: {
			[itemID('Adamant full helm')]: 1,
			[itemID('Adamant platebody')]: 1,
			[itemID('Adamant plateskirt')]: 1,
			[itemID('Adamant kiteshield')]: 1
		},
		outputItems: {
			[itemID('Adamant set (sk)')]: 1
		}
	},
	{
		name: 'Adamant trimmed (lg)',
		inputItems: {
			[itemID('Adamant trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant platelegs (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant trimmed set (lg)',
		inputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant platelegs (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Adamant trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Adamant trimmed (sk)',
		inputItems: {
			[itemID('Adamant trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant plateskirt (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant trimmed set (sk)',
		inputItems: {
			[itemID('Adamant full helm (t)')]: 1,
			[itemID('Adamant platebody (t)')]: 1,
			[itemID('Adamant plateskirt (t)')]: 1,
			[itemID('Adamant kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Adamant trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Adamant gold-trimmed (lg)',
		inputItems: {
			[itemID('Adamant gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant platelegs (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant gold-trimmed set (lg)',
		inputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant platelegs (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Adamant gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Adamant gold-trimmed (sk)',
		inputItems: {
			[itemID('Adamant gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant plateskirt (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Adamant gold-trimmed set (sk)',
		inputItems: {
			[itemID('Adamant full helm (g)')]: 1,
			[itemID('Adamant platebody (g)')]: 1,
			[itemID('Adamant plateskirt (g)')]: 1,
			[itemID('Adamant kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Adamant gold-trimmed set (sk)')]: 1
		}
	},
	// rune
	{
		name: 'Rune (lg)',
		inputItems: {
			[itemID('Rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune platelegs')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune set (lg)',
		inputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune platelegs')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('Rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Rune (sk)',
		inputItems: {
			[itemID('Rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune plateskirt')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune set (sk)',
		inputItems: {
			[itemID('Rune full helm')]: 1,
			[itemID('Rune platebody')]: 1,
			[itemID('Rune plateskirt')]: 1,
			[itemID('Rune kiteshield')]: 1
		},
		outputItems: {
			[itemID('Rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Rune trimmed (lg)',
		inputItems: {
			[itemID('Rune trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune platelegs (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune trimmed set (lg)',
		inputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune platelegs (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Rune trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Rune trimmed (sk)',
		inputItems: {
			[itemID('Rune trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune plateskirt (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune trimmed set (sk)',
		inputItems: {
			[itemID('Rune full helm (t)')]: 1,
			[itemID('Rune platebody (t)')]: 1,
			[itemID('Rune plateskirt (t)')]: 1,
			[itemID('Rune kiteshield (t)')]: 1
		},
		outputItems: {
			[itemID('Rune trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Rune gold-trimmed (lg)',
		inputItems: {
			[itemID('Rune gold-trimmed set (lg)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune platelegs (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune gold-trimmed set (lg)',
		inputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune platelegs (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Rune gold-trimmed set (lg)')]: 1
		}
	},
	{
		name: 'Rune gold-trimmed (sk)',
		inputItems: {
			[itemID('Rune gold-trimmed set (sk)')]: 1
		},
		outputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune plateskirt (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		noCl: true
	},
	{
		name: 'Rune gold-trimmed set (sk)',
		inputItems: {
			[itemID('Rune full helm (g)')]: 1,
			[itemID('Rune platebody (g)')]: 1,
			[itemID('Rune plateskirt (g)')]: 1,
			[itemID('Rune kiteshield (g)')]: 1
		},
		outputItems: {
			[itemID('Rune gold-trimmed set (sk)')]: 1
		}
	},
	{
		name: 'Gilded (lg)',
		inputItems: {
			[itemID('Gilded armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded platelegs')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded set (lg)',
		inputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded platelegs')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('Gilded armour set (lg)')]: 1
		}
	},
	{
		name: 'Gilded (sk)',
		inputItems: {
			[itemID('Gilded armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded plateskirt')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded set (sk)',
		inputItems: {
			[itemID('Gilded full helm')]: 1,
			[itemID('Gilded platebody')]: 1,
			[itemID('Gilded plateskirt')]: 1,
			[itemID('Gilded kiteshield')]: 1
		},
		outputItems: {
			[itemID('Gilded armour set (sk)')]: 1
		}
	},
	// rune god armours
	{
		name: 'Guthix (lg)',
		inputItems: {
			[itemID('Guthix armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix platelegs')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix set (lg)',
		inputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix platelegs')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('Guthix armour set (lg)')]: 1
		}
	},
	{
		name: 'Guthix (sk)',
		inputItems: {
			[itemID('Guthix armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix plateskirt')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix set (sk)',
		inputItems: {
			[itemID('Guthix full helm')]: 1,
			[itemID('Guthix platebody')]: 1,
			[itemID('Guthix plateskirt')]: 1,
			[itemID('Guthix kiteshield')]: 1
		},
		outputItems: {
			[itemID('Guthix armour set (sk)')]: 1
		}
	},
	{
		name: 'Saradomin (lg)',
		inputItems: {
			[itemID('Saradomin armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin platelegs')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin set (lg)',
		inputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin platelegs')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('Saradomin armour set (lg)')]: 1
		}
	},
	{
		name: 'Saradomin (sk)',
		inputItems: {
			[itemID('Saradomin armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin plateskirt')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin set (sk)',
		inputItems: {
			[itemID('Saradomin full helm')]: 1,
			[itemID('Saradomin platebody')]: 1,
			[itemID('Saradomin plateskirt')]: 1,
			[itemID('Saradomin kiteshield')]: 1
		},
		outputItems: {
			[itemID('Saradomin armour set (sk)')]: 1
		}
	},
	{
		name: 'Zamorak (lg)',
		inputItems: {
			[itemID('Zamorak armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak platelegs')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak set (lg)',
		inputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak platelegs')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('Zamorak armour set (lg)')]: 1
		}
	},
	{
		name: 'Zamorak (sk)',
		inputItems: {
			[itemID('Zamorak armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak plateskirt')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak set (sk)',
		inputItems: {
			[itemID('Zamorak full helm')]: 1,
			[itemID('Zamorak platebody')]: 1,
			[itemID('Zamorak plateskirt')]: 1,
			[itemID('Zamorak kiteshield')]: 1
		},
		outputItems: {
			[itemID('Zamorak armour set (sk)')]: 1
		}
	},
	{
		name: 'Ancient (lg)',
		inputItems: {
			[itemID('Ancient rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient platelegs')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient set (lg)',
		inputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient platelegs')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('Ancient rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Ancient (sk)',
		inputItems: {
			[itemID('Ancient rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient plateskirt')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient set (sk)',
		inputItems: {
			[itemID('Ancient full helm')]: 1,
			[itemID('Ancient platebody')]: 1,
			[itemID('Ancient plateskirt')]: 1,
			[itemID('Ancient kiteshield')]: 1
		},
		outputItems: {
			[itemID('Ancient rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Armadyl (lg)',
		inputItems: {
			[itemID('Armadyl rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl platelegs')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl set (lg)',
		inputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl platelegs')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('Armadyl rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Armadyl (sk)',
		inputItems: {
			[itemID('Armadyl rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl plateskirt')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl set (sk)',
		inputItems: {
			[itemID('Armadyl full helm')]: 1,
			[itemID('Armadyl platebody')]: 1,
			[itemID('Armadyl plateskirt')]: 1,
			[itemID('Armadyl kiteshield')]: 1
		},
		outputItems: {
			[itemID('Armadyl rune armour set (sk)')]: 1
		}
	},
	{
		name: 'Bandos (lg)',
		inputItems: {
			[itemID('Bandos rune armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos platelegs')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos set (lg)',
		inputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos platelegs')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bandos rune armour set (lg)')]: 1
		}
	},
	{
		name: 'Bandos (sk)',
		inputItems: {
			[itemID('Bandos rune armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos plateskirt')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos set (sk)',
		inputItems: {
			[itemID('Bandos full helm')]: 1,
			[itemID('Bandos platebody')]: 1,
			[itemID('Bandos plateskirt')]: 1,
			[itemID('Bandos kiteshield')]: 1
		},
		outputItems: {
			[itemID('Bandos rune armour set (sk)')]: 1
		}
	},
	// dragon
	{
		name: 'Dragon (lg)',
		inputItems: {
			[itemID('Dragon armour set (lg)')]: 1
		},
		outputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon platelegs')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragon set (lg)',
		inputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon platelegs')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('Dragon armour set (lg)')]: 1
		}
	},
	{
		name: 'Dragon (sk)',
		inputItems: {
			[itemID('Dragon armour set (sk)')]: 1
		},
		outputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon plateskirt')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragon set (sk)',
		inputItems: {
			[itemID('Dragon full helm')]: 1,
			[itemID('Dragon platebody')]: 1,
			[itemID('Dragon plateskirt')]: 1,
			[itemID('Dragon kiteshield')]: 1
		},
		outputItems: {
			[itemID('Dragon armour set (sk)')]: 1
		}
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
		}
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
		name: 'Obsidian armour',
		inputItems: {
			[itemID('Obsidian armour set')]: 1
		},
		outputItems: {
			[itemID('Obsidian helmet')]: 1,
			[itemID('Obsidian platebody')]: 1,
			[itemID('Obsidian platelegs')]: 1
		},
		noCl: true
	},
	{
		name: 'Obsidian armour set',
		inputItems: {
			[itemID('Obsidian helmet')]: 1,
			[itemID('Obsidian platebody')]: 1,
			[itemID('Obsidian platelegs')]: 1
		},
		outputItems: {
			[itemID('Obsidian armour set')]: 1
		}
	},
	// dragonstone
	{
		name: 'Dragonstone armour',
		inputItems: {
			[itemID('Dragonstone armour set')]: 1
		},
		outputItems: {
			[itemID('Dragonstone full helm')]: 1,
			[itemID('Dragonstone platebody')]: 1,
			[itemID('Dragonstone platelegs')]: 1,
			[itemID('Dragonstone gauntlets')]: 1,
			[itemID('Dragonstone boots')]: 1
		},
		noCl: true
	},
	{
		name: 'Dragonstone armour set',
		inputItems: {
			[itemID('Dragonstone full helm')]: 1,
			[itemID('Dragonstone platebody')]: 1,
			[itemID('Dragonstone platelegs')]: 1,
			[itemID('Dragonstone gauntlets')]: 1,
			[itemID('Dragonstone boots')]: 1
		},
		outputItems: {
			[itemID('Dragonstone armour set')]: 1
		}
	},
	// temple knight
	{
		name: 'Initiate',
		inputItems: {
			[itemID('Initiate harness m')]: 1
		},
		outputItems: {
			[itemID('Initiate sallet')]: 1,
			[itemID('Initiate hauberk')]: 1,
			[itemID('Initiate cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'Initiate set',
		inputItems: {
			[itemID('Initiate sallet')]: 1,
			[itemID('Initiate hauberk')]: 1,
			[itemID('Initiate cuisse')]: 1
		},
		outputItems: {
			[itemID('Initiate harness m')]: 1
		}
	},
	{
		name: 'Proselyte (lg)',
		inputItems: {
			[itemID('Proselyte harness m')]: 1
		},
		outputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte cuisse')]: 1
		},
		noCl: true
	},
	{
		name: 'Proselyte set (lg)',
		inputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte cuisse')]: 1
		},
		outputItems: {
			[itemID('Proselyte harness m')]: 1
		}
	},
	{
		name: 'Proselyte (sk)',
		inputItems: {
			[itemID('Proselyte harness f')]: 1
		},
		outputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte tasset')]: 1
		},
		noCl: true
	},
	{
		name: 'Proselyte set (sk)',
		inputItems: {
			[itemID('Proselyte sallet')]: 1,
			[itemID('Proselyte hauberk')]: 1,
			[itemID('Proselyte tasset')]: 1
		},
		outputItems: {
			[itemID('Proselyte harness f')]: 1
		}
	},
	// range sets
	// dragonhide
	{
		name: 'Green dragonhide',
		inputItems: {
			[itemID('Green dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Green d'hide body")]: 1,
			[itemID("Green d'hide chaps")]: 1,
			[itemID("Green d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Green dragonhide set',
		inputItems: {
			[itemID("Green d'hide body")]: 1,
			[itemID("Green d'hide chaps")]: 1,
			[itemID("Green d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Green dragonhide set')]: 1
		}
	},
	{
		name: 'Blue dragonhide',
		inputItems: {
			[itemID('Blue dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Blue d'hide body")]: 1,
			[itemID("Blue d'hide chaps")]: 1,
			[itemID("Blue d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Blue dragonhide set',
		inputItems: {
			[itemID("Blue d'hide body")]: 1,
			[itemID("Blue d'hide chaps")]: 1,
			[itemID("Blue d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Blue dragonhide set')]: 1
		}
	},
	{
		name: 'Red dragonhide',
		inputItems: {
			[itemID('Red dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Red d'hide body")]: 1,
			[itemID("Red d'hide chaps")]: 1,
			[itemID("Red d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Red dragonhide set',
		inputItems: {
			[itemID("Red d'hide body")]: 1,
			[itemID("Red d'hide chaps")]: 1,
			[itemID("Red d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Red dragonhide set')]: 1
		}
	},
	{
		name: 'Black dragonhide',
		inputItems: {
			[itemID('Black dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Black d'hide body")]: 1,
			[itemID("Black d'hide chaps")]: 1,
			[itemID("Black d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Black dragonhide set',
		inputItems: {
			[itemID("Black d'hide body")]: 1,
			[itemID("Black d'hide chaps")]: 1,
			[itemID("Black d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Black dragonhide set')]: 1
		}
	},
	{
		name: 'Gilded dragonhide',
		inputItems: {
			[itemID('Gilded dragonhide set')]: 1
		},
		outputItems: {
			[itemID("Gilded d'hide body")]: 1,
			[itemID("Gilded d'hide chaps")]: 1,
			[itemID("Gilded d'hide vambraces")]: 1
		},
		noCl: true
	},
	{
		name: 'Gilded dragonhide set',
		inputItems: {
			[itemID("Gilded d'hide body")]: 1,
			[itemID("Gilded d'hide chaps")]: 1,
			[itemID("Gilded d'hide vambraces")]: 1
		},
		outputItems: {
			[itemID('Gilded dragonhide set')]: 1
		}
	},
	// blessed dragonhide
	{
		name: 'Guthix dragonhide',
		inputItems: {
			[itemID('Guthix dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Guthix coif')]: 1,
			[itemID("Guthix d'hide body")]: 1,
			[itemID('Guthix chaps')]: 1,
			[itemID('Guthix bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Guthix dragonhide set',
		inputItems: {
			[itemID('Guthix coif')]: 1,
			[itemID("Guthix d'hide body")]: 1,
			[itemID('Guthix chaps')]: 1,
			[itemID('Guthix bracers')]: 1
		},
		outputItems: {
			[itemID('Guthix dragonhide set')]: 1
		}
	},
	{
		name: 'Saradomin dragonhide',
		inputItems: {
			[itemID('Saradomin dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Saradomin coif')]: 1,
			[itemID("Saradomin d'hide body")]: 1,
			[itemID('Saradomin chaps')]: 1,
			[itemID('Saradomin bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Saradomin dragonhide set',
		inputItems: {
			[itemID('Saradomin coif')]: 1,
			[itemID("Saradomin d'hide body")]: 1,
			[itemID('Saradomin chaps')]: 1,
			[itemID('Saradomin bracers')]: 1
		},
		outputItems: {
			[itemID('Saradomin dragonhide set')]: 1
		}
	},
	{
		name: 'Zamorak dragonhide',
		inputItems: {
			[itemID('Zamorak dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Zamorak coif')]: 1,
			[itemID("Zamorak d'hide body")]: 1,
			[itemID('Zamorak chaps')]: 1,
			[itemID('Zamorak bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Zamorak dragonhide set',
		inputItems: {
			[itemID('Zamorak coif')]: 1,
			[itemID("Zamorak d'hide body")]: 1,
			[itemID('Zamorak chaps')]: 1,
			[itemID('Zamorak bracers')]: 1
		},
		outputItems: {
			[itemID('Zamorak dragonhide set')]: 1
		}
	},
	{
		name: 'Ancient dragonhide',
		inputItems: {
			[itemID('Ancient dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Ancient coif')]: 1,
			[itemID("Ancient d'hide body")]: 1,
			[itemID('Ancient chaps')]: 1,
			[itemID('Ancient bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancient dragonhide set',
		inputItems: {
			[itemID('Ancient coif')]: 1,
			[itemID("Ancient d'hide body")]: 1,
			[itemID('Ancient chaps')]: 1,
			[itemID('Ancient bracers')]: 1
		},
		outputItems: {
			[itemID('Ancient dragonhide set')]: 1
		}
	},
	{
		name: 'Armadyl dragonhide',
		inputItems: {
			[itemID('Armadyl dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Armadyl coif')]: 1,
			[itemID("Armadyl d'hide body")]: 1,
			[itemID('Armadyl chaps')]: 1,
			[itemID('Armadyl bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Armadyl dragonhide set',
		inputItems: {
			[itemID('Armadyl coif')]: 1,
			[itemID("Armadyl d'hide body")]: 1,
			[itemID('Armadyl chaps')]: 1,
			[itemID('Armadyl bracers')]: 1
		},
		outputItems: {
			[itemID('Armadyl dragonhide set')]: 1
		}
	},
	{
		name: 'Bandos dragonhide',
		inputItems: {
			[itemID('Bandos dragonhide set')]: 1
		},
		outputItems: {
			[itemID('Bandos coif')]: 1,
			[itemID("Bandos d'hide body")]: 1,
			[itemID('Bandos chaps')]: 1,
			[itemID('Bandos bracers')]: 1
		},
		noCl: true
	},
	{
		name: 'Bandos dragonhide set',
		inputItems: {
			[itemID('Bandos coif')]: 1,
			[itemID("Bandos d'hide body")]: 1,
			[itemID('Bandos chaps')]: 1,
			[itemID('Bandos bracers')]: 1
		},
		outputItems: {
			[itemID('Bandos dragonhide set')]: 1
		}
	},
	// mage sets
	{
		name: 'Mystic (blue)',
		inputItems: {
			[itemID('Mystic set (blue)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat')]: 1,
			[itemID('Mystic robe top')]: 1,
			[itemID('Mystic robe bottom')]: 1,
			[itemID('Mystic gloves')]: 1,
			[itemID('Mystic boots')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (blue)',
		inputItems: {
			[itemID('Mystic hat')]: 1,
			[itemID('Mystic robe top')]: 1,
			[itemID('Mystic robe bottom')]: 1,
			[itemID('Mystic gloves')]: 1,
			[itemID('Mystic boots')]: 1
		},
		outputItems: {
			[itemID('Mystic set (blue)')]: 1
		}
	},
	{
		name: 'Mystic (dark)',
		inputItems: {
			[itemID('Mystic set (dark)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (dark)')]: 1,
			[itemID('Mystic robe top (dark)')]: 1,
			[itemID('Mystic robe bottom (dark)')]: 1,
			[itemID('Mystic gloves (dark)')]: 1,
			[itemID('Mystic boots (dark)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (dark)',
		inputItems: {
			[itemID('Mystic hat (dark)')]: 1,
			[itemID('Mystic robe top (dark)')]: 1,
			[itemID('Mystic robe bottom (dark)')]: 1,
			[itemID('Mystic gloves (dark)')]: 1,
			[itemID('Mystic boots (dark)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (dark)')]: 1
		}
	},
	{
		name: 'Mystic (light)',
		inputItems: {
			[itemID('Mystic set (light)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (light)')]: 1,
			[itemID('Mystic robe top (light)')]: 1,
			[itemID('Mystic robe bottom (light)')]: 1,
			[itemID('Mystic gloves (light)')]: 1,
			[itemID('Mystic boots (light)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (light)',
		inputItems: {
			[itemID('Mystic hat (light)')]: 1,
			[itemID('Mystic robe top (light)')]: 1,
			[itemID('Mystic robe bottom (light)')]: 1,
			[itemID('Mystic gloves (light)')]: 1,
			[itemID('Mystic boots (light)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (light)')]: 1
		}
	},
	{
		name: 'Mystic (dusk)',
		inputItems: {
			[itemID('Mystic set (dusk)')]: 1
		},
		outputItems: {
			[itemID('Mystic hat (dusk)')]: 1,
			[itemID('Mystic robe top (dusk)')]: 1,
			[itemID('Mystic robe bottom (dusk)')]: 1,
			[itemID('Mystic gloves (dusk)')]: 1,
			[itemID('Mystic boots (dusk)')]: 1
		},
		noCl: true
	},
	{
		name: 'Mystic set (dusk)',
		inputItems: {
			[itemID('Mystic hat (dusk)')]: 1,
			[itemID('Mystic robe top (dusk)')]: 1,
			[itemID('Mystic robe bottom (dusk)')]: 1,
			[itemID('Mystic gloves (dusk)')]: 1,
			[itemID('Mystic boots (dusk)')]: 1
		},
		outputItems: {
			[itemID('Mystic set (dusk)')]: 1
		}
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
		name: 'Ancestral robes',
		inputItems: {
			[itemID('Ancestral robes set')]: 1
		},
		outputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Ancestral robe top')]: 1,
			[itemID('Ancestral robe bottom')]: 1
		},
		noCl: true
	},
	{
		name: 'Ancestral robes set',
		inputItems: {
			[itemID('Ancestral hat')]: 1,
			[itemID('Ancestral robe top')]: 1,
			[itemID('Ancestral robe bottom')]: 1
		},
		outputItems: {
			[itemID('Ancestral robes set')]: 1
		}
	},
	// god books
	{
		name: 'Book of balance pages',
		inputItems: {
			[itemID('Book of balance page set')]: 1
		},
		outputItems: {
			[itemID('Guthix page 1')]: 1,
			[itemID('Guthix page 2')]: 1,
			[itemID('Guthix page 3')]: 1,
			[itemID('Guthix page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of balance page set',
		inputItems: {
			[itemID('Guthix page 1')]: 1,
			[itemID('Guthix page 2')]: 1,
			[itemID('Guthix page 3')]: 1,
			[itemID('Guthix page 4')]: 1
		},
		outputItems: {
			[itemID('Book of balance page set')]: 1
		}
	},
	{
		name: 'Holy book pages',
		inputItems: {
			[itemID('Holy book page set')]: 1
		},
		outputItems: {
			[itemID('Saradomin page 1')]: 1,
			[itemID('Saradomin page 2')]: 1,
			[itemID('Saradomin page 3')]: 1,
			[itemID('Saradomin page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Holy book page set',
		inputItems: {
			[itemID('Saradomin page 1')]: 1,
			[itemID('Saradomin page 2')]: 1,
			[itemID('Saradomin page 3')]: 1,
			[itemID('Saradomin page 4')]: 1
		},
		outputItems: {
			[itemID('Holy book page set')]: 1
		}
	},
	{
		name: 'Unholy book pages',
		inputItems: {
			[itemID('Unholy book page set')]: 1
		},
		outputItems: {
			[itemID('Zamorak page 1')]: 1,
			[itemID('Zamorak page 2')]: 1,
			[itemID('Zamorak page 3')]: 1,
			[itemID('Zamorak page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Unholy book page set',
		inputItems: {
			[itemID('Zamorak page 1')]: 1,
			[itemID('Zamorak page 2')]: 1,
			[itemID('Zamorak page 3')]: 1,
			[itemID('Zamorak page 4')]: 1
		},
		outputItems: {
			[itemID('Unholy book page set')]: 1
		}
	},
	{
		name: 'Book of darkness pages',
		inputItems: {
			[itemID('Book of darkness page set')]: 1
		},
		outputItems: {
			[itemID('Ancient page 1')]: 1,
			[itemID('Ancient page 2')]: 1,
			[itemID('Ancient page 3')]: 1,
			[itemID('Ancient page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of darkness page set',
		inputItems: {
			[itemID('Ancient page 1')]: 1,
			[itemID('Ancient page 2')]: 1,
			[itemID('Ancient page 3')]: 1,
			[itemID('Ancient page 4')]: 1
		},
		outputItems: {
			[itemID('Book of darkness page set')]: 1
		}
	},
	{
		name: 'Book of law pages',
		inputItems: {
			[itemID('Book of law page set')]: 1
		},
		outputItems: {
			[itemID('Armadyl page 1')]: 1,
			[itemID('Armadyl page 2')]: 1,
			[itemID('Armadyl page 3')]: 1,
			[itemID('Armadyl page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of law page set',
		inputItems: {
			[itemID('Armadyl page 1')]: 1,
			[itemID('Armadyl page 2')]: 1,
			[itemID('Armadyl page 3')]: 1,
			[itemID('Armadyl page 4')]: 1
		},
		outputItems: {
			[itemID('Book of law page set')]: 1
		}
	},
	{
		name: 'Book of war pages',
		inputItems: {
			[itemID('Book of war page set')]: 1
		},
		outputItems: {
			[itemID('Bandos page 1')]: 1,
			[itemID('Bandos page 2')]: 1,
			[itemID('Bandos page 3')]: 1,
			[itemID('Bandos page 4')]: 1
		},
		noCl: true
	},
	{
		name: 'Book of war page set',
		inputItems: {
			[itemID('Bandos page 1')]: 1,
			[itemID('Bandos page 2')]: 1,
			[itemID('Bandos page 3')]: 1,
			[itemID('Bandos page 4')]: 1
		},
		outputItems: {
			[itemID('Book of war page set')]: 1
		}
	},
	// twisted relichunter
	{
		name: 'Twisted relichunter (t1) armour',
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
		name: 'Twisted relichunter (t2) armour',
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
		name: 'Twisted relichunter (t3) armour',
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
	// holiday
	{
		name: 'Partyhats',
		inputItems: {
			[itemID('Partyhat set')]: 1
		},
		outputItems: {
			[itemID('Red partyhat')]: 1,
			[itemID('Yellow partyhat')]: 1,
			[itemID('Green partyhat')]: 1,
			[itemID('Blue partyhat')]: 1,
			[itemID('Purple partyhat')]: 1,
			[itemID('White partyhat')]: 1
		},
		noCl: true
	},
	{
		name: 'Partyhat set',
		inputItems: {
			[itemID('Red partyhat')]: 1,
			[itemID('Yellow partyhat')]: 1,
			[itemID('Green partyhat')]: 1,
			[itemID('Blue partyhat')]: 1,
			[itemID('Purple partyhat')]: 1,
			[itemID('White partyhat')]: 1
		},
		outputItems: {
			[itemID('Partyhat set')]: 1
		}
	},
	{
		name: 'Halloween masks',
		inputItems: {
			[itemID('Halloween mask set')]: 1
		},
		outputItems: {
			[itemID('Red halloween mask')]: 1,
			[itemID('Green halloween mask')]: 1,
			[itemID('Blue halloween mask')]: 1
		},
		noCl: true
	},
	{
		name: 'Halloween mask set',
		inputItems: {
			[itemID('Red halloween mask')]: 1,
			[itemID('Green halloween mask')]: 1,
			[itemID('Blue halloween mask')]: 1
		},
		outputItems: {
			[itemID('Halloween mask set')]: 1
		}
	},
	// misc
	{
		name: 'Combat potions',
		inputItems: {
			[itemID('Combat potion set')]: 1
		},
		outputItems: {
			[itemID('Attack potion(4)')]: 1,
			[itemID('Strength potion(4)')]: 1,
			[itemID('Defence potion(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'Combat potion set',
		inputItems: {
			[itemID('Attack potion(4)')]: 1,
			[itemID('Strength potion(4)')]: 1,
			[itemID('Defence potion(4)')]: 1
		},
		outputItems: {
			[itemID('Combat potion set')]: 1
		}
	},
	{
		name: 'Super potions',
		inputItems: {
			[itemID('Super potion set')]: 1
		},
		outputItems: {
			[itemID('Super attack(4)')]: 1,
			[itemID('Super strength(4)')]: 1,
			[itemID('Super defence(4)')]: 1
		},
		noCl: true
	},
	{
		name: 'Super potion set',
		inputItems: {
			[itemID('Super attack(4)')]: 1,
			[itemID('Super strength(4)')]: 1,
			[itemID('Super defence(4)')]: 1
		},
		outputItems: {
			[itemID('Super potion set')]: 1
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
		},
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
			crafting: 15,
			smithing: 5
		},
		GPCost: 300_000
	},
	{
		name: 'Neitiznot faceguard',
		inputItems: resolveNameBank({
			'Helm of neitiznot': 1,
			'Basilisk jaw': 1
		}),
		outputItems: resolveNameBank({
			'Neitiznot faceguard': 1
		}),
		QPRequired: 77
	},
	{
		name: 'Basilisk jaw',
		inputItems: resolveNameBank({
			'Neitiznot faceguard': 1
		}),
		outputItems: resolveNameBank({
			'Helm of neitiznot': 1,
			'Basilisk jaw': 1
		}),
		QPRequired: 77
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
