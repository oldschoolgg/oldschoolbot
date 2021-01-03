import { MessageAttachment } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';

import MinionCommand from '../../commands/Minion/minion';
import clueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { continuationChars, Emoji, PerkTier, Time } from '../constants';
import { ActivityTaskOptions } from '../types/minions';
import { randomItemFromArray } from '../util';
import { ItemBank } from './../types';
import { channelIsSendable } from './channelIsSendable';
import getUsersPerkTier from './getUsersPerkTier';

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue:
		| undefined
		| ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	_data: ActivityTaskOptions,
	attachment?: Buffer,
	loot?: ItemBank
) {
	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return;

	const perkTier = getUsersPerkTier(user);
	const continuationChar = perkTier > PerkTier.One ? 'y' : randomItemFromArray(continuationChars);
	let clueTiersReceived: ClueTier[] = [];
	loot
		? (clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0))
		: (clueTiersReceived = []);

	if (loot) {
		clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);
		if (clueTiersReceived.length > 0) {
			message += `\n ${
				Emoji.Casket
			} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(', ')}).`;
			if (perkTier > PerkTier.One) {
				message += `\n\nSay \`c\` if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				message += `\n\nYou can get your minion to complete them using \`+minion clue easy/medium/etc\``;
			}
		}
	}

	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	client.queuePromise(() => {
		channel.send(message, attachment ? new MessageAttachment(attachment) : undefined);

		if (!onContinue) return;

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
			.then(async messages => {
				const response = messages.first();

				if (response && !user.minionIsBusy) {
					if (
						clueTiersReceived.length > 0 &&
						perkTier > PerkTier.One &&
						response.content.toLowerCase() === 'c'
					) {
						(client.commands.get(
							'minion'
						) as MinionCommand).clue(response as KlasaMessage, [
							1,
							clueTiersReceived[0].name
						]);
					} else {
						try {
							await onContinue(response as KlasaMessage).catch(err => {
								channel.send(err);
							});
						} catch (err) {
							channel.send(err);
						}
					}
				}
			});
	});
}
