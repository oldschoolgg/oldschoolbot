import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const InfernalMagePreTable = new LootTable()
	/* Weapons and armour */
	.oneIn(512, 'Mystic boots (dark)')
	.oneIn(512, 'Mystic hat (dark)')

	/* Staves */
	.add('Staff', 1, 8)
	.add('Staff of fire', 1, 1)
	.oneIn(1000, 'Lava battlestaff')

	/* Elemental runes */
	.add('Earth rune', 10, 6)
	.add('Fire rune', 10, 6)
	.add('Earth rune', 36, 4)
	.add('Air rune', 10, 3)
	.add('Water rune', 10, 3)
	.add('Air rune', 18, 2)
	.add('Water rune', 18, 2)
	.add('Earth rune', 18, 2)
	.add('Fire rune', 18, 2)

	/* Catalystic runes */
	.add('Death rune', 7, 18)
	.add('Mind rune', 18, 2)
	.add('Body rune', 18, 2)
	.add('Blood rune', 4, 2)

	/* Coins */
	.add('Coins', 1, 19)
	.add('Coins', 2, 14)
	.add('Coins', 4, 8)
	.add('Coins', 29, 3);

const InfernalMageTable = new LootTable().every('Bones').every(InfernalMagePreTable);

export default new SimpleMonster({
	id: 447,
	name: 'Infernal Mage',
	table: InfernalMageTable,
	aliases: ['infernal mage']
});
