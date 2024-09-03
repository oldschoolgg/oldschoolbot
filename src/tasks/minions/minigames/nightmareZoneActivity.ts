import { resolveAttackStyles } from '../../../lib/minions/functions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import type { NightmareZoneActivityTaskOptions } from './../../../lib/types/minions';

export const nightmareZoneTask: MinionTask = {
	type: 'NightmareZone',
	async run(data: NightmareZoneActivityTaskOptions) {
		const { quantity, userID, channelID, duration, strategy } = data;
		const user = await mUserFetch(userID);

		const attackStyles = resolveAttackStyles({
			attackStyles: user.getAttackStyles()
		});

		const monsterHP = 227;
		const monsterPoints = 3500;
		const totalXP = (strategy === 'experience' ? 1.5 : 1) * monsterHP * 4 * quantity;
		const pointsReceived = Math.floor((strategy === 'points' ? 4 : 0.8) * monsterPoints * quantity);
		const xpPerSkill = totalXP / attackStyles.length;

		const res: string[] = [];

		for (const style of attackStyles) {
			res.push(
				await user.addXP({
					skillName: style,
					amount: Math.floor(xpPerSkill),
					duration,
					source: 'NightmareZone'
				})
			);
		}

		res.push(
			await user.addXP({
				skillName: SkillsEnum.Hitpoints,
				amount: Math.floor((strategy === 'experience' ? 1.5 : 1) * monsterHP * quantity * 1.33),
				duration,
				source: 'NightmareZone'
			})
		);

		await user.update({
			nmz_points: {
				increment: pointsReceived
			}
		});

		const score = await incrementMinigameScore(userID, 'nmz', quantity);

		const str = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Nightmare Zone monsters. Your Nightmare Zone KC is now ${score.newScore}.
 \n**XP Gains:** ${res.join(' ')}\nYou gained **${pointsReceived.toLocaleString()}** Nightmare Zone points.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
