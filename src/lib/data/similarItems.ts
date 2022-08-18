import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import {
	gracefulCapes,
	gracefulFeet,
	gracefulHands,
	gracefulHoods,
	gracefulLegs,
	gracefulTops
} from './gracefulVariants';

const scytheChargedSimilar = ['Holy scythe of vitur', 'Sanguine scythe of vitur'];
const scytheUnchargedSimilar = ['Holy scythe of vitur (uncharged)', 'Sanguine scythe of vitur (uncharged)'];

const blackMaskISimilar = resolveItems([
	'Black mask (10) (i)',
	'Black mask (9) (i)',
	'Black mask (8) (i)',
	'Black mask (7) (i)',
	'Black mask (6) (i)',
	'Black mask (5) (i)',
	'Black mask (4) (i)',
	'Black mask (3) (i)',
	'Black mask (2) (i)',
	'Black mask (1) (i)'
]);
const slayerHelmSimilar = resolveItems([
	'Slayer helmet',
	'Black slayer helmet',
	'Green slayer helmet',
	'Red slayer helmet',
	'Purple slayer helmet',
	'Turquoise slayer helmet',
	'Hydra slayer helmet',
	'Twisted slayer helmet'
]);
const slayerHelmSimilarI = resolveItems([
	'Black slayer helmet (i)',
	'Green slayer helmet (i)',
	'Red slayer helmet (i)',
	'Purple slayer helmet (i)',
	'Turquoise slayer helmet (i)',
	'Hydra slayer helmet (i)',
	'Twisted slayer helmet (i)',
	'Slayer helmet (i)'
]);
const bowfaCorruptSimilar = resolveItems([
	25_869, // Red, 'duplicate' according to osrsbox item-search
	25_884, // White
	25_886, // Black
	25_888, // Brown?
	25_890, // Green
	25_892, // Yellow
	25_894, // Light blue
	25_896 // Dark blue
]);

