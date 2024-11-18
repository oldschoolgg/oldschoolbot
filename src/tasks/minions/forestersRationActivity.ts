import { Bank } from 'oldschooljs';

import ForestryRations from '../../lib/skilling/skills/cooking/forestersRations';
import { SkillsEnum } from '../../lib/skilling/types';
import type { CreateForestersRationsActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const CreateForestersRationsTask: MinionTask = {
	type: 'CreateForestersRations',
	async run(data: CreateForestersRationsActivityTaskOptions) {
		const { rationName, userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const ration = ForestryRations.find(ration => ration.name === rationName)!;
		const rationsCreated = ration.rationsAmount * quantity;

		const rationBank = new Bank();
		rationBank.add("Forester's ration", rationsCreated);

		const xpPerAction = 51.1;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Cooking,
			amount: xpPerAction * quantity,
			duration
		});

		const str = `${user}, ${user.minionName} finished creating ${quantity}x ${ration.name}. ${xpRes}\n\n You received: ${rationBank}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: rationBank
		});

		handleTripFinish(user, channelID, str, undefined, data, rationBank);
	}
};
