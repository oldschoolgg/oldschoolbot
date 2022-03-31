import { activity_type_enum } from '@prisma/client';
import { Message, MessageAttachment, MessageCollector, TextChannel } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, COINS_ID, Emoji, lastTripCache, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import clueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { ClientSettings } from '../settings/types/ClientSettings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, roll, stringMatches, updateGPTrackSetting } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource: activity_type_enum[] = [
	'GroupMonsterKilling',
	'MonsterKilling',
	'Raids',
	'ClueCompletion'
];

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue:
		| undefined
		| [string, unknown[] | Record<string, unknown>, boolean?, string?]
		| ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null
) {
	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
		const GP = loot.amount(COINS_ID);
		if (typeof GP === 'number') {
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourcePVMLoot, GP);
		}
	}

	const clueReceived = loot ? clueTiers.find(tier => loot.amount(tier.scrollID) > 0) : undefined;

	if (clueReceived) {
		message += `\n${Emoji.Casket} **You got a ${clueReceived.name} clue scroll** in your loot.`;
		if (perkTier > PerkTier.One) {
			message += ` Say \`c\` if you want to complete this ${clueReceived.name} clue now.`;
		} else {
			message += 'You can get your minion to complete them using `+minion clue easy/medium/etc`';
		}
	}

	if (loot?.has('Unsired')) {
		message += '\n**You received an unsired!** You can offer it for loot using `+offer unsired`.';
	}

	const imp = handlePassiveImplings(user, data);
	if (imp) {
		if (imp.bank.length > 0) {
			const many = imp.bank.length > 1;
			message += `\n\nYour minion caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${
				imp.bank
			}.`;
			await user.addItemsToBank({ items: imp.bank, collectionLog: true });
		}

		if (imp.missed.length > 0) {
			message += `\n\nYou missed out on these implings, because your hunter level is too low: ${imp.missed}.`;
		}
	}

	const attachable = attachment
		? attachment instanceof MessageAttachment
			? attachment
			: new MessageAttachment(attachment)
		: undefined;

	const channel = client.channels.cache.get(channelID);

	message = await handleGrowablePetGrowth(user, data, message);

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

	if (!onContinue && !clueReceived) return;

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const onContinueFn = Array.isArray(onContinue)
		? (msg: KlasaMessage) =>
				runCommand({
					message: msg,
					commandName: onContinue[0],
					args: onContinue[1],
					isContinue: onContinue[2],
					method: onContinue[3],
					bypassInhibitors: true
				})
		: onContinue;

	if (onContinueFn) {
		lastTripCache.set(user.id, { data, continue: onContinueFn });
	}

	if (!channelIsSendable(channel)) return;
	const collector = new MessageCollector(channel, {
		filter: (mes: Message) =>
			mes.author === user && (mes.content.toLowerCase() === 'c' || stringMatches(mes.content, continuationChar)),
		time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
		max: 1
	});

	collectors.set(user.id, collector);

	collector.on('collect', async (mes: KlasaMessage) => {
		if (client.settings.get(ClientSettings.UserBlacklist).includes(mes.author.id)) return;
		if (user.minionIsBusy || client.oneCommandAtATimeCache.has(mes.author.id)) {
			collector.stop();
			collectors.delete(user.id);
			return;
		}
		try {
			if (mes.content.toLowerCase() === 'c' && clueReceived && perkTier > PerkTier.One) {
				runCommand({
					message: mes,
					commandName: 'mclue',
					args: [1, clueReceived.name],
					bypassInhibitors: true
				});
				return;
			} else if (onContinueFn && stringMatches(mes.content, continuationChar)) {
				await onContinueFn(mes).catch(err => {
					channel.send(err.message ?? err);
				});
			}
		} catch (err: any) {
			console.log({ err });
			channel.send(err);
		}
	});
}
