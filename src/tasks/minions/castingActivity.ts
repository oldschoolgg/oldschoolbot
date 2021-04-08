import { Task } from 'klasa';

// import craft from '../../commands/Minion/craft';
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
		const xpRes = await user.addXP(SkillsEnum.Magic, xpReceived, duration);

		let craftXpReceived = 0;
		let craftXpRes = ``;
		if (spell.craftXp) {
			craftXpReceived = spell.craftXp * quantity;

			craftXpRes = await user.addXP(SkillsEnum.Crafting, craftXpReceived, duration);
		}

		// let craftXpRes = ``;
		// const craftXpReceived = await user.addXP(SkillsEnum.Crafting, craftXpReceived, duration);

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.addItemsToBank(loot.bank, true);
		}

		let str = `${user}, ${user.minionName} finished casting ${quantity}x ${
			spell.name
		}, you received ${loot ?? 'no items'}. ${xpRes} ${craftXpRes}`;

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
