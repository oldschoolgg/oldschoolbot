import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import { FishingTrawlerActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ channelID, quantity, duration, userID }: FishingTrawlerActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.FishingTrawler, quantity);

		const fishingLevel = user.skillLevel(SkillsEnum.Fishing);

		const allItemsOwned = user.allItemsOwned();
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(fishingTrawlerLoot(fishingLevel, addBanks([loot.bank, allItemsOwned])));
		}

		await user.addItemsToBank(loot.bank, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Fishing Trawler`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished completing the Fishing Trawler ${quantity}x times.`,
			res => {
				user.log(`continued fishing trawler`);
				return this.client.commands.get('trickortreat')!.run(res, []);
			},
			image
		);
	}
}
