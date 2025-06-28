import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const ApprenticePotionTable = new LootTable()
	.add('Attack potion(3)', [2, 4], 11)
	.add('Fishing potion(3)', [2, 4], 11)
	.add('Strength potion(3)', [2, 4], 10)
	.add('Restore potion(3)', [2, 4], 10)
	.add('Defence potion(3)', [2, 4], 7)
	.add('Super attack(3)', [2, 4], 6)
	.add('Antipoison(3)', [2, 4], 6)
	.add('Energy potion(3)', [2, 4], 5)
	.add('Superantipoison(3)', [2, 4], 5)
	.add('Agility potion(3)', [2, 4], 4)
	.add('Combat potion(3)', [2, 4], 4)
	.add('Super strength(3)', [2, 4], 3)
	.add('Hunter potion(3)', [2, 4], 2)
	.add('Prayer potion(3)', [2, 4], 1);

const ApprenticePotionPackTable = new LootTable().every(ApprenticePotionTable, 4);

export const ApprenticePotionPack = new SimpleOpenable({
	id: 29_971,
	name: 'Apprentice potion pack',
	aliases: ['apprentice potion pack'],
	table: ApprenticePotionPackTable
});

const AdeptPotionTable = new LootTable()
	.add('Restore potion(3)', [2, 3], 8)
	.add('Antipoison(3)', [2, 3], 7)
	.add('Combat potion(3)', [2, 3], 7)
	.add('Super attack(3)', [2, 3], 6)
	.add('Superantipoison(3)', [2, 3], 6)
	.add('Antifire potion(3)', [2, 3], 6)
	.add('Energy potion(3)', [2, 3], 4)
	.add('Hunter potion(3)', [2, 3], 4)
	.add('Agility potion(3)', [2, 3], 4)
	.add('Super energy(3)', [2, 3], 2)
	.add('Prayer potion(3)', [2, 3], 2)
	.add('Super defence(3)', [2, 3], 2)
	.add('Super strength(3)', [2, 3], 2)
	.add('Prayer regeneration potion(3)', [2, 3], 2);

const AdeptPotionPackTable = new LootTable().every(AdeptPotionTable, 4);

export const AdeptPotionPack = new SimpleOpenable({
	id: 29_972,
	name: 'Adept potion pack',
	aliases: ['adept potion pack'],
	table: AdeptPotionPackTable
});

const ExpertPotionTable = new LootTable()
	.add('Superantipoison(3)', [2, 4], 11)
	.add('Magic potion(3)', [2, 4], 11)
	.add('Super attack(3)', [2, 4], 10)
	.add('Zamorak brew(3)', [2, 4], 9)
	.add('Ranging potion(3)', [2, 4], 6)
	.add('Super defence(3)', [2, 4], 6)
	.add('Hunter potion(3)', [2, 4], 6)
	.add('Super strength(3)', [2, 4], 6)
	.add('Super energy(3)', [2, 4], 4)
	.add('Prayer regeneration potion(3)', [2, 4], 4)
	.add('Ancient brew(3)', [2, 4], 3)
	.add('Prayer potion(3)', [2, 4], 3)
	.add('Saradomin brew(3)', [2, 4], 2)
	.add('Super restore(3)', [2, 4], 2);

const ExpertPotionPackTable = new LootTable().every(ExpertPotionTable, 4);

export const ExpertPotionPack = new SimpleOpenable({
	id: 29_973,
	name: 'Expert potion pack',
	aliases: ['expert potion pack'],
	table: ExpertPotionPackTable
});
