import { Monsters } from 'oldschooljs';

import { resolveAttackStyles } from '../../../lib/minions/functions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { NightmareZoneActivityTaskOptions } from './../../../lib/types/minions';

export const nightmareZoneTask: MinionTask = {
	type: 'NightmareZone',
	async run(data: NightmareZoneActivityTaskOptions) {
		const { quantity, userID, channelID, duration, stratergy } = data;
		const user = await mUserFetch(userID);

		const [, , attackStyles] = resolveAttackStyles(user, { monsterID: Monsters.Cow.id });

		const monsterHP = 230;
		const monsterPoints = 3500;
		const totalXP = (stratergy === 'experience' ? 1.5 : 1) * monsterHP * 4 * quantity;
		const pointsReceived = Math.floor((stratergy === 'points' ? 4 : 0.8) * monsterPoints * quantity);
		const xpPerSkill = totalXP / attackStyles.length;

		let res: string[] = [];

		for (const style of attackStyles) {
			res.push(
				await user.addXP({
					skillName: style,
					amount: Math.floor(xpPerSkill),
					duration,
					minimal: true
				})
			);
		}

		res.push(
			await user.addXP({
				skillName: SkillsEnum.Hitpoints,
				amount: Math.floor((stratergy === 'experience' ? 1.5 : 1) * monsterHP * quantity * 1.33),
				duration,
				minimal: true
			})
		);

		const currentUserPoints = user.user.nmz_points;

		await user.update({
			nmz_points: currentUserPoints + pointsReceived
		});

		await incrementMinigameScore(userID, 'nmz', quantity);

		let str = `${user}, ${
			user.minionName
		} finished killing ${quantity}x The Nightmare Zone minigame stuffs. \n${res}\nYou gained **${pointsReceived.toLocaleString()}** Nightmare Zone points.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
