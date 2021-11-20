import { Message, MessageAttachment, MessageCollector, TextChannel } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { itemID } from 'oldschooljs/dist/util';

import MinionCommand from '../../commands/Minion/minion';
import { BitField, COINS_ID, Emoji, lastTripCache, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import clueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { ClientSettings } from '../settings/types/ClientSettings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, roll, stringMatches, updateGPTrackSetting } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { sendToChannelID } from './webhook';
import { activity_type_enum } from '.prisma/client';

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
	onContinue: undefined | ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: ItemBank | null
) {
	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
		const GP = loot[COINS_ID];
		if (typeof GP === 'number') {
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourcePVMLoot, GP);
		}
	}

	const clueReceived = loot ? clueTiers.find(tier => loot[tier.scrollID] > 0) : undefined;
	const unsiredReceived = loot ? loot[itemID('Unsired')] > 0 : undefined;

	if (clueReceived) {
		message += `\n${Emoji.Casket} **You got a ${clueReceived.name} clue scroll** in your loot.`;
		if (perkTier > PerkTier.One) {
			message += ` Say \`c\` if you want to complete this ${clueReceived.name} clue now.`;
		} else {
			message += 'You can get your minion to complete them using `+minion clue easy/medium/etc`';
		}
	}

	if (unsiredReceived) {
		message += '\n**You received an unsired!** You can offer it for loot using `+offer unsired`.';
	}

	const imp = handlePassiveImplings(user, data);
	if (imp) {
		if (imp.bank.length > 0) {
			const many = imp.bank.length > 1;
			message += `\n\nYour minion caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${
				imp.bank
			}.`;
			await user.addItemsToBank(imp.bank, true);
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

	if (onContinue) {
		lastTripCache.set(user.id, { data, continue: onContinue });
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
		client.oneCommandAtATimeCache.add(mes.author.id);
		try {
			if (mes.content.toLowerCase() === 'c' && clueReceived && perkTier > PerkTier.One) {
				(client.commands.get('minion') as unknown as MinionCommand).clue(mes, [1, clueReceived.name]);
				return;
			} else if (onContinue && stringMatches(mes.content, continuationChar)) {
				await onContinue(mes).catch(err => {
					channel.send(err);
				});
			}
		} catch (err) {
			console.log({ err });
			channel.send(err);
		} finally {
			setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
		}
	});
}
