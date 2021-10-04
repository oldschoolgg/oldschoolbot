import { Channel, Message, MessageCollector } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import MinionCommand from '../../commands/Minion/minion';
import { Emoji, PerkTier } from '../constants';
import ClueTiers from '../minions/data/clueTiers';
import { channelIsSendable } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { collectors } from './handleTripFinish';
import { sendToChannelID } from './webhook';

export function clueScrollinLootShortcut(
	client: KlasaClient,
	user: KlasaUser,
	channel: Channel,
	loot: ItemBank | null,
	content: string,
	image: Buffer | null
) {
	const perkTier = getUsersPerkTier(user);
	const clueReceived = loot ? ClueTiers.find(tier => loot[tier.scrollID] > 0) : undefined;

	if (clueReceived) {
		content += `\n${Emoji.Casket} **You got a ${clueReceived.name} clue scroll** in your loot.`;
		if (perkTier > PerkTier.One) {
			content += ` Say \`c\` if you want to complete this ${clueReceived.name} clue now.`;
		} else {
			content += 'You can get your minion to complete them using `+minion clue easy/medium/etc`';
		}
	}

	if (!image) return;
	sendToChannelID(client, channel.id, { content, image });

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	if (!channelIsSendable(channel)) return;
	const collector = new MessageCollector(channel, {
		filter: (mes: Message) => mes.author === user && mes.content.toLowerCase() === 'c',
		time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
		max: 1
	});

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
				(client.commands.get('minion') as unknown as MinionCommand).clue(mes, [1, clueReceived.name]);
				return;
			}
		} catch (err) {
			console.log({ err });
			channel.send(err);
		} finally {
			setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
		}
	});
}
