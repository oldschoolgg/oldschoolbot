import { Message, MessageAttachment, MessageCollector, TextChannel } from 'discord.js';
import { randInt } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { BitField, Emoji, PerkTier, Time } from '../constants';
import { getRandomMysteryBox } from '../data/openables';
import clueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { RuneTable, SeedTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import Mining from '../skilling/skills/mining';
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
	data: ActivityTaskOptions,
	loot: ItemBank | null
) {
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
	let bonusLoot = new Bank();
	if (minutes < 5) {
		// Do nothing
	} else if (pet === itemID('Peky')) {
		for (let i = 0; i < minutes; i++) {
			if (roll(10)) {
				bonusLoot.add(SeedTable.roll());
			}
		}
		await user.addItemsToBank(bonusLoot, true);
		message += `\n<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${bonusLoot}.`;
	} else if (pet === itemID('Obis')) {
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(RuneTable.roll());
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\n<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Brock')) {
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WoodTable.roll());
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\n<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Wilvus')) {
		let rolls = minutes / 6;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WilvusTable.roll());
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\n<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Smokey')) {
		for (let i = 0; i < minutes; i++) {
			if (roll(450)) {
				bonusLoot.add(getRandomMysteryBox());
			}
		}
		if (bonusLoot.length > 0) {
			await user.addItemsToBank(bonusLoot.bank, true);
			message += `\n<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${bonusLoot}.`;
		}
	} else if (pet === itemID('Doug')) {
		for (const randOre of Mining.Ores.sort(() => 0.5 - Math.random()).slice(
			0,
			randInt(1, Math.floor(minutes / 7))
		)) {
			const qty = randInt(1, minutes * 3);
			bonusLoot.add(randOre.id, qty);
		}
		await user.addItemsToBank(bonusLoot.bank, true);
		message += `\nDoug did some mining while you were on your trip and got you: ${bonusLoot}.`;
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

	const channel = client.channels.get(channelID);

	sendToChannelID(client, channelID, { content: message, image: attachable }).then(() => {
		const minutes = Math.min(30, data.duration / Time.Minute);
		const randomEventChance = 60 - minutes;
		if (
			channel &&
			!user.bitfield.includes(BitField.DisabledRandomEvents) &&
			roll(randomEventChance) &&
			channel instanceof TextChannel
		) {
			triggerRandomEvent(channel, user);
		}
	});

	if (!onContinue) return;

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

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