const source: [string, (string | number)[]][] = [
	['Dragon full helm', ['Dragon full helm (g)']],
	['Dragon chainbody', ['Dragon chainbody (g)']],
	['Dragon platebody', ['Dragon platebody (g)']],
	['Dragon platelegs', ['Dragon platelegs (g)']],
	['Dragon plateskirt', ['Dragon plateskirt (g)']],
	['Dragon sq shield', ['Dragon sq shield (g)']],
	['Dragon kiteshield', ['Dragon kiteshield (g)']],
	['Dragon scimitar', ['Dragon scimitar (or)']],
	['Dragon defender', ['Dragon defender (t)', 'Dragon defender (l)']],
	['Dragon boots', ['Dragon boots (g)']],
	['Armadyl godsword', ['Armadyl godsword (or)']],
	['Bandos godsword', ['Bandos godsword (or)']],
	['Saradomin godsword', ['Saradomin godsword (or)']],
	['Zamorak godsword', ['Zamorak godsword (or)']],
	['Infinity hat', ['Dark infinity hat', 'Light infinity hat']],
	['Infinity top', ['Dark infinity top', 'Light infinity top']],
	['Infinity bottoms', ['Dark infinity bottoms', 'Light infinity bottoms']],
	['Ancestral hat', ['Twisted ancestral hat']],
	['Ancestral robe top', ['Twisted ancestral robe top']],
	['Ancestral robe bottom', ['Twisted ancestral robe bottom']],
	['Tzhaar-ket-om', ['Tzhaar-ket-om (t)']],
	['Berserker necklace', ['Berserker necklace (or)']],
	['Amulet of fury', ['Amulet of fury (or)', 'Amulet of blood fury']],
	['Amulet of torture', ['Amulet of torture (or)']],
	['Tormented bracelet', ['Tormented bracelet (or)']],
	['Necklace of anguish', ['Necklace of anguish (or)']],
	['Occult necklace', ['Occult necklace (or)']],
	['Dragon hunter crossbow', ['Dragon hunter crossbow (t)', 'Dragon hunter crossbow (b)']],
	['Armadyl crossbow', ['Zaryte crossbow']],
	['Dragon pickaxe', ['Dragon pickaxe(or)', 12_797, '3rd age pickaxe', 'Infernal pickaxe']],
	['Dragon axe', ['3rd age axe']],
	['Steam battlestaff', [12_795]],
	['Lava battlestaff', [21_198]],
	['Odium ward', [12_807]],
	['Malediction ward', [12_806]],
	['Dark bow', [12_765, 12_766, 12_767, 12_768]],
	['Abyssal whip', ['Volcanic abyssal whip', 'Frozen abyssal whip', 'Abyssal tentacle']],
	['Granite maul', [12_848]],
	['Rune scimitar', [23_330, 23_332, 23_334]],
	[
		"Black d'hide body",
		[
			"Black d'hide body (g)",
			"Black d'hide body (t)",
			"Guthix d'hide body",
			"Saradomin d'hide body",
			"Zamorak d'hide body",
			"Armadyl d'hide body",
			"Ancient d'hide body",
			"Bandos d'hide body"
		]
	],
	[
		"Black d'hide chaps",
		[
			"Black d'hide chaps (g)",
			"Black d'hide chaps (t)",
			'Guthix chaps',
			'Saradomin chaps',
			'Zamorak chaps',
			'Armadyl chaps',
			'Ancient chaps',
			'Bandos chaps'
		]
	],
	[
		"Guthix d'hide boots",
		[
			"Saradomin d'hide boots",
			"Zamorak d'hide boots",
			"Armadyl d'hide boots",
			"Ancient d'hide boots",
			"Bandos d'hide boots"
		]
	],
	[
		'Amulet of glory',
		[
			'Amulet of glory (1)',
			'Amulet of glory (2)',
			'Amulet of glory (3)',
			'Amulet of glory (4)',
			'Amulet of glory (5)',
			'Amulet of glory (6)',
			'Amulet of glory (t)',
			'Amulet of glory (t1)',
			'Amulet of glory (t2)',
			'Amulet of glory (t3)',
			'Amulet of glory (t4)',
			'Amulet of glory (t5)',
			'Amulet of glory (t6)',
			'Amulet of eternal glory'
		]
	],
	['Graceful hood', gracefulHoods],
	['Graceful top', gracefulTops],
	['Graceful legs', gracefulLegs],
	['Graceful gloves', gracefulHands],
	['Graceful boots', gracefulFeet],
	['Graceful cape', gracefulCapes],
	['Agility cape', ['Agility cape(t)']],
	['Fire cape', ['Fire max cape', 'Fire max cape (l)']],
	['Infernal cape', ['Infernal max cape', 'Infernal max cape (l)']],
	['Ardougne cloak 4', ['Ardougne max cape']],
	["Ava's accumulator", ['Accumulator max cape']],
	["Ava's assembler", ['Assembler max cape', 'Assembler max cape (l)']],
	['Mythical cape', ['Mythical max cape']],
	['Achievement diary cape', ['Achievement diary cape(t)']],
	[
		'Imbued guthix cape',
		[
			'Imbued guthix max cape',
			'Imbued guthix max cape (l)',
			'Imbued saradomin cape',
			'Imbued saradomin max cape',
			'Imbued saradomin max cape (l)',
			'Imbued zamorak cape',
			'Imbued zamorak max cape',
			'Imbued zamorak max cape (l)'
		]
	],
	['Guthix cape', ['Saradomin cape', 'Zamorak cape', 'Guthix max cape', 'Saradomin max cape', 'Zamorak max cape']],
	['Dragonfire ward', [22_003]],
	['Dragonfire shield', [11_284]],
	['Ancient wyvern shield', [21_634]],
	['Avernic defender', ['Avernic defender (l)']],
	['Void melee helm', ['Void melee helm (l)']],
	['Void mage helm', ['Void mage helm (l)']],
	['Void ranger helm', ['Void ranger helm (l)']],
	['Void knight top', ['Void knight top (l)', 'Elite void top', 'Elite void top (l)']],
	['Elite void top', ['Elite void top (l)']],
	['Void knight robe', ['Void knight robe (l)', 'Elite void robe', 'Elite void robe (l)']],
	['Elite void robe', ['Elite void robe (l)']],
	['Void knight gloves', ['Void knight gloves (l)']],
	['Trident of the seas', ['Trident of the seas (full)', 'Trident of the seas (e)']],
	['Trident of the swamp', ['Trident of the swamp (e)']],
	['Bow of faerdhinen (c)', bowfaCorruptSimilar],
	['Slayer helmet', slayerHelmSimilar],
	['Slayer helmet (i)', slayerHelmSimilarI],
	['Black mask (i)', [...slayerHelmSimilarI, ...blackMaskISimilar]],
	[
		'Black mask',
		[
			...blackMaskISimilar,
			...slayerHelmSimilarI,
			...slayerHelmSimilar,
			...[
				'Black mask (i)',
				'Black mask (1)',
				'Black mask (2)',
				'Black mask (3)',
				'Black mask (4)',
				'Black mask (5)',
				'Black mask (6)',
				'Black mask (7)',
				'Black mask (8)',
				'Black mask (9)',
				'Black mask (10)'
			]
		]
	],
	['Slayer cape', ['Slayer cape (t)']],
	['Nose peg', slayerHelmSimilar],
	['Earmuffs', slayerHelmSimilar],
	['Spiny helmet', slayerHelmSimilar],
	['Facemask', slayerHelmSimilar],
	['Reinforced goggles', slayerHelmSimilar],
	['Anti-dragon shield', [11_284, 11_283, 21_633, 21_634, 22_003, 22_002]],
	[
		'Staff of water',
		[
			'Mist battlestaff',
			'Mystic mist staff',
			'Tome of water (empty)',
			'Tome of water',
			'Kodai wand',
			'Water battlestaff',
			'Mystic water staff',
			'Steam battlestaff',
			'Mystic steam staff',
			'Mud battlestaff',
			'Mystic mud staff'
		]
	],
	['Attack cape', ['Max cape', 'Attack cape(t)']],
	['Farming cape', ['Max cape', 'Farming cape(t)']],
	['Ivandis flail', ['Blisterwood flail']],
	['Angler hat', ['Spirit angler headband']],
	['Angler top', ['Spirit angler top']],
	['Angler waders', ['Spirit angler waders']],
	['Angler boots', ['Spirit angler boots']],
	['Flippers', ['Dark flippers']],
	[
		'Merfolk trident',
		[
			'Trident of the seas (full)',
			'Trident of the seas',
			'Uncharged trident',
			'Trident of the seas (e)',
			'Uncharged trident (e)',
			'Trident of the swamp',
			'Uncharged toxic trident',
			'Trident of the swamp (e)',
			'Uncharged toxic trident (e)'
		]
	],
	['Runecraft cape', ['Max cape', 'Runecraft cape(t)']],
	['Crafting cape', ['Max cape', 'Crafting cape(t)']],
	['Mining cape', ['Max cape', 'Mining cape(t)']],
	['Salve amulet', ['Salve amulet(ei)', 'Salve amulet(i)', 'Salve amulet (e)']],
	['Salve amulet (e)', ['Salve amulet(ei)']],
	['Salve amulet(i)', ['Salve amulet(ei)']],
	['Scythe of vitur', [...scytheChargedSimilar]],
	['Scythe of vitur (uncharged)', [...scytheUnchargedSimilar]],
	['Sanguinesti staff', ['Holy sanguinesti staff']],
	['Sanguinesti staff (uncharged)', ['Holy sanguinesti staff (uncharged)']],
	['Magic shortbow', ['Magic shortbow (i)']],
	['Boots of stone', ['Boots of brimstone', 'Granite boots', "Rada's Blessing 4"]],
	['Celestial ring', ['Celestial signet']],
	['Prospector jacket', ['Golden prospector jacket']],
	['Prospector legs', ['Golden prospector legs']],
	['Prospector boots', ['Golden prospector boots']],
	['Prospector helmet', ['Golden prospector helmet']]
];

export const similarItems: Map<number, number[]> = new Map(
	source.map(entry => [itemID(entry[0]), resolveItems(entry[1])])
);

export const inverseSimilarItems: Map<number, Set<number>> = new Map();
for (const [baseItem, similarItems] of source) {
	for (const item of resolveItems(similarItems)) {
		if (!inverseSimilarItems.get(item)) {
			inverseSimilarItems.set(item, new Set());
		}
		inverseSimilarItems.get(item)!.add(itemID(baseItem));
	}
}

export function getSimilarItems(itemID: number): number[] {
	const similars = similarItems.get(itemID);
	return similars ? [itemID, ...similars] : [];
}
