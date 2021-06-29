import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { itemID } from 'oldschooljs/dist/util';

import { requiresMinion } from '../../lib/minions/decorators';
import { defaultFarmingContract } from '../../lib/minions/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { bankHasItem, rand, roll } from '../../lib/util';

const LowSeedPackTable = new LootTable()
	.add('Potato seed', [8, 12], 2)
	.add('Onion seed', [8, 12], 2)
	.add('Cabbage seed', [8, 12], 2)
	.add('Tomato seed', [8, 12], 2)
	.add('Sweetcorn seed', [8, 12], 2)
	.add('Strawberry seed', [8, 12], 2)
	.add('Barley seed', [8, 14], 2)
	.add('Hammerstone seed', [6, 8], 2)
	.add('Asgarnian seed', [6, 8], 2)
	.add('Jute seed', [8, 12], 2)
	.add('Yanillian seed', [6, 8], 2)
	.add('Krandorian seed', [6, 8], 2)
	.add('Acorn', [3, 5], 2)
	.add('Apple tree seed', [3, 5], 2)
	.add('Banana tree seed', [3, 5], 2)
	.add('Orange tree seed', [3, 5], 2)
	.add('Curry tree seed', [3, 5], 2)
	.add('Redberry seed', [6, 8], 2)
	.add('Cadavaberry seed', [6, 8], 2)
	.add('Dwellberry seed', [6, 8], 2)
	.add('Jangerberry seed', [6, 8], 2)
	.add('Marigold seed', [8, 12], 2)
	.add('Rosemary seed', [8, 12], 2)
	.add('Nasturtium seed', [8, 12], 2)
	.add('Woad seed', [8, 12], 2)
	.add('Guam seed', [3, 5], 2)
	.add('Marrentill seed', [3, 5], 2)
	.add('Tarromin seed', [3, 5], 2)
	.add('Harralander seed', [3, 5], 2)
	.add('Mushroom spore', [4, 6], 1)
	.add('Belladonna seed', [4, 6], 1);

const MediumSeedPackTable = new LootTable()
	.add('Irit seed', [2, 6], 3)
	.add('Limpwurt seed', [4, 8], 3)
	.add('Watermelon seed', [8, 12], 2)
	.add('Snape grass seed', [6, 8], 2)
	.add('Wildblood seed', [8, 12], 2)
	.add('Whiteberry seed', [6, 8], 2)
	.add('Poison ivy seed', [6, 8], 2)
	.add('Cactus seed', [2, 6], 2)
	.add('Potato cactus seed', [2, 6], 2)
	.add('Willow seed', [2, 4], 1)
	.add('Pineapple seed', [3, 5], 1)
	.add('Toadflax seed', [1, 3], 1)
	.add('Avantoe seed', [1, 3], 1)
	.add('Kwuarm seed', [1, 3], 1)
	.add('Cadantine seed', [1, 3], 1)
	.add('Lantadyme seed', [1, 3], 1)
	.add('Dwarf weed seed', [1, 3], 1)
	.add('Calquat tree seed', [3, 6], 1)
	.add('Teak seed', [1, 3], 1);

const HighSeedPackTable = new LootTable()
	.add('Papaya tree seed', [1, 3], 5)
	.add('Palm tree seed', [1, 2], 5)
	.add('Hespori seed', 1, 5)
	.add('Ranarr seed', [1, 2], 4)
	.add('Snapdragon seed', 1, 4)
	.add('Maple seed', [1, 2], 4)
	.add('Mahogany seed', [1, 2], 4)
	.add('Yew seed', 1, 3)
	.add('Dragonfruit tree seed', 1, 3)
	.add('Celastrus seed', 1, 2)
	.add('Torstol seed', 1, 2)
	.add('Magic seed', 1, 1)
	.add('Spirit seed', 1, 1)
	.add('Redwood tree seed', 1, 1);

function openSeedPack(seedTier: number): ItemBank {
	const loot = new Bank();

	const tempTable = new LootTable();

	// Roll amount variables
	let high = 0;
	let medium = 0;
	let low = 0;

	switch (seedTier) {
		case 1: {
			high = 0;
			medium = rand(1, 3);
			low = 6 - medium;
			break;
		}
		case 2: {
			if (roll(11)) {
				high = 1;
			}
			medium = rand(2, 3);
			low = 7 - medium - high;
			break;
		}
		case 3: {
			high = rand(0, 1);
			medium = rand(2, 4);
			low = 8 - medium - high;
			break;
		}
		case 4: {
			high = rand(1, 2);
			medium = rand(3, 5);
			low = 9 - medium - high;
			break;
		}
		case 5: {
			high = rand(1, 3);
			medium = rand(4, 6);
			low = 10 - medium - high;
			break;
		}
	}

	// Low seed roll
	tempTable.every(LowSeedPackTable, low);
	// Medium seed roll
	tempTable.every(MediumSeedPackTable, medium);
	// High seed roll
	tempTable.every(HighSeedPackTable, high);

	loot.add(tempTable.roll());

	return loot.values();
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['sp'],
			usage: ' ',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Opens seed packs.',
			examples: ['+seedpack']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const { plantTier } = msg.author.settings.get(UserSettings.Minion.FarmingContract) ?? defaultFarmingContract;
		const loot = new Bank();

		if (bankHasItem(userBank, itemID('Seed pack'), 1)) {
			loot.add(openSeedPack(plantTier));
		} else {
			return msg.channel.send('You have no seed packs to open!');
		}

		await msg.author.exchangeItemsFromBank({
			costBank: { [itemID('Seed pack')]: 1 },
			lootBank: loot.bank,
			collectionLog: true
		});

		return msg.channel.send(`You opened a seed pack and received: ${loot}.`);
	}
}
