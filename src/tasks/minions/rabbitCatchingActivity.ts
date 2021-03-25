import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: QuestingActivityTaskOptions) {
		const { userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const cl = new Bank(user.settings.get(UserSettings.CollectionLogBank));
		const hasDoneEvent = cl.has('Easter ring');

		if (!hasDoneEvent) {
			const loot = new Bank()
				.add('Easter basket')
				.add('Rubber chicken')
				.add('Easter ring')
				.add('Chicken head')
				.add('Chicken wings')
				.add('Chicken legs')
				.add('Chicken feet');

			const str = `${user}, ${user.minionName} finished the Easter Holiday Event! They helped clear out rabbits from the nearby Farming competition. The Farmers have all given some items as a reward: **${loot}**.`;

			const { previousCL } = await user.addItemsToBank(loot, true);

			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(
					loot.bank,
					`Easter Holiday Event 2021 Loot`,
					true,
					{ showNewCL: 1 },
					user,
					previousCL
				);

			handleTripFinish(this.client, user, channelID, str, undefined, image!, data, loot.bank);
		} else {
			const str = `${user}, ${user.minionName} finished the Easter Holiday Event...again! They helped clear out rabbits from the nearby Farming competition. Unfortunately, the Farmers have no more items to give out.`;

			handleTripFinish(this.client, user, channelID, str, undefined, undefined, data, null);
		}
	}
}
