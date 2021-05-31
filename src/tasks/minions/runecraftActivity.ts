import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MIN_LENGTH_FOR_PET, Time } from '../../lib/constants';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID)!;

		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		const runeQuantity = essenceQuantity * quantityPerEssence;

		const xpReceived = essenceQuantity * rune.xp;

		const xpRes = await user.addXP(SkillsEnum.Runecraft, xpReceived, duration);

		let str = `${user}, ${user.minionName} finished crafting ${runeQuantity} ${rune.name}. ${xpRes}`;

		const loot = new Bank({
			[rune.id]: runeQuantity
		});

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (roll(Math.floor(5000 / minutes)) && !user.hasItemEquippedOrInBank('Obis')) {
				loot.add('Obis');
			}
		}

		if (roll((1_795_758 - user.skillLevel(SkillsEnum.Runecraft) * 25) / essenceQuantity)) {
			loot.add('Rift guardian');
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Runecraft} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while crafting ${
					rune.name
				}s at level ${user.skillLevel(SkillsEnum.Runecraft)} Runecrafting!`
			);
		}

		str += `\n\nYou received: ${loot}.`;

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${runeQuantity}x ${rune.name}[${rune.id}]`);
				return this.client.commands.get('rc')!.run(res, [essenceQuantity, rune.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
