import { increaseNumByPercent, reduceNumByPercent } from 'e';

import { Activity, Time } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions, SoulWarsOptions } from '../../types/minions';
import { noOp, randomVariation, roll } from '../../util';
import LfgInterface, {
	LfgCalculateDurationAndActivitiesPerTrip,
	LfgCalculateDurationAndActivitiesPerTripReturn,
	LfgCheckUserRequirements,
	LfgHandleTripFinish,
	LfgHandleTripFinishReturn,
	lfgReturnMessageInterface
} from '../LfgInterface';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <SoulWarsOptions>{ type: Activity.SoulWars };

	calcPoints() {
		let base = 42.5;
		if (roll(5)) {
			base = 30;
		}
		if (roll(15)) {
			base = 10;
		}
		if (roll(2)) {
			base = increaseNumByPercent(base, 20);
		} else {
			base = reduceNumByPercent(base, 20);
		}
		return Math.ceil(base);
	}

	async HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn> {
		const { quantity, users } = <GroupMonsterActivityTaskOptions>params.data;
		const { client } = params;

		let usersWithLoot: lfgReturnMessageInterface[] = [];

		for (const id of users) {
			const user = await client.users.fetch(id).catch(noOp);
			if (!user) continue;

			let points = 0;
			for (let i = 0; i < quantity; i++) {
				points += this.calcPoints();
			}
			await user.settings.update(UserSettings.ZealTokens, user.settings.get(UserSettings.ZealTokens) + points);
			user.incrementMinigameScore('SoulWars', quantity);
			usersWithLoot.push({ user, emoji: false, lootedItems: `${points}x Zeal Tokens`, spoiler: false });
		}
		return { usersWithLoot };
	}

	async calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn> {
		const perDuration = randomVariation(Time.Minute * 7, 5);
		const quantity = Math.floor(params.leader.maxTripLength(Activity.SoulWars) / perDuration);
		const duration = quantity * perDuration;
		return { activitiesThisTrip: quantity, durationOfTrip: duration, timePerActivity: perDuration };
	}

	async checkUserRequirements(params: LfgCheckUserRequirements): Promise<string[]> {
		let returnMessage: string[] = [];

		if (!params.user.hasMinion) {
			returnMessage.push('You need a minion to join this activity!');
		}

		if (params.user.minionIsBusy) {
			returnMessage.push("You are busy right now and can't join this queue!");
		}

		return returnMessage;
	}

	async getItemToRemoveFromBank() {}

	checkTeamRequirements(): string[] {
		return [];
	}
}
