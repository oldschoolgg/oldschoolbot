import { Message, MessageAttachment, MessageCollector } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { Emoji, PerkTier, Time } from '../constants';
import { getRandomMysteryBox } from '../data/openables';
import clueTiers from '../minions/data/clueTiers';
import { setActivityLoot } from '../settings/settings';
import { RuneTable, SeedTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { ActivityTaskOptions } from '../types/minions';
import {
	channelIsSendable,
	generateContinuationChar,
	getSupportGuild,
	itemID,
	roll,
	stringMatches
} from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue:
		| undefined
		| ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	data: ActivityTaskOptions,
	loot: ItemBank | null
) {
	if (loot) {
		setActivityLoot(data.id, loot);
	}

	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	if (loot && data.duration > Time.Minute * 20 && roll(15)) {
		const emoji = getSupportGuild(client).emojis.random().toString();
		const bonusLoot = new Bank().add(loot).add(getRandomMysteryBox());
		message += `\n${emoji} **You received 2x loot and a Mystery box.**`;
		await user.addItemsToBank(bonusLoot, true);
	}

	const minutes = data.duration / Time.Minute;
	const pet = user.equippedPet();
	if (minutes < 5) {
		// Do nothing
	} else if (pet === itemID('Peky')) {
		let bonusLoot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (roll(10)) {
				bonusLoot.add(SeedTable.roll());
			}
		}
		await user.addItemsToBank(bonusLoot, true);
		message += `\n<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${loot}.`;
	} else if (pet === itemID('Obis')) {
		let loot = new Bank();
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			loot.add(RuneTable.roll());
		}
		await user.addItemsToBank(loot.bank, true);
		message += `\n<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Brock')) {
		let bonusLoot = new Bank();
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WoodTable.roll());
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\n<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Wilvus')) {
		let bonusLoot = new Bank();
		let rolls = minutes / 6;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WilvusTable.roll());
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\n<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Smokey')) {
		let bonusLoot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (roll(450)) {
				bonusLoot.add(getRandomMysteryBox());
			}
		}
		if (bonusLoot.length > 0) {
			await user.addItemsToBank(bonusLoot.bank, true);
			message += `\n<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${loot}.`;
		}
	}
	const clueReceived = loot ? clueTiers.find(tier => loot[tier.scrollID] > 0) : undefined;

	if (clueReceived) {
		message += `\n${Emoji.Casket} **You got a ${clueReceived.name} clue scroll** in your loot.`;
		if (perkTier > PerkTier.One) {
			message += ` Say \`c\` if you want to complete this ${clueReceived.name} clue now.`;
		} else {
			message += `You can get your minion to complete them using \`+minion clue easy/medium/etc\``;
		}
	}

	const attachable = attachment
		? attachment instanceof MessageAttachment
			? attachment
			: new MessageAttachment(attachment)
		: undefined;
	sendToChannelID(client, channelID, { content: message, image: attachable });
	if (!onContinue) return;

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return;
	const collector = new MessageCollector(
		channel,
		(mes: Message) =>
			mes.author === user &&
			(mes.content.toLowerCase() === 'c' || stringMatches(mes.content, continuationChar)),
		{
			time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
			max: 1
		}
	);

	collectors.set(user.id, collector);

	collector.on('collect', async (mes: KlasaMessage) => {
		if (user.minionIsBusy || client.oneCommandAtATimeCache.has(mes.author.id)) {
			collector.stop();
			collectors.delete(user.id);
			return;
		}
		client.oneCommandAtATimeCache.add(mes.author.id);
		try {
			if (mes.content.toLowerCase() === 'c' && clueReceived && perkTier > PerkTier.One) {
				(client.commands.get('minion') as MinionCommand).clue(mes, [1, clueReceived.name]);
				return;
			} else if (stringMatches(mes.content, continuationChar)) {
				await onContinue(mes).catch(err => {
					channel.send(err);
				});
			}
		} catch (err) {
			console.log(err);
			channel.send(err);
		} finally {
			setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
		}
	});
}
