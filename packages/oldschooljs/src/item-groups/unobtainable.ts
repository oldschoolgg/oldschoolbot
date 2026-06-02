import { Items } from '@/structures/Items.js';

const unobtainableGauntletGear: number[] = Items.resolveItems([
	'Corrupted helm (perfected)',
	'Corrupted body (perfected)',
	'Corrupted legs (perfected)',
	'Corrupted bow (perfected)',
	'Corrupted staff (perfected)',
	'Corrupted halberd (perfected)',

	'Corrupted helm (attuned)',
	'Corrupted body (attuned)',
	'Corrupted legs (attuned)',
	'Corrupted bow (attuned)',
	'Corrupted staff (attuned)',
	'Corrupted halberd (attuned)',

	'Corrupted helm (basic)',
	'Corrupted body (basic)',
	'Corrupted legs (basic)',
	'Corrupted bow (basic)',
	'Corrupted staff (basic)',
	'Corrupted halberd (basic)',

	'Crystal helm (perfected)',
	'Crystal body (perfected)',
	'Crystal legs (perfected)',
	'Crystal bow (perfected)',
	'Crystal staff (perfected)',
	'Crystal halberd (perfected)',

	'Crystal helm (attuned)',
	'Crystal body (attuned)',
	'Crystal legs (attuned)',
	'Crystal bow (attuned)',
	'Crystal staff (attuned)',
	'Crystal halberd (attuned)',

	'Crystal helm (basic)',
	'Crystal body (basic)',
	'Crystal legs (basic)',
	'Crystal bow (basic)',
	'Crystal staff (basic)',
	'Crystal halberd (basic)'
]);

const unobtainableEmirsArenaGear: number[] = [
	26674, // Slayer helmet (i)
	26675, // Black slayer helmet (i)
	26676, // Green slayer helmet (i)
	26677, // Red slayer helmet (i)
	26678, // Purple slayer helmet (i)
	26679, // Turquoise slayer helmet (i)
	26680, // Hydra slayer helmet (i)
	26681, // Twisted slayer helmet (i)
	26682, // Tztok slayer helmet (i)
	26683, // Vampyric slayer helmet (i)
	26684, // Tzkal slayer helmet (i)
	26685, // Granite ring (i)
	26763, // Salve amulet(i)
	26764, // Ring of the gods (i)
	26765, // Tyrannical ring (i)
	26766, // Treasonous ring (i)
	26767, // Seers ring (i)
	26768, // Archers ring (i)
	26769, // Warrior ring (i)
	26770, // Berserker ring (i)
	26782, // Salve amulet(ei)
	27086, // Rune pouch
	29822, // Araxyte slayer helmet (i)
	26686, // Maoma's med helm (broken)
	26687, // Maoma's full helm (broken)
	26688, // Maoma's great helm (broken)
	26689, // Calamity chest (broken)
	26690, // Superior calamity chest (broken)
	26691, // Elite calamity chest (broken)
	26692, // Calamity breeches (broken)
	26693, // Superior calamity breeches (broken)
	26694, // Elite calamity breeches (broken)
	26698, // Koriff's headband (broken)
	26699, // Koriff's cowl (broken)
	26700, // Koriff's coif (broken)
	26737, // Koriff's headband
	26738, // Koriff's headband (l)
	26739, // Koriff's cowl
	26740, // Koriff's cowl (l)
	26741, // Koriff's coif
	26742, // Koriff's coif (l)
	26743, // Maoma's med helm
	26744, // Maoma's med helm (l)
	26745, // Maoma's full helm
	26746, // Maoma's full helm (l)
	26747, // Maoma's great helm
	26748, // Maoma's great helm (l)
	26749, // Calamity chest
	26750, // Calamity chest (l)
	26751, // Superior calamity chest
	26752, // Superior calamity chest (l)
	26753, // Elite calamity chest
	26754, // Elite calamity chest (l)
	26755, // Calamity breeches
	26756, // Calamity breeches (l)
	26757, // Superior calamity breeches
	26758, // Superior calamity breeches (l)
	26759, // Elite calamity breeches
	26760, // Elite calamity breeches (l)
	27110, // Mithril gloves (wrapped)
	27111, // Rune gloves (wrapped)
	27112, // Barrows gloves (wrapped)
	26696, // Wristbands of the arena (broken)',
	26697, // Hardened wristbands of the arena (broken)',
	26723, // Wristbands of the arena',
	26724, // Wristbands of the arena (l)',
	26725, // Wristbands of the arena (c)',
	26726, // Wristbands of the arena (cl)',
	26727, // Wristbands of the arena (i)',
	26728, // Wristbands of the arena (il)',
	26729, // Wristbands of the arena (ic)',
	26730, // Wristbands of the arena (ilc)'
	26701, // Saika's hood (broken)
	26702, // Saika's veil (broken)
	26703, // Saika's shroud (broken)
	26731, // Saika's hood
	26732, // Saika's hood (l)
	26733, // Saika's veil
	26734, // Saika's veil (l)
	26735, // Saika's shroud
	26736 // Saika's shroud (l)
];

