import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

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
	[itemID('Dragon defender')]: resolveItems(['Dragon defender (t)']),
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
	[itemID('Rune scimitar')]: resolveItems([23330, 23332, 23334, 'Gilded scimitar']),
	[itemID('Rune defender')]: resolveItems(['Rune defender (t)']),
	[itemID("Green d'hide body")]: resolveItems(["Green d'hide body (g)", "Green d'hide body (t)"]),
	[itemID("Green d'hide chaps")]: resolveItems([
		"Green d'hide chaps (g)",
		"Green d'hide chaps (t)"
	]),
	[itemID("Blue d'hide body")]: resolveItems(["Blue d'hide body (g)", "Blue d'hide body (t)"]),
	[itemID("Blue d'hide chaps")]: resolveItems(["Blue d'hide chaps (g)", "Blue d'hide chaps (t)"]),
	[itemID("Red d'hide body")]: resolveItems(["Red d'hide body (g)", "Red d'hide body (t)"]),
	[itemID("Red d'hide chaps")]: resolveItems(["Red d'hide chaps (g)", "Red d'hide chaps (t)"]),
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
	[itemID("Black d'hide shield")]: resolveItems([
		"Guthix d'hide shield",
		"Saradomin d'hide shield",
		"Zamorak d'hide shield",
		"Armadyl d'hide shield",
		"Ancient d'hide shield",
		"Bandos d'hide shield"
	]),
	[itemID("Monk's robe top")]: resolveItems(["Monk's robe top (t)"]),
	[itemID("Monk's robe")]: resolveItems(["Monk's robe (t)"]),
	[itemID('Amulet of defence')]: resolveItems(['Amulet of defence (t)']),
	[itemID('Amulet of magic')]: resolveItems(['Amulet of magic (t)']),
	[itemID('Wooden shield')]: resolveItems(['Wooden shield (g)']),
	[itemID('Black full helm')]: resolveItems([
		'Black full helm (t)',
		'Black full helm (g)',
		'Black helm (h1)',
		'Black helm (h2)',
		'Black helm (h3)',
		'Black helm (h4)',
		'Black helm (h5)'
	]),
	[itemID('Black platebody')]: resolveItems([
		'Black platebody (t)',
		'Black platebody (g)',
		'Black platebody (h1)',
		'Black platebody (h2)',
		'Black platebody (h3)',
		'Black platebody (h4)',
		'Black platebody (h5)'
	]),
	[itemID('Black platelegs')]: resolveItems([
		'Black plateskirt',
		'Black platelegs (t)',
		'Black platelegs (g)',
		'Black plateskirt (t)',
		'Black plateskirt (g)'
	]),
	[itemID('Black plateskirt')]: resolveItems([
		'Black platelegs',
		'Black plateskirt (t)',
		'Black plateskirt (g)',
		'Black platelegs (t)',
		'Black platelegs (g)'
	]),
	[itemID('Black kiteshield')]: resolveItems([
		'Black kiteshield (t)',
		'Black kiteshield (g)',
		'Black shield (h1)',
		'Black shield (h2)',
		'Black shield (h3)',
		'Black shield (h4)',
		'Black shield (h5)'
	]),
	[itemID('Steel full helm')]: resolveItems(['Steel full helm (t)', 'Steel full helm (g)']),
	[itemID('Steel platebody')]: resolveItems(['Steel platebody (t)', 'Steel platebody (g)']),
	[itemID('Steel platelegs')]: resolveItems([
		'Steel plateskirt',
		'Steel platelegs (t)',
		'Steel platelegs (g)',
		'Steel plateskirt (t)',
		'Steel plateskirt (g)'
	]),
	[itemID('Steel plateskirt')]: resolveItems([
		'Steel platelegs',
		'Steel plateskirt (t)',
		'Steel plateskirt (g)',
		'Steel platelegs (t)',
		'Steel platelegs (g)'
	]),
	[itemID('Steel kiteshield')]: resolveItems(['Steel kiteshield (t)', 'Steel kiteshield (g)']),
	[itemID('Iron full helm')]: resolveItems(['Iron full helm (t)', 'Iron full helm (g)']),
	[itemID('Iron platebody')]: resolveItems(['Iron platebody (t)', 'Iron platebody (g)']),
	[itemID('Iron platelegs')]: resolveItems([
		'Iron plateskirt',
		'Iron platelegs (t)',
		'Iron platelegs (g)',
		'Iron plateskirt (t)',
		'Iron plateskirt (g)'
	]),
	[itemID('Iron plateskirt')]: resolveItems([
		'Iron platelegs',
		'Iron plateskirt (t)',
		'Iron plateskirt (g)',
		'Iron platelegs (t)',
		'Iron platelegs (g)'
	]),
	[itemID('Iron kiteshield')]: resolveItems(['Iron kiteshield (t)', 'Iron kiteshield (g)']),
	[itemID('Bronze full helm')]: resolveItems(['Bronze full helm (t)', 'Bronze full helm (g)']),
	[itemID('Bronze platebody')]: resolveItems(['Bronze platebody (t)', 'Bronze platebody (g)']),
	[itemID('Bronze platelegs')]: resolveItems([
		'Bronze plateskirt',
		'Bronze platelegs (t)',
		'Bronze platelegs (g)',
		'Bronze plateskirt (t)',
		'Bronze plateskirt (g)'
	]),
	[itemID('Bronze plateskirt')]: resolveItems([
		'Bronze platelegs',
		'Bronze plateskirt (t)',
		'Bronze plateskirt (g)',
		'Bronze platelegs (t)',
		'Bronze platelegs (g)'
	]),
	[itemID('Bronze kiteshield')]: resolveItems(['Bronze kiteshield (t)', 'Bronze kiteshield (g)']),
	[itemID('Studded body')]: resolveItems(['Studded body (g)', 'Studded body (t)']),
	[itemID('Studded chaps')]: resolveItems(['Studded chaps (g)', 'Studded chaps (t)']),
	[itemID('Leather body')]: resolveItems(['Leather body (g)']),
	[itemID('Leather chaps')]: resolveItems(['Leather chaps (g)']),
	[itemID('Blue wizard hat')]: resolveItems(['Blue wizard hat (g)', 'Blue wizard hat (t)']),
	[itemID('Blue wizard robe')]: resolveItems([
		'Blue wizard robe (g)',
		'Blue wizard robe (t)',
		'Black wizard robe (g)',
		'Black wizard robe (t)'
	]),
	[itemID('Blue skirt')]: resolveItems(['Blue skirt (g)', 'Blue skirt (t)']),
	[itemID('Wizard hat')]: resolveItems(['Black wizard hat (g)', 'Black wizard hat (t)']),
	[itemID('Black skirt')]: resolveItems(['Black skirt (g)', 'Black skirt (t)']),
	[itemID('Amulet of power')]: resolveItems(['Amulet of power (t)']),
	[itemID('Climbing boots')]: resolveItems(['Climbing boots (g)']),
	[itemID('Adamant full helm')]: resolveItems([
		'Adamant full helm (t)',
		'Adamant full helm (g)',
		'Adamant helm (h1)',
		'Adamant helm (h2)',
		'Adamant helm (h3)',
		'Adamant helm (h4)',
		'Adamant helm (h5)'
	]),
	[itemID('Adamant platebody')]: resolveItems([
		'Adamant platebody (t)',
		'Adamant platebody (g)',
		'Adamant platebody (h1)',
		'Adamant platebody (h2)',
		'Adamant platebody (h3)',
		'Adamant platebody (h4)',
		'Adamant platebody (h5)'
	]),
	[itemID('Adamant platelegs')]: resolveItems([
		'Adamant plateskirt',
		'Adamant platelegs (t)',
		'Adamant platelegs (g)',
		'Adamant plateskirt (t)',
		'Adamant plateskirt (g)'
	]),
	[itemID('Adamant plateskirt')]: resolveItems([
		'Adamant platelegs',
		'Adamant plateskirt (t)',
		'Adamant plateskirt (g)',
		'Adamant platelegs (t)',
		'Adamant platelegs (g)'
	]),
	[itemID('Adamant kiteshield')]: resolveItems([
		'Adamant kiteshield (t)',
		'Adamant kiteshield (g)',
		'Adamant shield (h1)',
		'Adamant shield (h2)',
		'Adamant shield (h3)',
		'Adamant shield (h4)',
		'Adamant shield (h5)'
	]),
	[itemID('Mithril full helm')]: resolveItems(['Mithril full helm (t)', 'Mithril full helm (g)']),
	[itemID('Mithril platebody')]: resolveItems(['Mithril platebody (t)', 'Mithril platebody (g)']),
	[itemID('Mithril platelegs')]: resolveItems([
		'Mithril plateskirt',
		'Mithril platelegs (t)',
		'Mithril platelegs (g)',
		'Mithril plateskirt (t)',
		'Mithril plateskirt (g)'
	]),
	[itemID('Mithril plateskirt')]: resolveItems([
		'Mithril platelegs',
		'Mithril plateskirt (t)',
		'Mithril plateskirt (g)',
		'Mithril platelegs (t)',
		'Mithril platelegs (g)'
	]),
	[itemID('Mithril kiteshield')]: resolveItems([
		'Mithril kiteshield (t)',
		'Mithril kiteshield (g)'
	]),
	[itemID('Amulet of strength')]: resolveItems(['Strength amulet (t)']),
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
	[itemID('Rune full helm')]: resolveItems([
		'Rune full helm (t)',
		'Rune full helm (g)',
		'Rune helm (h1)',
		'Rune helm (h2)',
		'Rune helm (h3)',
		'Rune helm (h4)',
		'Rune helm (h5)',
		'Zamorak full helm',
		'Guthix full helm',
		'Saradomin full helm',
		'Ancient full helm',
		'Armadyl full helm',
		'Bandos full helm',
		'Gilded full helm'
	]),
	[itemID('Rune platebody')]: resolveItems([
		'Rune platebody (t)',
		'Rune platebody (g)',
		'Rune platebody (h1)',
		'Rune platebody (h2)',
		'Rune platebody (h3)',
		'Rune platebody (h4)',
		'Rune platebody (h5)',
		'Zamorak platebody',
		'Guthix platebody',
		'Saradomin platebody',
		'Ancient platebody',
		'Armadyl platebody',
		'Bandos platebody',
		'Gilded platebody'
	]),
	[itemID('Rune platelegs')]: resolveItems([
		'Rune plateskirt',
		'Rune platelegs (t)',
		'Rune platelegs (g)',
		'Rune plateskirt (t)',
		'Rune plateskirt (g)',
		'Zamorak platelegs',
		'Zamorak plateskirt',
		'Guthix platelegs',
		'Guthix plateskirt',
		'Saradomin platelegs',
		'Saradomin plateskirt',
		'Ancient platelegs',
		'Ancient plateskirt',
		'Armadyl platelegs',
		'Armadyl plateskirt',
		'Bandos platelegs',
		'Bandos plateskirt',
		'Gilded platelegs',
		'Gilded plateskirt'
	]),
	[itemID('Rune plateskirt')]: resolveItems([
		'Rune platelegs',
		'Rune platelegs (t)',
		'Rune plateskirt (t)',
		'Rune platelegs (g)',
		'Rune plateskirt (g)',
		'Zamorak platelegs',
		'Zamorak plateskirt',
		'Guthix platelegs',
		'Guthix plateskirt',
		'Saradomin platelegs',
		'Saradomin plateskirt',
		'Ancient platelegs',
		'Ancient plateskirt',
		'Armadyl platelegs',
		'Armadyl plateskirt',
		'Bandos platelegs',
		'Bandos plateskirt',
		'Gilded platelegs',
		'Gilded plateskirt'
	]),
	[itemID('Rune kiteshield')]: resolveItems([
		'Rune kiteshield (t)',
		'Rune kiteshield (g)',
		'Rune shield (h1)',
		'Rune shield (h2)',
		'Rune shield (h3)',
		'Rune shield (h4)',
		'Rune shield (h5)',
		'Gilded kiteshield'
	]),
	[itemID('Rune med helm')]: resolveItems(['Gilded med helm']),
	[itemID('Rune chainbody')]: resolveItems(['Gilded chainbody']),
	[itemID('Rune sq shield')]: resolveItems(['Gilded sq shield']),
	[itemID('Obsidian cape')]: resolveItems(['Obsidian cape (r)']),
	[itemID('Bucket helm')]: resolveItems(['Bucket helm (g)']),
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
		'Imbued guthix max cape (l)'
	]),
	[itemID('Imbued saradomin cape')]: resolveItems([
		'Imbued saradomin max cape',
		'Imbued saradomin max cape (l)'
	]),
	[itemID('Imbued zamorak cape')]: resolveItems([
		'Imbued zamorak max cape',
		'Imbued zamorak max cape (l)'
	]),
	[itemID('Guthix cape')]: resolveItems(['Guthix max cape']),
	[itemID('Saradomin cape')]: resolveItems(['Saradomin max cape']),
	[itemID('Zamorak cape')]: resolveItems(['Zamorak max cape']),
	[itemID('Rune pouch')]: resolveItems(['Rune pouch (l)']),
	[itemID('Bronze defender')]: resolveItems(['Bronze defender (l)']),
	[itemID('Iron defender')]: resolveItems(['Iron defender (l)']),
	[itemID('Steel defender')]: resolveItems(['Steel defender (l)']),
	[itemID('Black defender')]: resolveItems(['Black defender (l)']),
	[itemID('Mithril defender')]: resolveItems(['Mithril defender (l)']),
	[itemID('Adamant defender')]: resolveItems(['Adamant defender (l)']),
	[itemID('Rune defender')]: resolveItems(['Rune defender (l)']),
	[itemID('Dragon defender')]: resolveItems(['Dragon defender (l)']),
	[itemID('Avernic defender')]: resolveItems(['Avernic defender (l)']),
	[itemID('Void melee helm')]: resolveItems(['Void melee helm (l)']),
	[itemID('Void mage helm')]: resolveItems(['Void mage helm (l)']),
	[itemID('Void ranger helm')]: resolveItems(['Void ranger helm (l)']),
	[itemID('Void knight top')]: resolveItems(['Void knight top (l)']),
	[itemID('Elite void top')]: resolveItems(['Elite void top (l)']),
	[itemID('Void knight robe')]: resolveItems(['Void knight robe (l)']),
	[itemID('Elite void robe')]: resolveItems(['Elite void robe (l)']),
	[itemID('Void knight gloves')]: resolveItems(['Void knight gloves (l)']),
	[itemID('Fighter hat')]: resolveItems(['Fighter hat (l)']),
	[itemID('Ranger hat')]: resolveItems(['Ranger hat (l)']),
	[itemID('Healer hat')]: resolveItems(['Healer hat (l)']),
	[itemID('Fighter torso')]: resolveItems(['Fighter torso (l)']),
	[itemID('Penance skirt')]: resolveItems(['Penance skirt (l)'])
};

export default SimilarItems;
