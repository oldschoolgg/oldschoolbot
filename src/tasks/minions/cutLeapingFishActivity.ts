import { Bank } from 'oldschooljs';

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

		console.log(fishName);

		const currentLevel = user.skillLevel(SkillsEnum.Cooking);
		let caviarChance = 0;
		let caviarCreated = 0;
		let roeChance = 0;
		let roeCreated = 0;
		let fishOffcutsChance = 0;
		let fishOffcutsCreated = 0;

		if (BarbarianFish.name === 'Cut leaping sturgeon') {
			caviarChance = (1 + (1 * (99 - currentLevel)) / 98 + 80 * (currentLevel - 1)) / 256;
		}

		caviarCreated = caviarChance * quantity;

		roeCreated = roeChance * quantity;

		fishOffcutsCreated = fishOffcutsChance * quantity;

		let loot = new Bank();

		loot.add('Roe', roeCreated);
		loot.add('Caviar', caviarCreated);
		loot.add('Fish offcuts', fishOffcutsCreated);

		let xpReceived = quantity * BarbarianFish.xp;

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
