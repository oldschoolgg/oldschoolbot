import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Events } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

const items = new LootTable().every('Banana', [1, 3]).oneIn(3, 'Monkey nuts', [1, 3]);
const monkeyItems = resolveItems(['Cursed banana', 'Banana cape', 'Gnome child hat']);
const troll = new LootTable()
	.add('Troll thistle')
	.add('Troll potion')
	.add('Trollweiss')
	.add('Troll guard');

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		const { userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const loot = new Bank().add(items.roll());

		const cl = new Bank(user.settings.get(UserSettings.CollectionLogBank));
		const hasDoneEvent = cl.has('Cursed banana');
		if (!hasDoneEvent) {
			for (const i of monkeyItems) {
				loot.add(i);
			}
			loot.add('Slice of birthday cake');
		}

		const flappyRate = cl.has('Flappy') ? 600 : 300;
		if (roll(flappyRate)) {
			loot.add('Flappy');
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received the birthday event pet!`
			);
		}

		if (roll(20)) {
			loot.add(troll.roll());
		}
		if (roll(50) && !cl.has('Blood diamond')) {
			loot.add('Blood diamond');
			loot.add('Glowing dagger');
		}

		if (user.usingPet('Flappy') && roll(100)) {
			loot.add('Birthday pack');
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${
				user.minionName
			} finished doing the Monkey Hunt birthday event! You received ${loot}.${
				hasDoneEvent ? ' https://i.imgur.com/ejtF3A4.mp4' : ''
			}${
				loot.has('Flappy') ? '\n\n<:flappy:812280578195456002> You received a Flappy.' : ''
			}`,
			res => {
				user.log(`continued trip of monkeyhunt`);
				return this.client.commands.get('birthdayevent')!.run(res, []);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