export const unobtainableLeaguesItems: number[] = Items.resolveItems([
	'Amulet of the monarchs',
	'The dogsword',
	'Drygore blowpipe',
	'Emperor ring',
	"Devil's element",
	"Nature's reprisal",
	'Gloves of the damned',
	'Crystal blessing',
	'Sunlight spear',
	'Sunlit bracers',
	'Thunder khopesh',
	'Thousand-dragon ward',
	'Crystal dagger (perfected)',
	"Nature's reprisal (uncharged)",
	"Corrupted tumeken's shadow",
	'Corrupted voidwaker',
	'Corrupted dragon claws',
	'Corrupted armadyl godsword',
	'Corrupted twisted bow',
	'Corrupted scythe of vitur',
	'Corrupted scythe of vitur (uncharged)',
	'Corrupted dark bow',
	'Corrupted volatile nightmare staff'
]);

const unobtainableBountyHunterGear: number[] = Items.resolveItems([
	27831, // Vesta's chainbody (bh)
	27832, // Vesta's plateskirt (bh)
	27833, // Statius's full helm (bh)
	27834, // Statius's platebody (bh)
	27835, // Statius's platelegs (bh)
	27836, // Morrigan's coif (bh)
	27837, // Morrigan's leather body (bh)
	27838, // Morrigan's leather chaps (bh)
	27839, // Zuriel's hood (bh)
	27840, // Zuriel's robe top (bh)
	27841, // Zuriel's robe bottom (bh)
	27842, // Corrupted vesta's chainbody (bh)
	27843, // Corrupted vesta's plateskirt (bh)
	27844, // Corrupted statius's full helm (bh)
	27845, // Corrupted statius's platebody (bh)
	27846, // Corrupted statius's platelegs (bh)
	27847, // Corrupted morrigan's coif (bh)
	27848, // Corrupted morrigan's leather body (bh)
	27849, // Corrupted morrigan's leather chaps (bh)
	27850, // Corrupted zuriel's hood (bh)
	27851, // Corrupted zuriel's robe top (bh)
	27852, // Corrupted zuriel's robe bottom (bh)
	27853, // Dark bow (bh)
	27855, // Barrelchest anchor (bh)
	27857, // Dragon mace (bh)
	27859, // Dragon longsword (bh)
	27861, // Abyssal dagger (bh)
	27863, // Abyssal dagger (bh)(p)
	27865, // Abyssal dagger (bh)(p+)
	27867, // Abyssal dagger (bh)(p++)
	27900, // Vesta's spear (bh)
	27902, // Vesta's spear (bh)(inactive)
	27904, // Vesta's longsword (bh)
	27906, // Vesta's longsword (bh)(inactive)
	27908, // Statius's warhammer (bh)
	27910, // Statius's warhammer (bh)(inactive)
	27912, // Morrigan's throwing axe (bh)
	27914, // Morrigan's throwing axe (bh)(inactive)
	27916, // Morrigan's javelin (bh)
	27918, // Morrigan's javelin (bh)(inactive)
	27920, // Zuriel's staff (bh)
	27922, // Zuriel's staff (bh)(inactive)
	27925, // Vesta's chainbody (bh)(inactive)
	27928, // Vesta's plateskirt (bh)(inactive)
	27931, // Statius's full helm (bh)(inactive)
	27934, // Statius's platebody (bh)(inactive)
	27937, // Statius's platelegs (bh)(inactive)
	27940, // Morrigan's coif (bh)(inactive)
	27943, // Morrigan's leather body (bh)(inactive)
	27946, // Morrigan's leather chaps (bh)(inactive)
	27949, // Zuriel's hood (bh)(inactive)
	27952, // Zuriel's robe top (bh)(inactive)
	27955, // Zuriel's robe bottom (bh)(inactive)
	27965, // Corrupted vesta's chainbody (bh)(inactive)
	27968, // Corrupted vesta's plateskirt (bh)(inactive)
	27971, // Corrupted statius's full helm (bh)(inactive)
	27974, // Corrupted statius's platebody (bh)(inactive)
	27977, // Corrupted statius's platelegs (bh)(inactive)
	27980, // Corrupted morrigan's coif (bh)(inactive)
	27983, // Corrupted morrigan's leather body (bh)(inactive)
	27986, // Corrupted morrigan's leather chaps (bh)(inactive)
	27989, // Corrupted zuriel's hood (bh)(inactive)
	27992, // Corrupted zuriel's robe top (bh)(inactive)
	27995 // Corrupted zuriel's robe bottom (bh)(inactive)
]);

