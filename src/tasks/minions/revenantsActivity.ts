import { objectEntries } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { revenantMonsters } from '../../commands/Minion/revs';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { filterLootReplace } from '../../lib/slayer/slayerUtil';
import { RevenantOptions } from '../../lib/types/minions';
import { updateBankSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, duration, died } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);

		if (died) {
			const cost = new Bank();
			const currentGear = user.settings.get(UserSettings.Gear.Wildy)!;
			const newGear = { ...currentGear };
			for (const [key, val] of objectEntries(currentGear)) {
				if (['weapon', '2h'].includes(key)) continue;
				if (val === null) continue;
				cost.add(val.item, val.quantity);
				newGear[key] = null;
			}
			await user.settings.update(UserSettings.Gear.Wildy, newGear);
			updateBankSetting(this.client, ClientSettings.EconomyStats.RevsCost, cost);
			handleTripFinish(
				this.client,
				user,
				channelID,
				`You died, you lost all your loot, and these equipped items: ${cost}.`,
				res => {
					user.log(`continued trip of killing ${monster.name}`);
					return this.client.commands.get('revs')!.run(res, [quantity, monster.name]);
				},
				undefined,
				data,
				null
			);
			return;
		}

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
