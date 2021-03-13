import { Message, MessageAttachment, MessageCollector } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { Emoji, PerkTier, Time } from '../constants';
import clueTiers from '../minions/data/clueTiers';
import { setActivityLoot } from '../settings/settings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, stringMatches } from '../util';
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
	_data: ActivityTaskOptions,
	loot: ItemBank | null
) {
	if (loot) {
		setActivityLoot(_data.id, loot);
	}

	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
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
