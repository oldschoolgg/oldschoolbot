import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Events, Time, Emoji } from '../../lib/constants';
import { getMinionName, noOp, saidYes } from '../../lib/util';
import killableMonsters from '../../lib/killableMonsters';
import clueTiers from '../../lib/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity }: MonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID);
		const user = await this.client.users.fetch(userID);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!monster || !user) {
			this.client.emit(Events.Wtf, `Missing user or monster - ${logInfo}`);

			return;
		}

		const loot = monster.table.kill(quantity);
		const itemsToAnnounce = filterBankFromArrayOfItems(monster.notifyDrops as number[], loot);
		if (Object.keys(itemsToAnnounce).length > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received **${await createReadableItemListFromBank(
					this.client,
					itemsToAnnounce
				)}**, their ${monster.name} KC is ${user.settings.get(UserSettings.MonsterScores)[
					monster.id
				] + quantity}!`
			);
		}

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{},
				user.settings.get(UserSettings.BankBackground)
			);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);

		let str = `${user}, ${getMinionName(user)} finished killing ${quantity} ${
			monster.name
		}. Your ${monster.name} KC is now ${(user.settings.get(UserSettings.MonsterScores)[
			monster.id
		] ?? 0) + quantity} ${getMinionName(
			user
		)} asks if you'd like them to do another trip of ${quantity} ${monster.name}.`;

		const clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);

		if (clueTiersReceived.length > 0) {
			str += `\n ${Emoji.Casket} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(
					', '
				)}), you can get your minion to complete them using \`+minion clue 1 easy/medium/etc \``;
		}

		user.incrementMonsterScore(monsterID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str, new MessageAttachment(image));
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;

						user.log(`continued trip of ${quantity}x ${monster.name}[${monster.id}]`);

						this.client.commands
							.get('minion')!
							.kill(response as KlasaMessage, [quantity, monster.name]);
					}
				})
				.catch(noOp);
		});
	}
}
