import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const FemaleHamMemberTable = new LootTable()
	// Armour and weaponry
	.add('Bronze arrow', [1, 13], 1 / 33.33)
	.add('Bronze axe', 1, 1 / 33.33)
	.add('Bronze dagger', 1, 1 / 33.33)
	.add('Bronze pickaxe', 1, 1 / 33.33)
	.add('Iron axe', 1, 1 / 33.33)
	.add('Iron dagger', 1, 1 / 33.33)
	.add('Iron pickaxe', 1, 1 / 33.33)
	.add('Leather body', 1, 1 / 33.33)
	.add('Steel arrow', [1, 13], 1 / 50)
	.add('Steel axe', 1, 1 / 50)
	.add('Steel dagger', 1, 1 / 50)
	.add('Steel pickaxe', 1, 1 / 50)
	.add('Ham boots', 1, 1 / 100)
	.add('Ham cloak', 1, 1 / 100)
	.add('Ham gloves', 1, 1 / 100)
	.add('Ham hood', 1, 1 / 100)
	.add('Ham logo', 1, 1 / 100)
	.add('Ham robe', 1, 1 / 100)
	.add('Ham shirt', 1, 1 / 100)

	// Other
	.add('Coins', [1, 21], 1 / 6.667)
	.add('Buttons', 1, 1 / 25)
	.add('Damaged armour', 1, 1 / 25)
	.add('Rusty sword', 1, 1 / 25)
	.add('Feather', [1, 7], 1 / 33.33)
	.add('Logs', 1, 1 / 33.33)
	.add('Thread', [1, 10], 1 / 33.33)
	.add('Cowhide', 1, 1 / 33.33)
	.add('Knife', 1, 1 / 50)
	.add('Needle', 1, 1 / 50)
	.add('Raw anchovies', 1, 1 / 50)
	.add('Raw chicken', 1, 1 / 50)
	.add('Tinderbox', 1, 1 / 50)
	.add('Uncut opal', 1, 1 / 50)
	.add('Clue scroll (easy)', 1, 1 / 50)
	.add('Coal', 1, 1 / 50)
	.add('Iron ore', 1, 1 / 50)
	.add('Uncut jade', 1, 1 / 50)
	.add('Grimy guam leaf', 1, 1 / 91.67)
	.add('Grimy marrentill', 1, 1 / 183.3)
	.add('Grimy tarromin', 1, 1 / 275)
	.tertiary(257_211, 'Rocky');

export default new SimpleMonster({
	id: 2541,
	name: 'Female H.A.M. Member',
	pickpocketTable: FemaleHamMemberTable,
	aliases: ['ham member female', 'ham female', 'female h.a.m. member']
});
