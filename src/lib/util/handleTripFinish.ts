import { MessageAttachment } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { bankHasItem } from 'oldschooljs/dist/util';

import { continuationChars, PerkTier, Time } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { itemNameFromID, percentChance, randomItemFromArray, shuffle } from '../util';
import { channelIsSendable } from './channelIsSendable';
import getUsersPerkTier from './getUsersPerkTier';
import itemID from './itemID';
import resolveItems from './resolveItems';

const santaItems = resolveItems([
	'Santa mask',
	'Santa jacket',
	'Santa pantaloons',
	'Santa gloves',
	'Santa boots'
]);

export async function handleTripFinish(
	client: KlasaClient,
	user: KlasaUser,
	channelID: string,
	message: string,
	onContinue?: (message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>,
	attachment?: Buffer
) {
	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return;

	const perkTier = getUsersPerkTier(user);
	const continuationChar = perkTier > PerkTier.One ? 'y' : randomItemFromArray(continuationChars);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	// Christmas code
	const _bank = user.settings.get(UserSettings.Bank);
	if (bankHasItem(_bank, itemID('Carrot'))) {
		if (percentChance(100)) {
			for (const item of shuffle(santaItems)) {
				if (user.hasItemEquippedOrInBank(item)) continue;
				await user.removeItemFromBank(itemID('Carrot'));
				await user.addItemsToBank({ [item]: 1 }, true);
				message += `\n🦌 You found one of Santa's reindeer! They've eaten a Carrot from your bank and given you: ${itemNameFromID(
					item
				)}.`;
				break;
			}
		}
	}

	client.queuePromise(() => {
		channel.send(message, attachment ? new MessageAttachment(attachment) : undefined);

		if (!onContinue) return;

		channel
			.awaitMessages(
				mes => mes.author === user && mes.content?.toLowerCase() === continuationChar,
				{
					time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				}
			)
			.then(async messages => {
				const response = messages.first();
				if (response && !user.minionIsBusy) {
					try {
						await onContinue(response as KlasaMessage).catch(err => {
							channel.send(err);
						});
					} catch (err) {
						channel.send(err);
					}
				}
			});
	});
}