const unobtainableDeadmanModeItems: number[] = [
	22616, // Vesta's chainbody
	22619, // Vesta's plateskirt
	22610, // Vesta's spear
	22613, // Vesta's longsword
	22622, // Statius's warhammer
	22625, // Statius's full helm
	22628, // Statius's platebody
	22631, // Statius's platelegs
	22634, // Morrigan's throwing axe
	22636, // Morrigan's javelin
	22638, // Morrigan's coif
	22641, // Morrigan's leather body
	22644, // Morrigan's leather chaps
	22647, // Zuriel's staff
	22650, // Zuriel's hood
	22653, // Zuriel's robe top
	22656 // Zuriel's robe bottom
];

export const unobtainableLockedItems: number[] = [
	24133, // Infernal max cape (l)
	24134, // Fire max cape (l)
	24135, // Assembler max cape (l)
	24136, // Bronze defender (l)
	24137, // Iron defender (l)
	24138, // Steel defender (l)
	24139, // Black defender (l)
	24140, // Mithril defender (l)
	24141, // Adamant defender (l)
	24142, // Rune defender (l)
	24143, // Dragon defender (l)
	24157, // Decorative sword (l)
	24158, // Decorative armour (l)
	24159, // Decorative armour (l)
	24160, // Decorative helm (l)
	24161, // Decorative shield (l)
	24162, // Decorative armour (l)
	24163, // Decorative armour (l)
	24164, // Decorative armour (l)
	24165, // Decorative armour (l)
	24166, // Decorative armour (l)
	24167, // Decorative armour (l)
	24168, // Decorative armour (l)
	24169, // Saradomin halo (l)
	24170, // Zamorak halo (l)
	24171, // Guthix halo (l)
	24172, // Healer hat (l)
	24173, // Fighter hat (l)
	24174, // Ranger hat (l)
	24175, // Fighter torso (l)
	24176, // Penance skirt (l)
	24177, // Void knight top (l)
	24178, // Elite void top (l)
	24179, // Void knight robe (l)
	24180, // Elite void robe (l)
	24181, // Void knight mace (l)
	24182, // Void knight gloves (l)
	24183, // Void mage helm (l)
	24184, // Void ranger helm (l)
	24185, // Void melee helm (l)
	24186, // Avernic defender (l)
	24194, // Armadyl halo (l)
	24197, // Bandos halo (l)
	24200, // Seren halo (l)
	24203, // Ancient halo (l)
	24206, // Brassica halo (l)
	24222, // Ava's assembler (l)
	24223, // Fire cape (l)
	24224, // Infernal cape (l)
	24232, // Imbued saradomin max cape (l)
	24233, // Imbued zamorak max cape (l)
	24234, // Imbued guthix max cape (l)
	24248, // Imbued saradomin cape (l)
	24249, // Imbued guthix cape (l)
	24250, // Imbued zamorak cape (l)
	24416, // Rune pouch (l)
	24533, // Runner hat (l)
	25173, // Decorative boots (l)
	25176, // Decorative full helm (l)
	25643, // Barronite mace (l)
	26722, // Centurion cuirass (l)
	26724, // Wristbands of the arena (l)
	26728, // Wristbands of the arena (il)
	26732, // Saika's hood (l)
	26734, // Saika's veil (l)
	26736, // Saika's shroud (l)
	26738, // Koriff's headband (l)
	26740, // Koriff's cowl (l)
	26742, // Koriff's coif (l)
	26744, // Maoma's med helm (l)
	26746, // Maoma's full helm (l)
	26748, // Maoma's great helm (l)
	26750, // Calamity chest (l)
	26752, // Superior calamity chest (l)
	26754, // Elite calamity chest (l)
	26756, // Calamity breeches (l)
	26758, // Superior calamity breeches (l)
	26760, // Elite calamity breeches (l)
	27000, // Void knight top (l)(or)
	27001, // Void knight robe (l)(or)
	27002, // Void knight gloves (l)(or)
	27003, // Elite void top (l)(or)
	27004, // Elite void robe (l)(or)
	27005, // Void mage helm (l)(or)
	27006, // Void ranger helm (l)(or)
	27007, // Void melee helm (l)(or)
	27008, // Dragon defender (l)(t)
	27009, // Rune defender (l)(t)
	27365, // Masori assembler max cape (l)
	27376, // Masori assembler (l)
	27509, // Divine rune pouch (l)
	27551, // Ghommal's avernic defender 5 (l)
	27553, // Ghommal's avernic defender 6 (l)
	27626, // Ancient sceptre (l)
	28069, // Fighter torso (l)(or)
	28473, // Blood ancient sceptre (l)
	28474, // Ice ancient sceptre (l)
	28475, // Smoke ancient sceptre (l)
	28476, // Shadow ancient sceptre (l)
	28906, // Dizana's max cape (l)
	28957 // Blessed dizana's quiver (l)
];

