import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MorytaniaDiary, userhasDiaryTier } from '../../lib/diaries';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { CollectingOptions } from '../../lib/types/minions';
import { updateBankSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { collectables } from '../../mahoji/lib/abstracted_commands/collectCommand';

export default class extends Task {
	async run(data: CollectingOptions) {
		let { collectableID, quantity, userID, channelID, duration, noStaminas } = data;
		const user = await this.client.fetchUser(userID);
		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const [hasMoryHard] = await userhasDiaryTier(user, MorytaniaDiary.hard);
		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard;
		if (moryHardBoost) {
			colQuantity *= 2;
		}
		const totalQuantity = quantity * colQuantity;
		const loot = new Bank().add(collectable.item.id, totalQuantity);
		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished collecting ${totalQuantity}x ${
			collectable.item.name
		}. (${Math.round((totalQuantity / (duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
		if (moryHardBoost) {
			str += '\n\n**Boosts:** 2x for Morytania Hard diary';
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.CollectingLoot, loot);

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { collect: { item: collectable.item.name, no_stams: noStaminas, quantity } }],
			undefined,
			data,
			loot ?? null
		);
	}
}
