import LootTable from '../../structures/LootTable';

export const PrayerPageTable = new LootTable()
	.add('Saradomin page 1')
	.add('Saradomin page 2')
	.add('Saradomin page 3')
	.add('Saradomin page 4')
	.add('Zamorak page 1')
	.add('Zamorak page 2')
	.add('Zamorak page 3')
	.add('Zamorak page 4')
	.add('Guthix page 1')
	.add('Guthix page 2')
	.add('Guthix page 3')
	.add('Guthix page 4')
	.add('Bandos page 1')
	.add('Bandos page 2')
	.add('Bandos page 3')
	.add('Bandos page 4')
	.add('Armadyl page 1')
	.add('Armadyl page 2')
	.add('Armadyl page 3')
	.add('Armadyl page 4')
	.add('Ancient page 1')
	.add('Ancient page 2')
	.add('Ancient page 3')
	.add('Ancient page 4');

export const GildedTable = new LootTable()
	.add('Gilded platebody')
	.add('Gilded platelegs')
	.add('Gilded plateskirt')
	.add('Gilded full helm')
	.add('Gilded kiteshield')
	.add('Gilded med helm')
	.add('Gilded chainbody')
	.add('Gilded sq shield')
	.add('Gilded 2h sword')
	.add('Gilded spear')
	.add('Gilded hasta');

export const FirelighterTable = new LootTable()
	.add('Red firelighter', [4, 10])
	.add('Green firelighter', [4, 10])
	.add('Blue firelighter', [4, 10])
	.add('Purple firelighter', [4, 10])
	.add('White firelighter', [4, 10]);

export const SubTeleportScrollTable = new LootTable()
	.add('Nardah teleport', [5, 15])
	.add("Mos le'harmless teleport", [5, 15])
	.add("Mort'ton teleport", [5, 15])
	.add('Feldip hills teleport', [5, 15])
	.add('Lunar isle teleport', [5, 15])
	.add('Digsite teleport', [5, 15])
	.add('Piscatoris teleport', [5, 15])
	.add('Pest control teleport', [5, 15])
	.add('Tai bwo wannai teleport', [5, 15])
	.add('Lumberyard teleport', [5, 15])
	.add('Charge dragonstone jewellery scroll', [5, 15])
	.add('Iorwerth camp teleport', [5, 15]);

export const TeleportScrollTable = new LootTable().add('Master scroll book (empty)').add(SubTeleportScrollTable, 1, 21);

export const GiveHalfKeyTable = new LootTable().add('Loop half of key').add('Tooth half of key');

export const BlessingTable = new LootTable()
	.add('Holy blessing')
	.add('Unholy blessing')
	.add('Peaceful blessing')
	.add('Honourable blessing')
	.add('War blessing')
	.add('Ancient blessing')
	.add('Coins', [10_000, 15_000], 7)
	.add('Purple sweets', [8, 12], 7);
