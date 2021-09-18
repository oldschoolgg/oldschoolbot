import LootTable from 'oldschooljs/dist/structures/LootTable';

import { GemRockTable } from '../skilling/skills/mining';

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
	.add('Pure essence', [500, 800], 85)
	.add('Copper ore', [500, 800], 85)
	.add('Tin ore', [500, 800], 85)
	.add('Saltpetre', [400, 800], 85)
	.add('Iron ore', [400, 500], 80)
	.add('Silver ore', [400, 500], 80)
	.add('Volcanic ash', [400, 500], 80)
	.add('Coal', [300, 500], 70)
	.add('Gold ore', [300, 500], 70)
	.add(GemRockTable, [1, 3], 65)
	.add('Mithril ore', [300, 500], 55)
	.add('Adamantite ore', [50, 300], 55)
	.add('Runite ore', [20, 50], 45)
	.add('Amethyst', [20, 50], 45);

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
