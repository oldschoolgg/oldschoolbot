import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';

export const gracefulHoods = [
	'Graceful hood',
	'Arceuus graceful hood',
	'Piscarilius graceful hood',
	'Lovakengj graceful hood',
	'Shayzien graceful hood',
	'Hosidius graceful hood',
	'Kourend graceful hood',
	'Brimhaven graceful hood',
	'Dark graceful hood',
	'Trailblazer graceful hood'
];

export const gracefulTops = [
	'Graceful top',
	'Arceuus graceful top',
	'Piscarilius graceful top',
	'Lovakengj graceful top',
	'Shayzien graceful top',
	'Hosidius graceful top',
	'Kourend graceful top',
	'Brimhaven graceful top',
	'Dark graceful top',
	'Trailblazer graceful top'
];

export const gracefulLegs = [
	'Graceful legs',
	'Arceuus graceful legs',
	'Piscarilius graceful legs',
	'Lovakengj graceful legs',
	'Shayzien graceful legs',
	'Hosidius graceful legs',
	'Kourend graceful legs',
	'Brimhaven graceful legs',
	'Dark graceful legs',
	'Trailblazer graceful legs'
];

export const gracefulFeet = [
	'Graceful boots',
	'Arceuus graceful boots',
	'Piscarilius graceful boots',
	'Lovakengj graceful boots',
	'Shayzien graceful boots',
	'Hosidius graceful boots',
	'Kourend graceful boots',
	'Brimhaven graceful boots',
	'Dark graceful boots',
	'Trailblazer graceful boots'
];

export const gracefulHands = [
	'Graceful gloves',
	'Arceuus graceful gloves',
	'Piscarilius graceful gloves',
	'Lovakengj graceful gloves',
	'Shayzien graceful gloves',
	'Hosidius graceful gloves',
	'Kourend graceful gloves',
	'Brimhaven graceful gloves',
	'Dark graceful gloves',
	'Trailblazer graceful gloves'
];

export const gracefulCapes = [
	'Graceful cape',
	'Arceuus graceful cape',
	'Piscarilius graceful cape',
	'Lovakengj graceful cape',
	'Shayzien graceful cape',
	'Hosidius graceful cape',
	'Kourend graceful cape',
	'Brimhaven graceful cape',
	'Dark graceful cape',
	'Trailblazer graceful cape',
	'Agility cape',
	'Agility cape (t)',
	'Max cape'
];

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
	['Dragon pickaxe', ['Dragon pickaxe(or)', 12797]],
	['Steam battlestaff', [12795]],
	['Lava battlestaff', [21198]],
	['Odium ward', [12807]],
	['Malediction ward', [12806]],
	['Dark bow', [12765, 12766, 12767, 12768]],
	['Abyssal whip', ['Volcanic abyssal whip', 'Frozen abyssal whip']],
	['Granite maul', [12848]],
	['Rune scimitar', [23330, 23332, 23334]],
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
	['Dragonfire ward', [22003]],
	['Dragonfire shield', [11284]],
	['Ancient wyvern shield', [21634]],
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
	['Anti-dragon shield', [11284, 11283, 21633, 21634, 22003, 22002]],
	[
		'Staff of water',
		[
			'Mist battlestaff',
			'Mystic mist staff',
			'Tome of water',
			'Kodai wand',
			'Water battlestaff',
			'Mystic water staff',
			'Steam battlestaff',
			'Mystic steam staff',
			'Mud battlestaff',
			'Mystic mud staff',
			'Kodai wand'
		]
	],
	['Attack cape', ['Max cape', 'Attack cape(t)']],
	[
		'Drygore rapier',
		['Drygore rapier (ice)', 'Drygore rapier (blood)', 'Drygore rapier (shadow)', 'Drygore rapier (3a)']
	],
	[
		'Offhand drygore rapier',
		[
			'Offhand drygore rapier (ice)',
			'Offhand drygore rapier (blood)',
			'Offhand drygore rapier (shadow)',
			'Offhand drygore rapier (3a)'
		]
	],
	[
		'Drygore longsword',
		['Drygore longsword (ice)', 'Drygore longsword (blood)', 'Drygore longsword (shadow)', 'Drygore longsword (3a)']
	],
	[
		'Offhand drygore longsword',
		[
			'Offhand drygore longsword (ice)',
			'Offhand drygore longsword (blood)',
			'Offhand drygore longsword (shadow)',
			'Offhand drygore longsword (3a)'
		]
	],
	['Drygore mace', ['Drygore mace (ice)', 'Drygore mace (blood)', 'Drygore mace (shadow)', 'Drygore mace (3a)']],
	[
		'Offhand drygore mace',
		[
			'Offhand drygore mace (ice)',
			'Offhand drygore mace (blood)',
			'Offhand drygore mace (shadow)',
			'Offhand drygore mace (3a)'
		]
	],
	['Agility master cape', ['Support cape']],
	['Dungeoneering master cape', ['Support cape']],
	['Thieving master cape', ['Support cape']],
	['Slayer master cape', ['Support cape']],
	['Farming master cape', ["Gatherer's cape"]],
	['Fishing master cape', ["Gatherer's cape"]],
	['Hunter master cape', ["Gatherer's cape"]],
	['Mining master cape', ["Gatherer's cape"]],
	['Woodcutting master cape', ["Gatherer's cape"]],
	['Attack master cape', ["Combatant's cape"]],
	['Hitpoints master cape', ["Combatant's cape"]],
	['Defence master cape', ["Combatant's cape"]],
	['Magic master cape', ["Combatant's cape"]],
	['Prayer master cape', ["Combatant's cape"]],
	['Ranged master cape', ["Combatant's cape"]],
	['Strength master cape', ["Combatant's cape"]],
	['Crafting master cape', ["Artisan's cape"]],
	['Construction master cape', ["Artisan's cape"]],
	['Cooking master cape', ["Artisan's cape"]],
	['Firemaking master cape', ["Artisan's cape"]],
	['Fletching master cape', ["Artisan's cape"]],
	['Herblore master cape', ["Artisan's cape"]],
	['Runecraft master cape', ["Artisan's cape"]],
	['Smithing master cape', ["Artisan's cape"]],
	['Torva full helm', ['Gorajan warrior helmet']],
	['Torva platebody', ['Gorajan warrior top']],
	['Torva platelegs', ['Gorajan warrior legs']],
	['Torva gloves', ['Gorajan warrior gloves']],
	['Torva boots', ['Gorajan warrior boots']],
	['Virtus mask', ['Gorajan occult helmet']],
	['Virtus robe top', ['Gorajan occult top']],
	['Virtus robe legs', ['Gorajan occult legs']],
	['Virtus gloves', ['Gorajan occult gloves']],
	['Virtus boots', ['Gorajan occult boots']],
	['Pernix cowl', ['Gorajan archer helmet']],
	['Pernix body', ['Gorajan archer top']],
	['Pernix chaps', ['Gorajan archer legs']],
	['Pernix gloves', ['Gorajan archer gloves']],
	['Pernix boots', ['Gorajan archer boots']],
	['Abyssal cape', ['Vasa cloak']],
	['Ivandis flail', ['Blisterwood flail']]
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
