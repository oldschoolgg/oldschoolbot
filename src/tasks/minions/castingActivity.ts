import { Task } from 'klasa';

import { Castables } from '../../lib/skilling/skills/magic/index';
import { SkillsEnum } from '../../lib/skilling/types';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CastingActivityTaskOptions) {
		let { spellID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const spell = Castables.find(i => i.name === spellID)!;

		let xpRes = '';
		for (const [skill, xp] of Object.entries(spell.xp)) {
			if (xpRes !== '') xpRes += ', ';
			xpRes += await user.addXP({
				skillName: skill.toLowerCase() as SkillsEnum,
				amount: quantity * xp,
				duration
			});
		}

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.addItemsToBank(loot, true);
		}

		let str = `${user}, ${user.minionName} finished casting ${quantity}x ${spell.name}, you received ${
			loot ?? 'no items'
		}. ${xpRes}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['cast', [quantity, spell.name], true],
			undefined,
			data,
			loot ?? null
		);
	}
}
