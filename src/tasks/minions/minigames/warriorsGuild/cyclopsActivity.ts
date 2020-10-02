import { Task } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Events } from '../../../../lib/constants';
import { noOp, bankHasItem, roll, addItemToBank, removeItemFromBank } from '../../../../lib/util';
import itemID from '../../../../lib/util/itemID';
import killableMonsters from '../../../../lib/minions/data/killableMonsters';
import { CyclopsActivityTaskOptions } from '../../../../lib/types/minions';
import { UserSettings } from '../../../../lib/settings/types/UserSettings';
import { channelIsSendable } from '../../../../lib/util/channelIsSendable';
import announceLoot from '../../../../lib/minions/functions/announceLoot';

const defenders = [
	{
		itemID: itemID('Dragon defender'),
		rollChance: 100
	},
	{
		itemID: itemID('Rune defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Adamant defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Mithril defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Black defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Steel defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Iron defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Bronze defender'),
		rollChance: 50
	}
];

export default class extends Task {
	async run({ minigameID, userID, channelID, quantity, duration }: CyclopsActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === minigameID)!;
		const user = await this.client.users.fetch(userID);
		const userBank = user.settings.get(UserSettings.Bank);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `MonsterID[${minigameID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		let loot = monster.table.kill(quantity);
		let position = 0;
		for (const defender of defenders) {
			if (bankHasItem(userBank, defender.itemID, 1)) {
				for (let i = 0; i < quantity; i++) {
					if (position > 0) {
						if (roll(defenders[position - 1].rollChance)) {
							loot = addItemToBank(loot, defenders[position - 1].itemID);
						}
					} else if (roll(defender.rollChance)) {
						loot = addItemToBank(loot, defender.itemID);
					}
				}
				break;
			}
			position++;
		}
		if (!bankHasItem(userBank, defenders[defenders.length - 1].itemID, 1)) {
			for (let i = 0; i < quantity; i++) {
				if (roll(defenders[defenders.length - 1].rollChance)) {
					loot = addItemToBank(loot, defenders[defenders.length - 1].itemID);
				}
			}
		}
		// Remove Catacomb totem pieces
		loot = removeItemFromBank(loot, 19677, user.numItemsInBankSync(19677));
		loot = removeItemFromBank(loot, 19679, user.numItemsInBankSync(196779));
		loot = removeItemFromBank(loot, 19681, user.numItemsInBankSync(19681));
		loot = removeItemFromBank(loot, 19683, user.numItemsInBankSync(19683));

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
		}. Your ${monster.name} KC is now ${(user.settings.get(UserSettings.MonsterScores)[
			monster.id
		] ?? 0) + quantity}.`;

		user.incrementMonsterScore(minigameID, quantity);

		if (!channelIsSendable(channel)) return;

		return channel.send(str, new MessageAttachment(image));
	}
}
