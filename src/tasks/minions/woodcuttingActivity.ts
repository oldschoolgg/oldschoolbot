import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const log = Woodcutting.Logs.find(Log => Log.id === logID)!;

		const xpReceived = quantity * log.xp;

		const xpRes = await user.addXP(SkillsEnum.Woodcutting, xpReceived, duration);

		let loot = new Bank({
			[log.id]: quantity
		});

		// Add clue scrolls
		if (log.clueScrollChance) {
			loot.bank = addSkillingClueToLoot(
				user,
				SkillsEnum.Woodcutting,
				quantity,
				log.clueScrollChance,
				loot.bank
			);
		}

		let str = `${user}, ${user.minionName} finished woodcutting, you received ${loot}. ${xpRes}`;

		// Roll for pet
		if (
			log.petChance &&
			roll((log.petChance - user.skillLevel(SkillsEnum.Woodcutting) * 25) / quantity)
		) {
			loot.add('Beaver');
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Beaver while cutting ${log.name} at level ${user.skillLevel(
					SkillsEnum.Woodcutting
				)} Woodcutting!`
			);
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${log.name}[${log.id}]`);
				return this.client.commands.get('chop')!.run(res, [quantity, log.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
