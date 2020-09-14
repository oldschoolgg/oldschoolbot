import { KlasaClient, KlasaUser, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';

import { randomItemFromArray } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { Time, PerkTier, alphaNumericalChars } from '../constants';
import { channelIsSendable } from './channelIsSendable';

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue?: (message: KlasaMessage) => void,
	attachment?: Buffer
) {
	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return;

	const perkTier = getUsersPerkTier(user);
	const continuationChar =
		perkTier > PerkTier.Two ? 'y' : randomItemFromArray(alphaNumericalChars);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	client.queuePromise(async () => {
		channel.send(message, attachment ? new MessageAttachment(attachment) : undefined);

		if (!onContinue) return;

		const messages = await channel.awaitMessages(
			mes => mes.author === user && mes.content?.toLowerCase() === continuationChar,
			{
				time: perkTier > PerkTier.Two ? Time.Minute * 10 : Time.Minute * 2,
				max: 1
			}
		);

		const response = messages.first();
		if (response && !user.minionIsBusy) {
			try {
				onContinue(response as KlasaMessage);
			} catch (err) {
				channel.send(err);
			}
		}
	});
}
