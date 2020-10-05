import { MessageAttachment } from 'discord.js';
import { KlasaMessage, Task } from 'klasa';

import MinionCommand from '../../../../commands/Minion/minion';
import { continuationChars, Emoji, Events, PerkTier, Time } from '../../../../lib/constants';
import clueTiers from '../../../../lib/minions/data/clueTiers';
import killableMonsters from '../../../../lib/minions/data/killableMonsters';
import announceLoot from '../../../../lib/minions/functions/announceLoot';
import { UserSettings } from '../../../../lib/settings/types/UserSettings';
import { CyclopsActivityTaskOptions } from '../../../../lib/types/minions';
import {
	addItemToBank,
	bankHasItem,
	noOp,
	randomItemFromArray,
	removeItemFromBank,
	roll
} from '../../../../lib/util';
import { channelIsSendable } from '../../../../lib/util/channelIsSendable';
import getUsersPerkTier from '../../../../lib/util/getUsersPerkTier';
import itemID from '../../../../lib/util/itemID';

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
		const perkTier = getUsersPerkTier(user);
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
		loot = removeItemFromBank(loot, 19679, user.numItemsInBankSync(19679));
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

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) +
			quantity}.`;

		user.incrementMonsterScore(minigameID, quantity);

		const clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);

		if (clueTiersReceived.length > 0) {
			str += `\n ${Emoji.Casket} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(', ')}).`;
			if (perkTier > PerkTier.One) {
				str += `\n\nSay \`c\` if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				str += `\n\nYou can get your minion to complete them using \`+minion clue easy/medium/etc\``;
			}
		}

		if (!channelIsSendable(channel)) return;

		const continuationChar =
			perkTier > PerkTier.One ? 'y' : randomItemFromArray(continuationChars);

		str += `\nSay \`${continuationChar}\` to repeat this trip.`;

		this.client.queuePromise(() => {
			channel.send(str, new MessageAttachment(image));
			channel
				.awaitMessages(
					(msg: KlasaMessage) => {
						if (msg.author !== user) return false;
						return (
							(perkTier > PerkTier.One && msg.content.toLowerCase() === 'c') ||
							msg.content.toLowerCase() === continuationChar
						);
					},
					{
						time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
						max: 1
					}
				)
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;

						if (
							clueTiersReceived.length > 0 &&
							perkTier > PerkTier.One &&
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

						user.log(`continued trip of ${quantity}x ${monster.name}[${monster.id}]`);

						this.client.commands
							.get('warriorsguild')!
							.run(response as KlasaMessage, [quantity, 'cyclops'])
							.catch(err => channel.send(err));
					}
				});
		});
	}
}
