import { Bank, type Item, Items } from 'oldschooljs';

export const bsoArmorSetsSrc: { unpacked: Bank; packed: Item }[] = [
	{
		unpacked: new Bank().add('Clown hat').add('Clown shirt').add('Clown leggings').add('Clown feet'),
		packed: Items.getOrThrow('Clown set')
	},
	{
		unpacked: new Bank().add('Acrobat hood').add('Acrobat shirt').add('Acrobat pants').add('Acrobat shoes'),
		packed: Items.getOrThrow('Acrobat set')
	},
	{
		unpacked: new Bank()
			.add('Ringmaster hat')
			.add('Ringmaster shirt')
			.add('Ringmaster pants')
			.add('Ringmaster boots'),
		packed: Items.getOrThrow('Ringmaster set')
	},
	{
		unpacked: new Bank().add('Acrylic hood').add('Acrylic top').add('Acrylic bottom').add('Acrylic boots'),
		packed: Items.getOrThrow('Acrylic set')
	},
	{
		unpacked: new Bank()
			.add('Warpriest of Zamorak helm')
			.add('Warpriest of Zamorak cuirass')
			.add('Warpriest of Zamorak greaves')
			.add('Warpriest of Zamorak boots')
			.add('Warpriest of Zamorak gauntlets')
			.add('Warpriest of Zamorak cape'),
		packed: Items.getOrThrow('Warpriest of Zamorak set')
	},
	{
		unpacked: new Bank()
			.add('Warpriest of Saradomin helm')
			.add('Warpriest of Saradomin cuirass')
			.add('Warpriest of Saradomin greaves')
			.add('Warpriest of Saradomin boots')
			.add('Warpriest of Saradomin gauntlets')
			.add('Warpriest of Saradomin cape'),
		packed: Items.getOrThrow('Warpriest of Saradomin set')
	},
	{
		unpacked: new Bank()
			.add('Warpriest of Armadyl helm')
			.add('Warpriest of Armadyl cuirass')
			.add('Warpriest of Armadyl greaves')
			.add('Warpriest of Armadyl boots')
			.add('Warpriest of Armadyl gauntlets')
			.add('Warpriest of Armadyl cape'),
		packed: Items.getOrThrow('Warpriest of Armadyl set')
	},
	{
		unpacked: new Bank()
			.add('Warpriest of Bandos helm')
			.add('Warpriest of Bandos cuirass')
			.add('Warpriest of Bandos greaves')
			.add('Warpriest of Bandos boots')
			.add('Warpriest of Bandos gauntlets')
			.add('Warpriest of Bandos cape'),
		packed: Items.getOrThrow('Warpriest of Bandos set')
	},
	{
		unpacked: new Bank()
			.add('Dwarven full helm')
			.add('Dwarven platebody')
			.add('Dwarven platelegs')
			.add('Dwarven boots')
			.add('Dwarven gloves'),
		packed: Items.getOrThrow('Dwarven armour set')
	},
	{
		unpacked: new Bank().add('Drygore longsword').add('Offhand drygore longsword'),
		packed: Items.getOrThrow('Drygore longsword set')
	},
	{
		unpacked: new Bank().add('Drygore rapier').add('Offhand drygore rapier'),
		packed: Items.getOrThrow('Drygore rapier set')
	},
	{
		unpacked: new Bank().add('Drygore mace').add('Offhand drygore mace'),
		packed: Items.getOrThrow('Drygore mace set')
	},
	{
		unpacked: new Bank()
			.add('Torva full helm')
			.add('Torva platebody')
			.add('Torva platelegs')
			.add('Torva boots')
			.add('Torva gloves'),
		packed: Items.getOrThrow('Torva armour set')
	},
	{
		unpacked: new Bank()
			.add('Pernix cowl')
			.add('Pernix body')
			.add('Pernix chaps')
			.add('Pernix boots')
			.add('Pernix gloves'),
		packed: Items.getOrThrow('Pernix armour set')
	},
	{
		unpacked: new Bank()
			.add('Virtus mask')
			.add('Virtus robe top')
			.add('Virtus robe legs')
			.add('Virtus boots')
			.add('Virtus gloves'),
		packed: Items.getOrThrow('Virtus armour set')
	}
];
