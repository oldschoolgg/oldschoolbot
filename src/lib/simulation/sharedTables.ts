import { LootTable } from 'oldschooljs';
import { GemRockTable } from '../skilling/skills/mining';
import resolveItems from '../util/resolveItems';
import { SeedTable } from './seedTable';

export const allThirdAgeItems = resolveItems([
	'3rd age range coif',
	'3rd age range top',
	'3rd age range legs',
	'3rd age vambraces',
	'3rd age robe top',
	'3rd age robe',
	'3rd age mage hat',
	'3rd age amulet',
	'3rd age plateskirt',
	'3rd age platelegs',
	'3rd age platebody',
	'3rd age full helmet',
	'3rd age kiteshield',
	'Ring of 3rd age'
]);

export const Ahrims = new LootTable()
	.add("Ahrim's hood")
	.add("Ahrim's robetop")
	.add("Ahrim's robeskirt")
	.add("Ahrim's staff");

export const Dharoks = new LootTable()
	.add("Dharok's helm")
	.add("Dharok's platebody")
	.add("Dharok's platelegs")
	.add("Dharok's greataxe");

export const Guthans = new LootTable()
	.add("Guthan's helm")
	.add("Guthan's platebody")
	.add("Guthan's chainskirt")
	.add("Guthan's warspear");

export const Karils = new LootTable()
	.add("Karil's coif")
	.add("Karil's leathertop")
	.add("Karil's leatherskirt")
	.add("Karil's crossbow");

export const Torags = new LootTable()
	.add("Torag's helm")
	.add("Torag's platebody")
	.add("Torag's platelegs")
	.add("Torag's hammers");

export const Veracs = new LootTable()
	.add("Verac's helm")
	.add("Verac's brassard")
	.add("Verac's plateskirt")
	.add("Verac's flail");

export const AllBarrows = new LootTable().add(Veracs).add(Karils).add(Torags).add(Dharoks).add(Ahrims).add(Guthans);

export const DougTable = new LootTable()
	.add('Pure essence', [100, 400], 85)
	.add('Copper ore', [100, 400], 85)
	.add('Tin ore', [100, 200], 85)
	.add('Saltpetre', [100, 200], 85)
	.add('Iron ore', [50, 200], 80)
	.add('Silver ore', [100, 200], 80)
	.add('Volcanic ash', [30, 60], 80)
	.add('Coal', [100, 200], 70)
	.add('Gold ore', [30, 300], 70)
	.add(GemRockTable, 1, 65)
	.add('Mithril ore', [10, 70], 55)
	.add('Adamantite ore', [15, 50], 55)
	.add('Runite ore', [1, 20], 45)
	.add('Amethyst', [1, 15], 45);

export const runeAlchablesTable = new LootTable()
	.add('Rune platebody', [2, 5])
	.add('Rune med helm', [2, 5])
	.add('Rune full helm', [2, 5])
	.add('Rune platelegs', [2, 5])
	.add('Rune sq shield', [2, 5])
	.add('Rune kiteshield', [2, 5])
	.add('Rune chainbody', [2, 5])
	.add('Rune plateskirt', [2, 5])
	.add('Rune scimitar', [2, 5])
	.add('Rune axe', [2, 5])
	.add('Rune mace', [2, 5])
	.add('Rune sword', [2, 5])
	.add('Rune battleaxe', [2, 5])
	.add('Rune 2h sword', [2, 5]);

export const ExoticSeedsTable = new LootTable()
	.add('Mango seed', 1, 2)
	.add('Avocado seed', 1, 2)
	.add('Lychee seed', 1, 2)
	.add('Mysterious seed');

export const BattlestaffTable = new LootTable()
	.add('Battlestaff')
	.add('Air battlestaff')
	.add('Earth battlestaff')
	.add('Fire battlestaff')
	.add('Water battlestaff')
	.add('Lava battlestaff')
	.add('Steam battlestaff');

export const FletchingTipsTable = new LootTable()
	.add('Dragon dart tip')
	.add('Dragonstone bolt tips')
	.add('Onyx bolt tips')
	.add('Rune dart tip')
	.add('Dragon arrowtips')
	.add('Diamond bolt tips')
	.add('Emerald bolt tips')
	.add('Ruby bolt tips')
	.add('Dragonstone bolt tips')
	.add('Onyx bolt tips')
	.add('Sapphire bolt tips');

export const StaffOrbTable = new LootTable().add('Air orb').add('Earth orb').add('Fire orb').add('Water orb');

