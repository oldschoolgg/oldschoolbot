import { increaseNumByPercent } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { SkillsEnum } from '../../lib/skilling/types';
import { DarkAltarOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: DarkAltarOptions) {
		const { quantity, userID, channelID, duration, hasElite } = data;
		const user = await this.client.users.fetch(userID);

		const [xpRes1, xpRes2, xpRes3] = await Promise.all([
			user.addXP({
				skillName: SkillsEnum.Runecraft,
				amount: quantity * 7.7,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: quantity * 1.7,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Mining,
				amount: quantity * 2.7,
				duration
			})
		]);

		let runeQuantity = quantity;
		if (hasElite) {
			runeQuantity = Math.floor(increaseNumByPercent(runeQuantity, 10));
		}
		let loot = new Bank().add('Blood rune', runeQuantity);

		let str = `${user}, ${user.minionName} finished runecrafing at the Dark altar, you received ${loot}. ${xpRes1} ${xpRes2} ${xpRes3}`;

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of dark altar');
				return this.client.commands.get('darkaltar')!.run(res, []);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
