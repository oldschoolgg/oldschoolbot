import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import Pickpocketables from '../../lib/skilling/skills/thieving/pickpocketables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ monsterID, quantity, userID, channelID, duration }: PickpocketActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID);
		if (!npc) {
			this.client.wtf(new Error(`Missing pickpocket monster with ID ${monsterID}.`));
			return;
		}

		const xpReceived = quantity * npc.xp;
		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished pickpocketing a ${
			npc.name
		} ${quantity}x times, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Thieving level is now ${newLevel}!`;
		}

		for (let i = 0; i < quantity; i++) {}

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(npc.table.roll());
		}
		if (user.username === 'thievious') {
			loot.add('Rocky');
		}
		await user.addItemsToBank(loot.values(), true);

		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.`;

		if (loot.amount('Rocky') > 0) {
			str += `\nYou have a funny feeling you're being followed...`;
		}

		str += `\n**${(
			((quantity * npc.xp) / (duration / Time.Minute)) *
			60
		).toLocaleString()} XP/Hr**`;

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of ${quantity}x ${npc.name}[${npc.id}]`);
			return this.client.commands.get('pickpocket')!.run(res, [quantity, npc.name]);
		});
	}
}
