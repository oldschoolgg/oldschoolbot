import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { Events, Time, Emoji, PerkTier } from '../../lib/constants';
import { noOp, saidYes } from '../../lib/util';
import clueTiers from '../../lib/minions/data/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import MinionCommand from '../../commands/Minion/minion';
import { Monsters } from 'oldschooljs';
import killableMonsters from '../../lib/minions/monsters/index';
import { SkillsEnum } from '../../lib/skilling/types';

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

		// If they're on a slayer task continue
		if (slayerTask) {
			const currentSlayerLevel = user.skillLevel(SkillsEnum.Slayer);
			// Check what master they're using, 2 = Nieve
			let slayerPoints = 0;
			if (user.slayerInfo[3] === 2) {
				slayerPoints = 12;
			}
			// If the quantity they're killing is <= the amount left on their task, finish the task. Else just give them xp and reduce the quantity left
			if (user.slayerInfo[2] <= quantity) {
				const slayerXP = Math.floor(
					user.slayerInfo[2] * Monsters.get(monster.id)?.data.slayerXP!
				);

				// Has task, Slayer task ID, Slayer task quantity, Current slayer master, Slayer points
				const newInfo = [0, 0, 0, 0, user.slayerInfo[4] + slayerPoints];
				await user.settings.update(UserSettings.Slayer.SlayerInfo, newInfo, {
					arrayAction: 'overwrite'
				});
				str += ` You gained ${slayerXP} slayer XP and **finished your slayer task!** You have recieved ${slayerPoints} slayer points!`;
				await user.addXP(SkillsEnum.Slayer, slayerXP);
				const newSlayerLevel = user.skillLevel(SkillsEnum.Slayer);
				if (newSlayerLevel > currentSlayerLevel) {
					str += `\n\n${user.minionName}'s slayer level is now ${newSlayerLevel}!`;
				}
			} else {
				const slayerXP = Math.floor(quantity * Monsters.get(monster.id)?.data.slayerXP!);
				const newQuantity = user.slayerInfo[2] - quantity;
				await user.settings.update(UserSettings.Slayer.SlayerInfo[2], newQuantity);
				str += `\nYou gained ${slayerXP} slayer XP, and still have ${newQuantity} left to kill.`;
				await user.addXP(SkillsEnum.Slayer, slayerXP);
				const newSlayerLevel = user.skillLevel(SkillsEnum.Slayer);
				if (newSlayerLevel > currentSlayerLevel) {
					str += `\n\n${user.minionName}'s slayer level is now ${newSlayerLevel}!`;
				}
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
							.kill(response as KlasaMessage, [quantity, monster.name])
							.catch(err => {
								throw err;
							});
					}
				})
				.catch(noOp);
		});
	}
}
