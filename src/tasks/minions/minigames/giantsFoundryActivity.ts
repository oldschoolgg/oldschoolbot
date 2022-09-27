import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const giantsFoundryTask: MinionTask = {
	type: 'GiantsFoundry',
	async run(data: GiantsFoundryActivityTaskOptions) {
		const { quantity, userID, channelID, duration, metalScore, alloyName } = data;
		const user = await mUserFetch(userID);
		//		const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);
		//		const boosts = [];

		let reputationReceived = 0;
		let xpReceived = 0;
		for (let i = 0; i < quantity; i++) {
			let quality = Math.min(metalScore, 199);
			xpReceived += (Math.pow(quality, 2) / 73 + 1.5 * quality + 1) * 30;
			reputationReceived += quality;
		}
		xpReceived = Math.floor(xpReceived);
		reputationReceived = Math.floor(reputationReceived);

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});

		const currentUserReputation = user.user.foundry_reputation;

		await user.update({
			foundry_reputation: currentUserReputation + reputationReceived
		});

		await incrementMinigameScore(userID, 'giants_foundry', quantity);

		const loot = new Bank().add('Coins', 2 * xpReceived);

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
			['minigames', { giants_foundry: { start: { name: alloyName, quantity } } }, true],
			undefined,
			data,
			itemsAdded
		);
	}
};
