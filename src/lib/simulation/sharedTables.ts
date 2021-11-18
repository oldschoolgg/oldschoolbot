import LootTable from 'oldschooljs/dist/structures/LootTable';

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
	.add('Mango seed')
	.add('Avocado seed')
	.add('Lychee seed')
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
