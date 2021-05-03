import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { getMinionName, incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { GnomeRestaurantActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const tipTable = new LootTable()
	.oneIn(210, 'Gnome scarf')
	.oneIn(210, 'Gnome goggles')
	.oneIn(50, 'Mint cake')
	.oneIn(50, 'Grand seed pod')
	.oneIn(230, 'Snake charm')
	.oneIn(50, 'Gnomeball')

	// Herbs
	.add('Toadflax', 3)
	.add('Snapdragon')
	.add('Goutweed')

	// Gems
	.add('Uncut sapphire', [6, 16], 4)
	.add('Uncut emerald', [3, 5], 2)
	.add('Uncut ruby', [2, 4], 2)
	.add('Uncut jade', [2, 3], 2)
	.add('Uncut opal', 3, 2)
	.add('Uncut red topaz', 2)
	.add('Uncut diamond')

	// Runes
	.add('Law rune', [7, 17], 2)
	.add('Nature rune', [9, 15], 2)
	.add('Chaos rune', [15, 27], 2)
	.add('Cosmic rune', [10, 19], 2)
	.add('Death rune', [7, 13], 2)
	.add('Blood rune', [6, 10], 2)
	.add('Soul rune', [5, 11])

	// Bolts
	.add('Mithril bolts', [16, 35])
	.add('Adamant bolts', [12, 26])
	.add('Runite bolts', [7, 15])

	// Other
	.add('Bird nest')
	.add('Raw oomlie')
	.add('Pure essence', [51, 97])
	.add('Loop half of key')
	.add('Tooth half of key')
	.add('Gold ore', [6, 11])
	.add('Coal', [12, 22])
	.add('Pineapple seed')
	.add('Yew seed')
	.add('Calquat tree seed')
	.add('Magic seed', [1, 3]);

export default class extends Task {
	async run(data: GnomeRestaurantActivityTaskOptions) {
		const { channelID, quantity, duration, userID, gloriesRemoved } = data;

		incrementMinigameScore(userID, 'GnomeRestaurant', quantity);

		const loot = new Bank();

		if (gloriesRemoved > 0) {
			loot.add('Amulet of glory', gloriesRemoved);
		}

		let totalXP = 0;
		for (let i = 0; i < quantity; i++) {
			totalXP += 1000;
			if (roll(5)) continue;
			loot.add(tipTable.roll());
		}

		const minionName = await getMinionName(userID);

		const user = await this.client.users.fetch(userID);
		await user.addItemsToBank(loot.bank, true);
		const xpRes = await user.addXP(SkillsEnum.Cooking, totalXP, duration);

		let str = `<@${userID}>, ${minionName} finished completing ${quantity}x Gnome Restaurant deliveries. You received **${loot}**. ${xpRes}`;

		await this.client.settings.update(
			ClientSettings.EconomyStats.GnomeRestaurantLootBank,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.GnomeRestaurantLootBank),
				loot.bank
			])
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued gnome restaurant`);
				return this.client.commands.get('gnomerestaurant')!.run(res, []);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
