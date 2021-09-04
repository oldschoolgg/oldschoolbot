import { Message, MessageCollector } from 'discord.js';
import { Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';

import { client } from '../../index';
import { PerkTier } from '../constants';
import { channelIsSendable, stringMatches } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { collectors } from './handleTripFinish';

export function createCollector(params: {
	user: KlasaUser;
	continuationCharacter: string[];
	channelID: string;
	toExecute: (message: KlasaMessage, collector: MessageCollector) => Promise<void>;
}) {
	const { user, continuationCharacter, channelID, toExecute } = params;
	const channel = client.channels.cache.get(channelID);
	const existingCollector = collectors.get(user.id);
	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}
	if (!channelIsSendable(channel)) return;
	const perkTier = getUsersPerkTier(user);
	const collector = new MessageCollector(channel, {
		filter: (mes: Message) => mes.author === user && continuationCharacter.some(c => stringMatches(c, mes.content)),
		time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
		max: 1
	});
	collectors.set(user.id, collector);
	collector.on('collect', async (mes: KlasaMessage) => {
		await toExecute(mes, collector);
	});
}
