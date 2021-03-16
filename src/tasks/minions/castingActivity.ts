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

		const spell = Castables.find(i => i.id === spellID)!;

		const xpReceived = quantity * spell.xp;
<<<<<<< Updated upstream
		const xpRes = await user.addXP(SkillsEnum.Magic, xpReceived, duration);
=======

		let craftXpReceived = 0;
		if (spell.craftXp) {
			craftXpReceived = spell.craftXp * quantity;

			await user.addXP(SkillsEnum.Crafting, craftXpReceived);
		}

		await user.addXP(SkillsEnum.Magic, xpReceived);
		const newMagicLevel = user.skillLevel(SkillsEnum.Magic);
		const newCraftingLevel = user.skillLevel(SkillsEnum.Crafting);
=======
		const xpReceived = quantity * spell.xp;
		const xpRes = await user.addXP(SkillsEnum.Magic, xpReceived, duration);
>>>>>>> 271107b42b555e15a839e61af4d4392f4dad42e4
>>>>>>> Stashed changes

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.addItemsToBank(loot.bank, true);
		}

		let str = `${user}, ${user.minionName} finished casting ${quantity}x ${
			spell.name
<<<<<<< Updated upstream
		}, you received ${loot ?? 'no items'}. ${xpRes}`;
=======
		}, you received ${xpReceived.toLocaleString()} Magic XP and ${loot ?? 'no items'}.`;

		if (newMagicLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Magic level is now ${newMagicLevel}!`;
		}

		if (newCraftingLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Magic level is now ${newCraftingLevel}!`;
		}
>>>>>>> Stashed changes

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
