import { Task } from 'klasa';

import { Castables } from '../../lib/skilling/skills/magic/castables';
import { SkillsEnum } from '../../lib/skilling/types';
import { CastingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CastingActivityTaskOptions) {
		let { spellID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const spell = Castables.find(i => i.id === spellID);
		if (!spell) return;

		const currentLevel = user.skillLevel(SkillsEnum.Magic);
		const xpReceived = quantity * spell.xp;
		await user.addXP(SkillsEnum.Magic, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Magic);

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.addItemsToBank(loot.bank, true);
		}

		let str = `${user}, ${user.minionName} finished casting ${quantity}x ${
			spell.name
		}, you received ${xpReceived.toLocaleString()} Magic XP and ${loot ?? 'no items'}.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Magic level is now ${newLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${spell.name}[${spell.id}]`);
				return this.client.commands.get('cast')!.run(res, [quantity, spell.name]);
			},
			undefined,
			data,
			loot?.bank ?? null
		);
	}
}
