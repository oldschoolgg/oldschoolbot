import { Time } from 'e';
import { Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { defaultImpTable, implings } from '../../../lib/implings';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { minionName } from '../../../lib/util/minionUtils';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, quantity, userID } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'puro_puro', quantity);

		const hunterLevel = user.skillLevel(SkillsEnum.Hunter);

		const impTable = new LootTable().oneIn(1, defaultImpTable);
		const minutes = Math.floor(data.duration / Time.Minute);

		if (minutes < 4) return null;

		const bank = new Bank();
		const missed = new Bank();

		for (let i = 0; i < minutes; i++) {
			const loot = impTable.roll();
			if (loot.length === 0) continue;
			const implingReceived = implings[loot.items()[0][0].id]!;
			if (hunterLevel < implingReceived.level) missed.add(loot);
			else bank.add(loot);
		}

		let str = `<@${userID}>, ${minionName(user)} finished hunting in Puro-Puro. You received **${bank}**.`;

		await user.addItemsToBank({ items: bank, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { puro_puro: { start: {} } }, true],
			undefined,
			data,
			bank
		);
	}
}
