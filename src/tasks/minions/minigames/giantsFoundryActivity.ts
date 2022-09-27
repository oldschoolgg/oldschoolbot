import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const giantsFoundryTask: MinionTask = {
	type: 'GiantsFoundry',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		//	const userSkillingGear = user.gear.skilling;
		const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);
		let boost = 1;
		// Activity boosts

		const xpReceived = Math.round(userSmithingLevel * (quantity / Time.Minute) * 10 * boost);
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});

		const currentUserReputation = user.user.foundry_reputation;
		let reputationReceived = Math.round(xpReceived / 5.5);

		await user.update({
			foundry_reputation: currentUserReputation + reputationReceived
		});

		await incrementMinigameScore(userID, 'giants_foundry', quantity);

		const loot = new Bank().add('');

		let str = `${user}, ${
			user.minionName
		} finished creating ${quantity}x giant weapons in the Giants' Foundry minigame.\n${xpRes}${
			loot.length > 0 ? `\nYou received ${loot}` : ''
		}\nYou received **${reputationReceived.toLocaleString()}** Foundry Reputation.`;

		const { itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { giants_foundry: { start: { quantity } } }, true],
			undefined,
			data,
			itemsAdded
		);
	}
};
