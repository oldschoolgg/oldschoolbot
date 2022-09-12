import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { Planks } from '../../lib/minions/data/planks';
import { SkillsEnum } from '../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await this.client.fetchUser(userID);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});
		const boxChancePerPlank = Math.floor(100 - (Planks.indexOf(plank) + 1) * 8.5) * 5;
		let boxRolls = Math.floor(plankQuantity / 10);
		if (plank.name === 'Elder plank') boxRolls *= 2;
		for (let i = 0; i < boxRolls; i++) {
			if (roll(boxChancePerPlank)) {
				loot.add(MysteryBoxes.roll());
			}
		}

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}. You get ${boxRolls} rolls at a 1 in ${boxChancePerPlank} of a box.`;

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
