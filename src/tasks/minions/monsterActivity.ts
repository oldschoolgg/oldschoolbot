import { Task } from 'klasa';
import { Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { addMonsterXP } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMonsterScore(monsterID, quantity);
		const loot = monster.table.kill(quantity);

		announceLoot(this.client, user, monster, quantity, loot);
		const previousCL = user.settings.get(UserSettings.CollectionLogBank);
		await user.addItemsToBank(loot, true);

		const xpRes = addMonsterXP(user, Monsters.get(monster.id)!, quantity);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${
			(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) + quantity
		}. You received ${xpRes.join(', ')}.`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image,
			data,
			loot
		);
	}
}
