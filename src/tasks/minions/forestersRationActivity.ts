import { Bank } from 'oldschooljs';

import ForestryRations from '@/lib/skilling/skills/cooking/forestersRations.js';
import type { CreateForestersRationsActivityTaskOptions } from '@/lib/types/minions.js';

export const CreateForestersRationsTask: MinionTask = {
	type: 'CreateForestersRations',
	async run(data: CreateForestersRationsActivityTaskOptions, { user, handleTripFinish }) {
		const { rationName, channelID, quantity, duration } = data;

		const ration = ForestryRations.find(ration => ration.name === rationName)!;
		const rationsCreated = ration.rationsAmount * quantity;

		const rationBank = new Bank();
		rationBank.add("Forester's ration", rationsCreated);

		const xpPerAction = 51.1;

		const xpRes = await user.addXP({
			skillName: 'cooking',
			amount: xpPerAction * quantity,
			duration
		});

		const str = `${user}, ${user.minionName} finished creating ${quantity}x ${ration.name}. ${xpRes}\n\n You received: ${rationBank}.`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: rationBank
		});

		handleTripFinish(user, channelID, str, undefined, data, rationBank);
	}
};