export const unobtainableLMSItems: number[] = [
	20389, // Dragon arrow
	20390, // Shark
	20393, // Prayer potion(4)
	20394, // Prayer potion(3)
	20395, // Prayer potion(2)
	20396, // Prayer potion(1)
	20397, // Spear
	20405, // Abyssal whip
	20406, // Dragon scimitar
	20407, // Dragon dagger
	20408, // Dark bow
	20422, // Rune platelegs
	20423, // Black d'hide body
	20424, // Black d'hide chaps
	20425, // Mystic robe top
	20426, // Mystic robe bottom
	20431, // Ancient staff
	20548, // Super energy(4)
	20549, // Super energy(3)
	20550, // Super energy(2)
	20551, // Super energy(1)
	20557, // Granite maul
	20576, // 3rd age robe top
	20577, // 3rd age robe
	20578, // Climbing boots
	20581, // Mithril gloves
	20582, // Adamant gloves
	20585, // Amulet of power
	20586, // Amulet of glory
	20587, // Rope
	20593, // Armadyl godsword
	20598, // Ahrim's robetop
	20599, // Ahrim's robeskirt
	20784, // Dragon claws
	21205, // Elder maul
	23533, // Cooked karambwan
	23543, // Super combat potion(4)
	23545, // Super combat potion(3)
	23547, // Super combat potion(2)
	23549, // Super combat potion(1)
	23551, // Ranging potion(4)
	23553, // Ranging potion(3)
	23555, // Ranging potion(2)
	23557, // Ranging potion(1)
	23559, // Sanfew serum(4)
	23561, // Sanfew serum(3)
	23563, // Sanfew serum(2)
	23565, // Sanfew serum(1)
	23567, // Super restore(4)
	23569, // Super restore(3)
	23571, // Super restore(2)
	23573, // Super restore(1)
	23575, // Saradomin brew(4)
	23577, // Saradomin brew(3)
	23579, // Saradomin brew(2)
	23581, // Saradomin brew(1)
	23583, // Stamina potion(4)
	23585, // Stamina potion(3)
	23587, // Stamina potion(2)
	23589, // Stamina potion(1)
	23591, // Helm of neitiznot
	23593, // Barrows gloves
	23595, // Berserker ring
	23597, // Dragon defender
	23599, // Spirit shield
	23601, // Rune crossbow
	23603, // Imbued guthix cape
	23605, // Imbued zamorak cape
	23607, // Imbued saradomin cape
	23611, // Armadyl crossbow
	23613, // Staff of the dead
	23615, // Vesta's longsword
	23617, // Zuriel's staff
	23619, // Morrigan's javelin
	23620, // Statius's warhammer
	23622, // Infernal cape
	23624, // Seers ring (i)
	23626, // Kodai wand
	23628, // Ghrazi rapier
	23630, // Heavy ballista
	23632, // Karil's leathertop
	23633, // Dharok's platelegs
	23634, // Torag's platelegs
	23635, // Verac's plateskirt
	23636, // Verac's helm
	23637, // Torag's helm
	23638, // Guthan's helm
	23639, // Dharok's helm
	23640, // Amulet of fury
	23642, // Blessed spirit shield
	23644, // Eternal boots
	23646, // Bandos tassets
	23648, // Dragon javelin
	23649, // Diamond bolts (e)
	23650, // Rune pouch
	23652, // Mage's book
	23653, // Ahrim's staff
	23654, // Occult necklace
	24534, // Mithril seeds
	25515, // Dharok's platebody
	25516, // Dharok's greataxe
	25517, // Volatile nightmare staff
	25518, // Ancestral hat
	27157, // Dragon knife
	27158, // Mystic robe top (dark)
	27159, // Mystic robe bottom (dark)
	27160, // Mystic robe top (light)
	27161, // Mystic robe bottom (light)
	27162, // Wizard boots
	27163, // Guthix halo
	27164, // Zamorak halo
	27165, // Saradomin halo
	27166, // Ghostly hood
	27167, // Ghostly robe
	27168, // Ghostly robe
	27169, // Berserker helm
	27170, // Infinity boots
	27171, // Tormented bracelet
	27172, // Necklace of anguish
	27173, // Amulet of torture
	27174, // Elder chaos top
	27175, // Elder chaos robe
	27176, // Elder chaos hood
	27177, // Fremennik kilt
	27178, // Spiked manacles
	27179, // Rangers' tunic
	27180, // Guthix chaps
	27181, // Zamorak chaps
	27182, // Saradomin chaps
	27183, // 3rd age mage hat
	27184, // Ancient godsword
	27185, // Rune defender
	27186, // Zaryte crossbow
	27188, // Light ballista
	27189, // Verac's flail
	27190, // Verac's brassard
	27191, // Unholy book
	27192, // Opal dragon bolts (e)
	27193, // Ancestral robe top
	27194, // Ancestral robe bottom
	27195, // Inquisitor's great helm
	27196, // Inquisitor's hauberk
	27197, // Inquisitor's plateskirt
	27198, // Inquisitor's mace
	27199, // 3rd age range top
	27200, // 3rd age range legs
	27201, // 3rd age range coif
	27869, // Voidwaker
	27870, // Lightbearer
	29840, // Eclipse moon chestplate
	29841, // Eclipse moon tassets
	29842, // Eclipse moon helm
	29843, // Blue moon chestplate
	29844, // Blue moon tassets
	29845, // Blue moon helm
	29846, // Blood moon chestplate
	29847, // Blood moon tassets
	29848, // Blood moon helm
	29849, // Blue moon spear
	29850, // Dual macuahuitl
	29851, // Eclipse atlatl
	29852 // Atlatl dart
];

