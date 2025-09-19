import { percentChance } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { clamp } from 'remeda';

import LeapingFish from '../../lib/skilling/skills/cooking/leapingFish.js';
import { SkillsEnum } from '../../lib/skilling/types.js';
import type { CutLeapingFishActivityTaskOptions } from '../../lib/types/minions.js';
import { handleTripFinish } from '../../lib/util/handleTripFinish.js';

export const cutLeapingFishTask: MinionTask = {
	type: 'CutLeapingFish',
	async run(data: CutLeapingFishActivityTaskOptions) {
		const { fishID, userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const barbarianFish = LeapingFish.find(LeapingFish => LeapingFish.item.id === fishID)!;

		const currentLevel = user.skillLevel(SkillsEnum.Cooking);
		let caviarChance = 0;
		let caviarCreated = 0;
		let roeChance = 0;
		let roeCreated = 0;
		let fishOffcutsChance = 0;
		let fishOffcutsCreated = 0;

		if (barbarianFish.item.name === 'Leaping sturgeon') {
			caviarChance = clamp(1.25 * currentLevel, { min: 0, max: 100 });
			fishOffcutsChance = (5 / 6) * 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(caviarChance)) {
					caviarCreated += 1;
					if (percentChance(fishOffcutsChance)) {
						fishOffcutsCreated += 1;
					}
				}
			}
		}
		if (barbarianFish.item.name === 'Leaping salmon') {
			roeChance = clamp(1.25 * currentLevel, { min: 0, max: 100 });
			fishOffcutsChance = (3 / 4) * 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(roeChance)) {
					roeCreated += 1;
					if (percentChance(fishOffcutsChance)) {
						fishOffcutsCreated += 1;
					}
				}
			}
		}

		if (barbarianFish.item.name === 'Leaping trout') {
			roeChance = clamp(0.67 * currentLevel, { min: 0, max: 100 });
			fishOffcutsChance = (1 / 2) * 100;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(roeChance)) {
					roeCreated += 1;
					if (percentChance(fishOffcutsChance)) {
						fishOffcutsCreated += 1;
					}
				}
			}
		}

		const loot = new Bank();

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

		const str = `${user}, ${user.minionName} finished cutting ${quantity}x ${barbarianFish.item.name}. ${xpRes}\n\n You received: ${loot}.`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
