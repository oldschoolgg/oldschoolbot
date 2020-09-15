import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Monsters } from 'oldschooljs';

import { Events, Time, Emoji, PerkTier } from '../../lib/constants';
import { noOp, saidYes, roll, multiplyBank, itemID, rand } from '../../lib/util';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import clueTiers from '../../lib/minions/data/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import MinionCommand from '../../commands/Minion/minion';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { getRandomMysteryBox } from '../../lib/openables';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

const charsWithoutC = alphaNumericalChars.filter(char => char !== 'c');

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity, duration }: MonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const fullMonster = Monsters.get(monsterID);
		if (!fullMonster) throw 'No full monster';
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		let loot = monster.table.kill(quantity);
		if (roll(10)) {
			if (duration > Time.Minute * 14) {
				loot = multiplyBank(loot, 2);
				loot[getRandomMysteryBox()] = 1;
			}
		}

		let gotKlik = false;
		const minutes = Math.ceil(duration / Time.Minute);
		if (fullMonster.data.attributes.includes(MonsterAttribute.Dragon)) {
			for (let i = 0; i < minutes; i++) {
				if (roll(2500)) {
					gotKlik = true;
					loot[itemID('Klik')] = 1;
					break;
				}
			}
		}

		let bananas = 0;
		if (user.equippedPet() === itemID('Harry')) {
			for (let i = 0; i < minutes; i++) {
				bananas += rand(1, 3);
			}
			loot[itemID('Banana')] = bananas;
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
				str += `\n\nSay \`c\` if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				str += `\n\nYou can get your minion to complete them using \`=minion clue easy/medium/etc \``;
			}
		}

		if (gotKlik) {
			str += `\n\n<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.`;
		}

		if (bananas > 0) {
			str += `\n\n <:harry:749945071104819292> While you were PvMing, Harry went off and picked ${bananas} Bananas for you!`;
		}

		user.incrementMonsterScore(monsterID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			console.log(`Returning because ${channel.name} cant send`);
			return;
		}

		const perkTier = getUsersPerkTier(user);
		const continuationChar = perkTier > PerkTier.Two ? 'y' : randomItemFromArray(charsWithoutC);

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

						if (perkTier > PerkTier.One && response.content.toLowerCase() === 'c') {
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
							.catch(err => channel.send(err));
					}
				});
		});
	}
}
