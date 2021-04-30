import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { getNewUser, incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const pizazzPointsPerHour = 100;

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinigameScore(userID, 'MagicTrainingArena', quantity);

		const loot = new Bank();

		const user = await this.client.users.fetch(userID);
		let baseXP = (25_000 / (Time.Minute * 60)) * duration;
		let xp = randomVariation(baseXP, 5);
		const xpRes = await user.addXP(SkillsEnum.Magic, xp, duration);
		const pizazzPoints = Math.floor((pizazzPointsPerHour / (Time.Minute * 60)) * duration);
		const newUser = await getNewUser(userID);
		newUser.PizazzPoints += pizazzPoints;
		await newUser.save();

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Magic Training Arena rooms. You received **${pizazzPoints} Pizazz points**. ${xpRes}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued mta`);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				return this.client.commands.get('mta')!.train(res, []);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
