import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { bossEvents } from '../../lib/bossEvents';
import { BossUser } from '../../lib/structures/Boss';
import { NewBossOptions } from '../../lib/types/minions';

export default class extends Task {
	async run(data: NewBossOptions) {
		const bossUsers: BossUser[] = await Promise.all(
			data.bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await this.client.fetchUser(u.user)
			}))
		);
		const bossEvent = bossEvents.find(b => b.id === data.bossID)!;
		bossEvent.handleFinish(this.client, data, bossUsers);
	}
}
