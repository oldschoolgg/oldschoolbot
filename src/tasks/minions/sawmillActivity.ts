import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Planks } from '../../lib/minions/data/planks';
import { SkillsEnum } from '../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { mUserFetch } from '../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await mUserFetch(userID);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		if (
			user.hasEquipped(['Iron dagger', 'Bronze arrow', 'Iron med helm']) &&
			user.getAttackStyles().includes(SkillsEnum.Strength) &&
			!user.hasEquippedOrInBank(['Helm of raedwald'])
		) {
			loot.add('Helm of raedwald');
			str +=
				"\n\nWhile on the way to the sawmill, a helmet falls out of a tree onto the ground infront of you... **You've found the Helm of Raedwald!**";
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { sawmill: { quantity: plankQuantity, type: plank.name } }, true],
			undefined,
			data,
			loot
		);
	}
}
