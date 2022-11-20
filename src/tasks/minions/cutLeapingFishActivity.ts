import LeapingFish from '../../lib/skilling/skills/herblore/mixables/leapingFish';
import { SkillsEnum } from '../../lib/skilling/types';
import { CutLeapingFishActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const cutLeapingFishTask: MinionTask = {
	type: 'Herblore',
	async run(data: CutLeapingFishActivityTaskOptions) {
		let { fishName, userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const BarbarianFish = LeapingFish.find(LeapingFish => LeapingFish.name === fishName)!;

		const currentLevel = user.skillLevel(SkillsEnum.Cooking);
		let caviarChance = 0;

		if (BarbarianFish.name === 'Cut leaping sturgeon') {
			
		}






		const xpReceived = quantity * BarbarianFish.xp;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Cooking,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished ${BarbarianFish.name}. ${xpRes}`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
