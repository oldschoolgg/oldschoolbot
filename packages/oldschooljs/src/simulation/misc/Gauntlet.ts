import LootTable from '../../structures/LootTable';

const DiedTable = new LootTable()
	.add('Adamant dagger')
	.add('Adamant full helm')
	.add('Adamant mace', [2, 3])
	.add('Adamant pickaxe')
	.add('Adamant platebody')
	.add('Adamant platelegs')
	.add('Adamant plateskirt')
	.add('Adamant scimitar')
	.add('Maple longbow', [7, 13])
	.add('Maple shortbow', [8, 11])
	.add('Mithril full helm')
	.add('Mithril mace', [2, 5])
	.add('Mithril platebody')
	.add('Mithril platelegs')
	.add('Mithril plateskirt')
	.add('Air rune', [200, 300])
	.add('Body rune', [250, 350])
	.add('Earth rune', [200, 300])
	.add('Fire rune', [200, 300])
	.add('Mind rune', [300, 400])
	.add('Water rune', [200, 300])
	.add('Cake', [10, 20])
	.add('Cod', [75, 125])
	.add('Trout', [50, 100])
	.add('Eye of newt', [300, 500])
	.add('Silver bar', [15, 30])
	.add('Uncut sapphire', [1, 3]);

const StandardInnerTable = new LootTable()
	// Gear
	.add('Rune full helm', [2, 4])
	.add('Rune chainbody', [1, 2])
	.add('Rune platebody', [1, 2])
	.add('Rune platelegs', [1, 2])
	.add('Rune plateskirt', [1, 2])
	.add('Rune halberd', [1, 2])
	.add('Rune pickaxe', [1, 2])
	.add('Dragon halberd')

	// Runes
	.add('Cosmic rune', [160, 240])
	.add('Nature rune', [100, 140])
	.add('Law rune', [80, 140])
	.add('Chaos rune', [180, 300])
	.add('Death rune', [100, 160])
	.add('Blood rune', [80, 140])

	// Arrows
	.add('Mithril arrow', [800, 1200])
	.add('Adamant arrow', [400, 600])
	.add('Rune arrow', [200, 300])
	.add('Dragon arrow', [30, 80])

	// Other
	.add('Battlestaff', [4, 8])
	.add('Coins', [20_000, 80_000]);

const StandardTable = new LootTable()
	.every('Crystal shard', [3, 7])
	.every(StandardInnerTable, 2)
	.tertiary(25, 'Clue scroll (elite)')
	.tertiary(120, 'Crystal weapon seed')
	.tertiary(120, 'Crystal armour seed')
	.tertiary(2000, 'Enhanced crystal weapon seed')
	.tertiary(2000, 'Youngllef');

const CorruptedInnerTable = new LootTable()
	// Gear
	.add('Rune full helm', [3, 5])
	.add('Rune chainbody', [2, 3])
	.add('Rune platebody', 2)
	.add('Rune platelegs', [2, 3])
	.add('Rune plateskirt', [2, 3])
	.add('Rune halberd', [2, 3])
	.add('Rune pickaxe', [2, 3])
	.add('Dragon halberd', [1, 2])

	// Runes
	.add('Cosmic rune', [175, 250])
	.add('Nature rune', [120, 150])
	.add('Law rune', [100, 150])
	.add('Chaos rune', [200, 350])
	.add('Death rune', [120, 175])
	.add('Blood rune', [100, 150])

	// Arrows
	.add('Mithril arrow', [1000, 1500])
	.add('Adamant arrow', [500, 725])
	.add('Rune arrow', [250, 450])
	.add('Dragon arrow', [50, 100])

	// Gems
	.add('Uncut sapphire', [25, 65])
	.add('Uncut emerald', [15, 60])
	.add('Uncut ruby', [10, 40])
	.add('Uncut diamond', [5, 15])

	// Other
	.add('Battlestaff', [8, 12])
	.add('Coins', [75_000, 150_000]);

const CorruptedTable = new LootTable()
	// Gauntlet cape is given manually in OSB
	.every('Crystal shard', [5, 9])
	.every(CorruptedInnerTable, 3)
	.tertiary(20, 'Clue scroll (elite)')
	.tertiary(50, 'Crystal weapon seed')
	.tertiary(50, 'Crystal armour seed')
	.tertiary(400, 'Enhanced crystal weapon seed')
	.tertiary(800, 'Youngllef');

interface NormalGauntletOptions {
	died: boolean;
	type: 'normal' | 'corrupted';
}

export function Gauntlet({ died, type }: NormalGauntletOptions) {
	const loot = died ? DiedTable.roll() : type === 'normal' ? StandardTable.roll() : CorruptedTable.roll();
	return loot;
}
