import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Events, Time, Emoji, PerkTier } from '../../../lib/constants';
import { noOp, bankHasItem, roll, addItemToBank } from '../../../lib/util';
import itemID from '../../../lib/util/itemID';
import killableMonsters from '../../../lib/minions/data/killableMonsters';
import clueTiers from '../../../lib/minions/data/clueTiers';
import { CyclopsActivityTaskOptions } from '../../../lib/types/minions';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import MinionCommand from '../../../commands/Minion/minion';
import announceLoot from '../../../lib/minions/functions/announceLoot';

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
					}
					else {
						if (roll(defender.rollChance)) {
							loot = addItemToBank(loot, defender.itemID);
						}
					}
				}
				break;
			}
		}
		if (!bankHasItem(userBank, defenders[defenders.length-1].itemID, 1)) {
			if (roll(defenders[defenders.length - 1].rollChance)) {
				loot = addItemToBank(loot, defenders[defenders.length - 1].itemID);
			}
		}

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

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) +
			quantity}.`;

		const clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);

		if (clueTiersReceived.length > 0) {
			str += `\n ${Emoji.Casket} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(', ')}).`;
			if (getUsersPerkTier(user) > PerkTier.One) {
				str += `\n\nSay "C" if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				str += `\n\nYou can get your minion to complete them using \`+minion clue easy/medium/etc \``;
			}
		}

		user.incrementMonsterScore(minigameID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str, new MessageAttachment(image));
			channel
				.awaitMessages(
					(msg: KlasaMessage) => {
						if (msg.author !== user) return false;
						return (
							(getUsersPerkTier(user) > PerkTier.One &&
								msg.content.toLowerCase() === 'c')
						);
					},
					{
						time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
						max: 1
					}
				)
				.then(messages => {
					const response = messages.first();
					if (response) {
						if (response.author.minionIsBusy) return;

						if (
							getUsersPerkTier(user) > PerkTier.One &&
							response.content.toLowerCase() === 'c'
						) {
							(this.client.commands.get(
								'minion'
							) as MinionCommand).clue(response as KlasaMessage, [
								1,
								clueTiersReceived[0].name
							]);
							return;
						}
					}
				})
				.catch(noOp);
		});
	}
}
