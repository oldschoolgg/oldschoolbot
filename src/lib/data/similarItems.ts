import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';

const slayerHelmSimilar = resolveItems([
	'Black slayer helmet (i)',
	'Green slayer helmet (i)',
	'Red slayer helmet (i)',
	'Purple slayer helmet (i)',
	'Turquoise slayer helmet (i)',
	'Hydra slayer helmet (i)',
	'Twisted slayer helmet (i)',
	'Slayer helmet (i)',
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

const SimilarItems: Record<number, number[]> = {
	// Ornaments
	[itemID('Dragon full helm')]: resolveItems(['Dragon full helm (g)']),
	[itemID('Dragon chainbody')]: resolveItems(['Dragon chainbody (g)']),
	[itemID('Dragon platebody')]: resolveItems(['Dragon platebody (g)']),
	[itemID('Dragon platelegs')]: resolveItems(['Dragon platelegs (g)']),
	[itemID('Dragon plateskirt')]: resolveItems(['Dragon plateskirt (g)']),
	[itemID('Dragon sq shield')]: resolveItems(['Dragon sq shield (g)']),
	[itemID('Dragon kiteshield')]: resolveItems(['Dragon kiteshield (g)']),
	[itemID('Dragon scimitar')]: resolveItems(['Dragon scimitar (or)']),
	[itemID('Dragon defender')]: resolveItems(['Dragon defender (t)', 'Dragon defender (l)']),
	[itemID('Dragon boots')]: resolveItems(['Dragon boots (g)']),
	[itemID('Armadyl godsword')]: resolveItems(['Armadyl godsword (or)']),
	[itemID('Bandos godsword')]: resolveItems(['Bandos godsword (or)']),
	[itemID('Saradomin godsword')]: resolveItems(['Saradomin godsword (or)']),
	[itemID('Zamorak godsword')]: resolveItems(['Zamorak godsword (or)']),
	[itemID('Infinity hat')]: resolveItems(['Dark infinity hat', 'Light infinity hat']),
	[itemID('Infinity top')]: resolveItems(['Dark infinity top', 'Light infinity top']),
	[itemID('Infinity bottoms')]: resolveItems(['Dark infinity bottoms', 'Light infinity bottoms']),
	[itemID('Ancestral hat')]: resolveItems(['Twisted ancestral hat']),
	[itemID('Ancestral robe top')]: resolveItems(['Twisted ancestral robe top']),
	[itemID('Ancestral robe bottom')]: resolveItems(['Twisted ancestral robe bottom']),
	[itemID('Tzhaar-ket-om')]: resolveItems(['Tzhaar-ket-om (t)']),
	[itemID('Berserker necklace')]: resolveItems(['Berserker necklace (or)']),
	[itemID('Amulet of fury')]: resolveItems(['Amulet of fury (or)', 'Amulet of blood fury']),
	[itemID('Amulet of torture')]: resolveItems(['Amulet of torture (or)']),
	[itemID('Tormented bracelet')]: resolveItems(['Tormented bracelet (or)']),
	[itemID('Necklace of anguish')]: resolveItems(['Necklace of anguish (or)']),
	[itemID('Occult necklace')]: resolveItems(['Occult necklace (or)']),
	// 12797 = Dragon pickaxe (upgraded)
	[itemID('Dragon pickaxe')]: resolveItems(['Dragon pickaxe(or)', 12797]),
	// 12795 = Steam battlestaff (or)
	[itemID('Steam battlestaff')]: resolveItems([12795]),
	// 21198 = Lava battlestaff (or)
	[itemID('Lava battlestaff')]: resolveItems([21198]),
	// 12807 = Odium ward (or)
	[itemID('Odium ward')]: resolveItems([12807]),
	// 12806 = Malediction ward (or)
	[itemID('Malediction ward')]: resolveItems([12806]),
	// 12765 = Dark bow (green)
	// 12766 = Dark bow (blue)
	// 12767 = Dark bow (yellow)
	// 12768 = Dark bow (white)
	[itemID('Dark bow')]: resolveItems([12765, 12766, 12767, 12768]),
	[itemID('Abyssal whip')]: resolveItems(['Volcanic abyssal whip', 'Frozen abyssal whip']),
	// 12848 = Granite maul (or)
	[itemID('Granite maul')]: resolveItems([12848]),
	// 23330 = Rune scimitar (guthix)
	// 23332 = Rune scimitar (saradomin)
	// 23334 = Rune scimitar (zamorak)
	[itemID('Rune scimitar')]: resolveItems([23330, 23332, 23334]),
	[itemID("Black d'hide body")]: resolveItems([
		"Black d'hide body (g)",
		"Black d'hide body (t)",
		"Guthix d'hide body",
		"Saradomin d'hide body",
		"Zamorak d'hide body",
		"Armadyl d'hide body",
		"Ancient d'hide body",
		"Bandos d'hide body"
	]),
	[itemID("Black d'hide chaps")]: resolveItems([
		"Black d'hide chaps (g)",
		"Black d'hide chaps (t)",
		'Guthix chaps',
		'Saradomin chaps',
		'Zamorak chaps',
		'Armadyl chaps',
		'Ancient chaps',
		'Bandos chaps'
	]),
	[itemID("Guthix d'hide boots")]: resolveItems([
		"Saradomin d'hide boots",
		"Zamorak d'hide boots",
		"Armadyl d'hide boots",
		"Ancient d'hide boots",
		"Bandos d'hide boots"
	]),
	[itemID('Amulet of glory (4)')]: resolveItems([
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
	]),
	[itemID('Graceful hood')]: resolveItems([
		13579, // Arceuus hood
		13591, // Port Piscarilius hood
		13603, // Lovakengj hood
		13615, // Shayzien hood
		13627, // Hosidius hood
		13667, // All cities hood
		21061, // Brimhaven Agility Arena hood
		24743 // Hallowed Sepulchre hood
	]),
	[itemID('Graceful top')]: resolveItems([
		13583, // Arceuus top
		13595, // Port Piscarilius top
		13607, // Lovakengj top
		13619, // Shayzien top
		13631, // Hosidius top
		13671, // All cities top
		21067, // Brimhaven Agility Arena top
		24749 // Hallowed Sepulchre top
	]),
	[itemID('Graceful legs')]: resolveItems([
		13585, // Arceuus legs
		13597, // Port Piscarilius legs
		13609, // Lovakengj legs
		13621, // Shayzien legs
		13633, // Hosidius legs
		13673, // All cities legs
		21070, // Brimhaven Agility Arena legs
		24752 // Hallowed Sepulchre legs
	]),
	[itemID('Graceful gloves')]: resolveItems([
		13587, // Arceuus gloves
		13599, // Port Piscarilius gloves
		13611, // Lovakengj gloves
		13623, // Shayzien gloves
		13635, // Hosidius gloves
		13675, // All cities gloves
		21073, // Brimhaven Agility Arena gloves
		24755 // Hallowed Sepulchre gloves
	]),
	[itemID('Graceful boots')]: resolveItems([
		13589, // Arceuus boots
		13601, // Port Piscarilius boots
		13613, // Lovakengj boots
		13625, // Shayzien boots
		13637, // Hosidius boots
		13677, // All cities boots
		21076, // Brimhaven Agility Arena boots
		24758 // Hallowed Sepulchre boots
	]),
	[itemID('Graceful cape')]: resolveItems([
		13581, // Arceuus cape
		13593, // Port Piscarilius cape
		13605, // Lovakengj cape
		13617, // Shayzien cape
		13629, // Hosidius cape
		13669, // All cities cape
		21064, // Brimhaven Agility Arena cape
		24746 // Hallowed Sepulchre cape
	]),
	[itemID('Fire cape')]: resolveItems(['Fire max cape', 'Fire max cape (l)']),
	[itemID('Infernal cape')]: resolveItems(['Infernal max cape', 'Infernal max cape (l)']),
	[itemID('Ardougne cloak 4')]: resolveItems(['Ardougne max cape']),
	[itemID("Ava's accumulator")]: resolveItems(['Accumulator max cape']),
	[itemID("Ava's assembler")]: resolveItems(['Assembler max cape', 'Assembler max cape (l)']),
	[itemID('Mythical cape')]: resolveItems(['Mythical max cape']),
	[itemID('Imbued guthix cape')]: resolveItems([
		'Imbued guthix max cape',
		'Imbued guthix max cape (l)',
		'Imbued saradomin cape',
		'Imbued saradomin max cape',
		'Imbued saradomin max cape (l)',
		'Imbued zamorak cape',
		'Imbued zamorak max cape',
		'Imbued zamorak max cape (l)'
	]),
	[itemID('Guthix cape')]: resolveItems([
		'Saradomin cape',
		'Zamorak cape',
		'Guthix max cape',
		'Saradomin max cape',
		'Zamorak max cape'
	]),
	[itemID('Avernic defender')]: resolveItems(['Avernic defender (l)']),
	[itemID('Void melee helm')]: resolveItems(['Void melee helm (l)']),
	[itemID('Void mage helm')]: resolveItems(['Void mage helm (l)']),
	[itemID('Void ranger helm')]: resolveItems(['Void ranger helm (l)']),
	[itemID('Void knight top')]: resolveItems([
		'Void knight top (l)',
		'Elite void top',
		'Elite void top (l)'
	]),
	[itemID('Elite void top')]: resolveItems(['Elite void top (l)']),
	[itemID('Void knight robe')]: resolveItems([
		'Void knight robe (l)',
		'Elite void robe',
		'Elite void robe (l)'
	]),
	[itemID('Elite void robe')]: resolveItems(['Elite void robe (l)']),
	[itemID('Void knight gloves')]: resolveItems(['Void knight gloves (l)']),
	[itemID('Trident of the seas')]: resolveItems([
		'Trident of the seas (full)',
		'Trident of the seas (e)'
	]),
	[itemID('Trident of the swamp')]: resolveItems(['Trident of the swamp (e)']),
	[itemID('Slayer helmet')]: slayerHelmSimilar,
	[itemID('Slayer helmet (i)')]: slayerHelmSimilarI,
	[itemID('Black mask (i)')]: slayerHelmSimilarI,
	[itemID('Black mask')]: [
		...slayerHelmSimilar,
		...resolveItems([
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
		])
	],
	[itemID('Slayer cape')]: resolveItems(['Slayer cape (t)']),
	[itemID('Nose peg')]: slayerHelmSimilar,
	[itemID('Earmuffs')]: slayerHelmSimilar,
	[itemID('Spiny helmet')]: slayerHelmSimilar,
	[itemID('Facemask')]: slayerHelmSimilar,
	[itemID('Reinforced goggles')]: slayerHelmSimilar,
	[itemID('Anti-dragon shield')]: resolveItems([11284, 11283, 21633, 21634, 22003, 22002]),
	[itemID('Staff of water')]: resolveItems([
		'Mist battlestaff',
		'Mystic mist staff',
		'Tome of water',
		'Water battlestaff',
		'Mystic water staff',
		'Steam battlestaff',
		'Mystic steam staff',
		'Kodai wand',
		'Mud battlestaff',
		'Mystic mud staff'
	])
};

export function getSimilarItems(itemID: number) {
	return [...new Set([...(SimilarItems[itemID] ?? []), itemID])];
}

export default SimilarItems;
