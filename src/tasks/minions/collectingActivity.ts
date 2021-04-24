import { Time } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { collectables } from '../../commands/Minion/collect';
import { CollectingOptions } from '../../lib/types/minions';
import { skillsMeetRequirements } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

function hasMoryHard(user: KlasaUser) {
	return skillsMeetRequirements(user.rawSkills, {
		agility: 71,
		construction: 50,
		defence: 70,
		farming: 53,
		firemaking: 50,
		magic: 66,
		mining: 55,
		prayer: 70,
		woodcutting: 50,
		smithing: 50,
		thieving: 42
	});
}

export default class extends Task {
	async run(data: CollectingOptions) {
		let { collectableID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		const collectable = collectables.find(c => c.item.id === collectableID)!;
		let colQuantity = collectable.quantity;

		const moryHardBoost = collectable.item.name === 'Mort myre fungus' && hasMoryHard(user);
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
			str += `\n\n**Boosts:** 2x for Morytania Hard diary`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of collecting ${collectable.item.name}`);
				return this.client.commands
					.get('collect')!
					.run(res, [quantity, collectable.item.name]);
			},
			undefined,
			data,
			loot.bank ?? null
		);
	}
}
