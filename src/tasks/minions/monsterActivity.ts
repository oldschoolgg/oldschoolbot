import { KlasaMessage, Task } from 'klasa';

import { Events } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		const loot = monster.table.kill(quantity);

		announceLoot(this.client, user, monster, quantity, loot);

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user
			);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);

		const str = `${user}, ${user.minionName} finished killing ${quantity} ${
			monster.name
		}. Your ${monster.name} KC is now ${
			(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) + quantity
		}.`;

		user.incrementMonsterScore(monsterID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${monster.name}[${monster.id}]`);
				return this.client.commands
					.get('minion')!
					.kill(res as KlasaMessage, [quantity, monster.name])
					.catch(err => channel.send(err));
			},
			data,
			image,
			loot
		);
	}
}
