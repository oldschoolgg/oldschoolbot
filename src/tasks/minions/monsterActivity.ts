import { KlasaMessage, Task } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Emoji, Events, PerkTier, Time } from '../../lib/constants';
import { noOp, saidYes } from '../../lib/util';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import clueTiers from '../../lib/minions/data/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import MinionCommand from '../../commands/Minion/minion';
import announceLoot from '../../lib/minions/functions/announceLoot';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity, duration }: MonsterActivityTaskOptions) {
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

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) +
			quantity} ${
			user.minionName
		} asks if you'd like them to do another trip of ${quantity} ${monster.name}.`;

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

		user.incrementMonsterScore(monsterID, quantity);

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
								msg.content.toLowerCase() === 'c') ||
							saidYes(msg.content)
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