const unobtainableBarrowsGear: number[] = [
	4856, // Ahrim's hood 100
	4859, // Ahrim's hood 25
	4858, // Ahrim's hood 50
	4857, // Ahrim's hood 75
	4874, // Ahrim's robeskirt 100
	4877, // Ahrim's robeskirt 25
	4876, // Ahrim's robeskirt 50
	4875, // Ahrim's robeskirt 75
	4868, // Ahrim's robetop 100
	4871, // Ahrim's robetop 25
	4870, // Ahrim's robetop 50
	4869, // Ahrim's robetop 75
	4862, // Ahrim's staff 100
	4865, // Ahrim's staff 25
	4864, // Ahrim's staff 50
	4863, // Ahrim's staff 75
	4886, // Dharok's greataxe 100
	4889, // Dharok's greataxe 25
	4888, // Dharok's greataxe 50
	4887, // Dharok's greataxe 75
	4880, // Dharok's helm 100
	4883, // Dharok's helm 25
	4882, // Dharok's helm 50
	4881, // Dharok's helm 75
	4892, // Dharok's platebody 100
	4895, // Dharok's platebody 25
	4894, // Dharok's platebody 50
	4893, // Dharok's platebody 75
	4898, // Dharok's platelegs 100
	4901, // Dharok's platelegs 25
	4900, // Dharok's platelegs 50
	4899, // Dharok's platelegs 75
	30519, // Echo ahrim's hood 100
	30537, // Echo ahrim's hood 25
	30531, // Echo ahrim's hood 50
	30525, // Echo ahrim's hood 75
	30523, // Echo ahrim's robeskirt 100
	30541, // Echo ahrim's robeskirt 25
	30535, // Echo ahrim's robeskirt 50
	30529, // Echo ahrim's robeskirt 75
	30521, // Echo ahrim's robetop 100
	30539, // Echo ahrim's robetop 25
	30533, // Echo ahrim's robetop 50
	30527, // Echo ahrim's robetop 75
	30570, // Echo ahrim's staff 100
	30573, // Echo ahrim's staff 25
	30572, // Echo ahrim's staff 50
	30571, // Echo ahrim's staff 75
	4922, // Guthan's chainskirt 100
	4925, // Guthan's chainskirt 25
	4924, // Guthan's chainskirt 50
	4923, // Guthan's chainskirt 75
	4904, // Guthan's helm 100
	4907, // Guthan's helm 25
	4906, // Guthan's helm 50
	4905, // Guthan's helm 75
	4916, // Guthan's platebody 100
	4919, // Guthan's platebody 25
	4918, // Guthan's platebody 50
	4917, // Guthan's platebody 75
	4910, // Guthan's warspear 100
	4913, // Guthan's warspear 25
	4912, // Guthan's warspear 50
	4911, // Guthan's warspear 75
	4928, // Karil's coif 100
	4931, // Karil's coif 25
	4930, // Karil's coif 50
	4929, // Karil's coif 75
	4934, // Karil's crossbow 100
	4937, // Karil's crossbow 25
	4936, // Karil's crossbow 50
	4935, // Karil's crossbow 75
	4946, // Karil's leatherskirt 100
	4949, // Karil's leatherskirt 25
	4948, // Karil's leatherskirt 50
	4947, // Karil's leatherskirt 75
	4940, // Karil's leathertop 100
	4943, // Karil's leathertop 25
	4942, // Karil's leathertop 50
	4941, // Karil's leathertop 75
	4988, // Verac's brassard 100
	4991, // Verac's brassard 25
	4990, // Verac's brassard 50
	4989, // Verac's brassard 75
	4982, // Verac's flail 100
	4985, // Verac's flail 25
	4984, // Verac's flail 50
	4983, // Verac's flail 75
	4976, // Verac's helm 100
	4979, // Verac's helm 25
	4978, // Verac's helm 50
	4977, // Verac's helm 75
	4994, // Verac's plateskirt 100
	4997, // Verac's plateskirt 25
	4996, // Verac's plateskirt 50
	4995, // Verac's plateskirt 75
	...Items.resolveItems([
		"Torag's hammers 100",
		"Torag's hammers 25",
		"Torag's hammers 50",
		"Torag's hammers 75",
		"Torag's helm 100",
		"Torag's helm 25",
		"Torag's helm 50",
		"Torag's helm 75",
		"Torag's platebody 100",
		"Torag's platebody 25",
		"Torag's platebody 50",
		"Torag's platebody 75",
		"Torag's platelegs 100",
		"Torag's platelegs 25",
		"Torag's platelegs 50",
		"Torag's platelegs 75"
	])
];

export const allUnobtainableItems: number[] = [
	...unobtainableGauntletGear,
	...unobtainableEmirsArenaGear,
	...unobtainableLeaguesItems,
	...unobtainableBountyHunterGear,
	...unobtainableDeadmanModeItems,
	...unobtainableLockedItems,
	...unobtainableLMSItems,
	...unobtainableBarrowsGear
];
