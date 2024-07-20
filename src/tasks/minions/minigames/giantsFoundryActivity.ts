import { deepClone } from 'e';
import { Bank } from 'oldschooljs';

import type { GiantsFoundryBank } from '../../../lib/giantsFoundry';
import { encodeGiantWeapons, generateRandomGiantWeapon, giantWeaponName } from '../../../lib/giantsFoundry';
import { trackLoot } from '../../../lib/lootTrack';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { GiantsFoundryActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../../mahoji/mahojiSettings';

export const giantsFoundryTask: MinionTask = {
	type: 'GiantsFoundry',
	async run(data: GiantsFoundryActivityTaskOptions) {
		const { quantity, userID, channelID, duration, metalScore } = data;
		const user = await mUserFetch(userID);
		const userSmithingLevel = user.skillLevel(SkillsEnum.Smithing);
		const boosts = [];
		let avgMouldBonus = 37.667;
		if (userSmithingLevel > 79) {
			avgMouldBonus = 58.25;
			boosts.push(`${avgMouldBonus} average mould score for 80+ Smithing`);
		}
		let reputationReceived = 0;
		let xpReceived = 0;
		let weaponName = '';
		let highestQuality = 0;
		let highestQualitySword = '';
		const currentStats = await user.fetchStats({ gf_weapons_made: true });
		const newWeapons = deepClone(currentStats.gf_weapons_made) as GiantsFoundryBank;

		for (let i = 0; i < quantity; i++) {
			const quality = Math.min(Math.floor(randomVariation(metalScore - 5 + avgMouldBonus, 10)), 199);
			xpReceived += (Math.pow(quality, 2) / 73 + 1.5 * quality + 1) * 30;
			reputationReceived += quality;

			const weapon = generateRandomGiantWeapon();
			const weaponID = encodeGiantWeapons(weapon);
			weaponName = giantWeaponName(weapon);
			newWeapons[weaponID] = newWeapons[weaponID] ? newWeapons[weaponID]++ : 1;
			// Determine best sword of session:
			if (quality > highestQuality) {
				highestQuality = quality;
				highestQualitySword = weaponName;
			}
		}
		xpReceived = Math.floor(xpReceived);
		reputationReceived = Math.floor(reputationReceived);

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});

		await userStatsUpdate(
			user.id,
			{
				foundry_reputation: {
					increment: reputationReceived
				},
				gf_weapons_made: newWeapons
			},
			{}
		);

		await incrementMinigameScore(userID, 'giants_foundry', quantity);

		const loot = new Bank().add('Coins', 2 * xpReceived);

		const str = `${user}, ${
			user.minionName
		} finished creating ${quantity}x giant weapons in the Giants' Foundry minigame. ${
			boosts.length > 0 ? `**Boosts:** ${boosts.join(', ')}.` : ''
		}\n${xpRes}\nKovac gave you **${reputationReceived.toLocaleString()}** Foundry Reputation ${
			loot.length > 0 ? `and ${loot}.` : ''
		}\nThe most prestigious weapon created by your minion was a **${highestQualitySword}** with a score of **${highestQuality}**.`;

		const { itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		updateBankSetting('gf_loot', loot);
		await trackLoot({
			id: 'giants_foundry',
			type: 'Minigame',
			duration,
			kc: quantity,
			totalLoot: loot,
			changeType: 'loot',
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});
		await userStatsBankUpdate(user, 'gf_loot', loot);

		handleTripFinish(user, channelID, str, undefined, data, itemsAdded);
	}
};