export const PekyTable = new LootTable().add(SeedTable).oneIn(5, 'Breadcrumbs').tertiary(500, 'Baby raven');

export const runeWeaponTable = new LootTable()
	.add('Rune dagger')
	.add('Rune sword')
	.add('Rune mace')
	.add('Rune longsword')
	.add('Rune scimitar')
	.add('Rune spear')
	.add('Rune warhammer')
	.add('Rune battleaxe')
	.add('Rune 2h sword')
	.add('Rune halberd');

export const lowRuneHighAdamantTable = new LootTable()
	.add('Adamant full helm')
	.add('Adamant platebody')
	.add('Adamant platelegs')
	.add('Adamant kiteshield')
	.add('Adamant plateskirt')
	.add('Adamant 2h sword')
	.add('Rune dagger')
	.add('Rune axe')
	.add('Rune spear')
	.add('Rune med helm')
	.add('Rune chainbody');

export const GrimyHerbTable = new LootTable()
	.add('Grimy guam leaf', [2, 5])
	.add('Grimy marrentill', [2, 5])
	.add('Grimy tarromin', [1, 5])
	.add('Grimy harralander', [1, 5])
	.add('Grimy ranarr weed', [1, 5])
	.add('Grimy irit leaf', [1, 5])
	.add('Grimy avantoe', [1, 5])
	.add('Grimy kwuarm', [1, 5])
	.add('Grimy cadantine', [1, 5])
	.add('Grimy dwarf weed', [1, 5])
	.add('Grimy torstol', [1, 5])
	.add('Grimy lantadyme', [1, 5])
	.add('Grimy toadflax', [1, 5])
	.add('Grimy snapdragon', [1, 3]);

export const ClueTable = new LootTable()
	.add('Clue scroll (beginner)', 1, 7)
	.add('Clue scroll (easy)', 1, 6)
	.add('Clue scroll (medium)', 1, 5)
	.add('Clue scroll (hard)', 1, 4)
	.add('Clue scroll (elite)', 1, 3)
	.add('Clue scroll (master)', 1, 2)
	.add('Clue scroll (grandmaster)', 1, 1);

export const StoneSpiritTable = new LootTable()
	.add('Copper stone spirit', 4, 2)
	.add('Tin stone spirit', 4, 2)
	.add('Iron stone spirit', 3, 2)
	.add('Coal stone spirit', 3, 2)
	.add('Silver stone spirit', 2, 2)
	.add('Mithril stone spirit')
	.add('Adamantite stone spirit')
	.add('Gold stone spirit')
	.add('Runite stone spirit');

export const HighTierStoneSpiritTable = new LootTable()
	.add('Mithril stone spirit', 4)
	.add('Adamantite stone spirit', 2)
	.add('Runite stone spirit', 1);

export const MithrilItemsTable = new LootTable()
	.add('Mithril dagger')
	.add('Mithril full helm')
	.add('Mithril chainbody')
	.add('Mithril scimitar')
	.add('Mithril claws')
	.add('Mithril mace')
	.add('Mithril spear');

export const CosmeticsTable = new LootTable()
	.oneIn(32, new LootTable().add('Monkey hat', 1, 2).add('Ring of cabbage', 1, 2).add('Sack of mystery boxes'))
	.add('Penguin head')
	.add('Penguin torso')
	.add('Penguin legs')
	.add('Penguin boots')
	.add('Penguin gloves')
	.add("Craftman's monocle")
	.add('Fish mask')
	.add('Turkey hat')
	.add('Potion hat')
	.add('Map hat')
	.add('Sombrero')
	.add('Leprechaun top hat')
	.add('Oriental fan')
	.add('White mask')
	.add(
		new LootTable()
			.add("Queen's guard hat")
			.add("Queen's guard trousers")
			.add("Queen's guard shoes")
			.add("Queen's guard shirt")
			.add("Queen's guard staff")
	)
	.add(new LootTable().add('Prisoner top').add('Prisoner legs'))
	.add(new LootTable().add('Fox ears').add('Fox tail'));

export const UncutGemTable = new LootTable()
	.add('Uncut sapphire', 50, 2)
	.add('Uncut opal', 70, 2)
	.add('Uncut jade', 60, 2)
	.add('Uncut emerald', 40, 2)
	.add('Uncut ruby', 35)
	.add('Uncut diamond', 25)
	.add('Uncut dragonstone', 15)
	.add('Uncut onyx', 2)
	.add('Uncut zenyte', 1);
