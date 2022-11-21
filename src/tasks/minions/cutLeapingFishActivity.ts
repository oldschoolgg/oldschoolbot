import { percentChance } from 'e';
import { Bank } from 'oldschooljs';

import LeapingFish from '../../lib/skilling/skills/herblore/mixables/leapingFish';
import { SkillsEnum } from '../../lib/skilling/types';
import { CutLeapingFishActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const cutLeapingFishTask: MinionTask = {
	type: 'CutLeapingFish',
	async run(data: CutLeapingFishActivityTaskOptions) {
		let { fishName, userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const BarbarianFish = LeapingFish.find(LeapingFish => LeapingFish.name === fishName)!;

		const currentLevel = user.skillLevel(SkillsEnum.Cooking);
		let caviarChance = 0;
		let caviarCreated = 0;
		let roeChance = 0;
		let roeCreated = 0;
		let fishOffcutsChance = 0;
		let fishOffcutsCreated = 0;

		if (BarbarianFish.name === 'Cut leaping sturgeon') {
			caviarChance = 1.25 * currentLevel;
			fishOffcutsChance = (5 / 6) * 100;
			if (caviarChance > 100) caviarChance = 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(caviarChance)) {
					caviarCreated += 1;
				}
			}
			for (let i = 0; i < caviarCreated; i++) {
				if (percentChance(fishOffcutsChance)) {
					fishOffcutsCreated += 1;
				}
			}
		}

		if (BarbarianFish.name === 'Cut leaping salmon') {
			roeChance = 1.25 * currentLevel;
			fishOffcutsChance = (3 / 4) * 100;
			if (roeChance > 100) roeChance = 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(roeChance)) {
					roeCreated += 1;
				}
			}
			for (let i = 0; i < roeCreated; i++) {
				if (percentChance(fishOffcutsChance)) {
					fishOffcutsCreated += 1;
				}
			}
		}

		if (BarbarianFish.name === 'Cut leaping trout') {
			roeChance = 0.67 * currentLevel;
			fishOffcutsChance = (1 / 2) * 100;
			if (roeChance > 100) roeChance = 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(roeChance)) {
					roeCreated += 1;
				}
			}
			for (let i = 0; i < roeCreated; i++) {
				if (percentChance(fishOffcutsChance)) {
					fishOffcutsCreated += 1;
				}
			}
		}

		let loot = new Bank();

		loot.add('Roe', roeCreated);
		loot.add('Caviar', caviarCreated);
		loot.add('Fish offcuts', fishOffcutsCreated);

		let xpReceived = 0;
		xpReceived += 10 * roeCreated;
		xpReceived += 15 * caviarCreated;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Cooking,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished ${BarbarianFish.name}. ${xpRes}\n\n You received: ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
