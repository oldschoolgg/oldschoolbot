import { Task } from 'klasa';

import { revenantMonsters } from '../../commands/Minion/revs';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { filterLootReplace } from '../../lib/slayer/slayerUtil';
import { RevenantOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		await user.incrementMonsterScore(monsterID, quantity);

		const loot = monster.table.kill(quantity, {});
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n`;
		str += await addMonsterXP(user, {
			monsterID,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null,
			minimal: false
		});

		announceLoot(this.client, user, monster, loot.bank);

		const { clLoot } = filterLootReplace(user.allItemsOwned(), loot);

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, false);
		await user.addItemsToCollectionLog(clLoot.bank);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('revs')!.run(res, [quantity, monster.name]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
