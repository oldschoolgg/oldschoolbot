import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Events, Time, Emoji, PerkTier } from '../../lib/constants';
import { noOp, saidYes } from '../../lib/util';
import killableMonsters from '../../lib/killableMonsters';
import clueTiers from '../../lib/minions/data/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import MinionCommand from '../../commands/Minion/minion';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity, slayerTask }: MonsterActivityTaskOptions) {
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
				)}**, their ${monster.name} KC is ${(user.settings.get(UserSettings.MonsterScores)[
					monster.id
				] ?? 0) + quantity}!`
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

		// Need to add a way to pull slayer xp for the monster, and check if they leveled up, and add the xp on

		if (slayerTask) {
			if (user.slayerTaskQuantity < quantity) {
				const slayerXP =
					Number(user.slayerTaskQuantity) *
					Monsters.get(user.slayerTaskID)?.data.slayerXP!;
				await user.settings.update(UserSettings.Slayer.SlayerTaskQuantity, 0);
				user.slayerTaskQuantity = 0;
				user.hasSlayerTask = false;
				user.slayerTaskID = 0;
				str += `You gained ${slayerXP} slayer XP and finished your slayer task!`;
				await user.addXP(SkillsEnum.Slayer, slayerXP);
			} else {
				const slayerXP = quantity * Monsters.get(user.slayerTaskID)?.data.slayerXP!;
				const newQuantity = user.slayerTaskQuantity - quantity;
				await user.settings.update(UserSettings.Slayer.SlayerTaskQuantity, newQuantity);
				str += `\nYou gained ${slayerXP} slayer XP, and still have ${newQuantity} left to kill.`;
				await user.addXP(SkillsEnum.Slayer, slayerXP);
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
