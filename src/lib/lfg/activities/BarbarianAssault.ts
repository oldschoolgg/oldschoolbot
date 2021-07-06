import { increaseNumByPercent, randArrItem, randInt, Time } from 'e';
import { Bank } from 'oldschooljs';
import { addArrayOfNumbers } from 'oldschooljs/dist/util';

import { Activity } from '../../constants';
import { KandarinDiary, userhasDiaryTier } from '../../diaries';
import { GearSetupTypes, maxOtherStats } from '../../gear';
import { UserSettings } from '../../settings/types/UserSettings';
import { ActivityTaskOptions, BarbarianAssaultActivityTaskOptions } from '../../types/minions';
import { calcPercentOfNum, calcWhatPercent, noOp, randomVariation, reduceNumByPercent, round } from '../../util';
import LfgInterface, {
	LfgCalculateDurationAndActivitiesPerTrip,
	LfgCalculateDurationAndActivitiesPerTripReturn,
	LfgCheckUserRequirements,
	LfgHandleTripFinish,
	LfgHandleTripFinishReturn,
	lfgReturnMessageInterface
} from '../LfgInterface';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <BarbarianAssaultActivityTaskOptions>{ type: Activity.BarbarianAssault };

	generateExpertiseString(totalLevel: number) {
		if (totalLevel === 4) {
			return 'Your team are all level 1, and new to Barbarian Assault.';
		}
		if (totalLevel <= 10) {
			return 'Some members of your team have a decent amount of experience with Barbarian Assault.';
		}
		if (totalLevel <= 15) {
			return 'Your team is quite skilled at Barbarian Assault.';
		}
		return 'Your team are the best-of-the-best at Barbarian Assault!';
	}

	async HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn> {
		const { quantity, users, totalLevel } = <BarbarianAssaultActivityTaskOptions>params.data;
		const { client } = params;
		let usersWithLoot: lfgReturnMessageInterface[] = [];
		let extraMessage = [];

		let basePoints = 35;

		extraMessage.push('The base amount of points is 35.');
		extraMessage.push(`Your teams total level is ${totalLevel}/${users.length * 5}.`);

		const teamSkillPercent = calcWhatPercent(totalLevel, users.length * 5);
		// You get up to 20% extra points for your team being higher levelled
		basePoints += calcPercentOfNum(teamSkillPercent, 20);
		extraMessage.push(
			`Your team receives ${calcPercentOfNum(
				teamSkillPercent,
				users.length * 5
			)} extra points for your honour levels.`
		);

		for (const id of users) {
			const user = await client.users.fetch(id).catch(noOp);
			if (!user) continue;
			let pts = basePoints + randInt(-3, 3);
			const [hasDiary] = await userhasDiaryTier(user, KandarinDiary.hard);
			if (hasDiary) {
				pts *= 1.1;
				extraMessage.push(`${user.username} receives 10% extra pts for kandarin hard diary.`);
			}
			let totalPoints = Math.floor(pts * quantity);
			await user.incrementMinigameScore('BarbarianAssault', quantity);
			await user.settings.update(
				UserSettings.HonourPoints,
				user.settings.get(UserSettings.HonourPoints) + totalPoints
			);
			usersWithLoot.push({
				user,
				emoji: false,
				lootedNonItems: { 'Honour points': totalPoints },
				spoiler: false
			});
		}

		extraMessage.push(this.generateExpertiseString(totalLevel));

		return {
			usersWithLoot,
			extraMessage
		};
	}

	async calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn> {
		const { party, leader } = params;

		let totalLevel = 0;
		for (const user of party) {
			totalLevel += user.settings.get(UserSettings.HonourLevel);
		}

		const boosts = [];

		let waveTime = randomVariation(Time.Minute * 4, 10);

		// Up to 12.5% speed boost for max strength
		const fighter = randArrItem(party);
		const gearStats = fighter.getGear(GearSetupTypes.Melee).stats;
		const strengthPercent = round(calcWhatPercent(gearStats.melee_strength, maxOtherStats.melee_strength) / 8, 2);
		waveTime = reduceNumByPercent(waveTime, strengthPercent);
		boosts.push(`${strengthPercent}% for ${fighter.username}'s melee gear`);

		// Up to 30% speed boost for team total honour level
		const totalLevelPercent = round(calcWhatPercent(totalLevel, 5 * party.length) / 3.3, 2);
		boosts.push(`${totalLevelPercent}% for team honour levels`);
		waveTime = reduceNumByPercent(waveTime, totalLevelPercent);

		if (party.length === 1) {
			waveTime = increaseNumByPercent(waveTime, 10);
			boosts.push('10% slower for solo');
		}

		// Up to 10%, at 200 kc, speed boost for team average kc
		const averageKC =
			addArrayOfNumbers(await Promise.all(party.map(u => u.getMinigameScore('BarbarianAssault')))) / party.length;
		const kcPercent = round(Math.min(100, calcWhatPercent(averageKC, 200)) / 5, 2);
		boosts.push(`${kcPercent}% for average KC`);
		waveTime = reduceNumByPercent(waveTime, kcPercent);

		const quantity = Math.floor(leader.maxTripLength(Activity.BarbarianAssault) / waveTime);
		const duration = quantity * waveTime;

		return {
			activitiesThisTrip: quantity,
			durationOfTrip: duration,
			timePerActivity: waveTime,
			extraMessages: boosts,
			extras: { totalLevel }
		};
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

	async getItemToRemoveFromBank(): Promise<Bank> {
		return new Bank();
	}

	checkTeamRequirements(): string[] {
		return [];
	}
}
