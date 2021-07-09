import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { collectables } from '../../commands/Minion/collect';
import { MorytaniaDiary, userhasDiaryTier } from '../../lib/diaries';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { CollectingOptions } from '../../lib/types/minions';
import { addBanks } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CollectingOptions) {
		let { collectableID, quantity, userID, channelID, duration, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);
		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const [hasMoryHard] = await userhasDiaryTier(user, MorytaniaDiary.hard);
		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard;
		if (moryHardBoost) {
			colQuantity *= 2;
		}
		const totalQuantity = quantity * colQuantity;
		const loot = new Bank().add(collectable.item.id, totalQuantity);
		await user.addItemsToBank(loot.bank, true);

		let str = `${user}, ${user.minionName} finished collecting ${totalQuantity}x ${
			collectable.item.name
		}. (${Math.round((totalQuantity / (duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
		if (moryHardBoost) {
			str += '\n\n**Boosts:** 2x for Morytania Hard diary';
		}

		await this.client.settings.update(
			ClientSettings.EconomyStats.CollectingLoot,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.CollectingLoot), loot.bank])
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of collecting ${collectable.item.name}`);
				return this.client.commands
					.get('collect')!
					.run(res, [quantitySpecified ? quantity : null, collectable.item.name]);
			},
			undefined,
			data,
			loot.bank ?? null
		);
	}
}
