import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Planks } from '../../lib/minions/data/planks';
import { SkillsEnum } from '../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		if (
			user.hasItemEquippedAnywhere('Iron dagger') &&
			user.hasItemEquippedAnywhere('Bronze arrow') &&
			user.hasItemEquippedAnywhere('Iron med helm') &&
			user.getAttackStyles().includes(SkillsEnum.Strength) &&
			!user.hasItemEquippedOrInBank('Helm of raedwald')
		) {
			loot.add('Helm of raedwald');
			str +=
				"\n\nWhile on the way to the sawmill, a helmet falls out of a tree onto the ground infront of you... **You've found the Helm of Raedwald!**";
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${plankQuantity}x ${plank.name}`);
				return this.client.commands
					.get('sawmill')!
					.run(res, [quantitySpecified ? plankQuantity : null, plank.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
