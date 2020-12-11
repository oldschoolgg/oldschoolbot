import { MessageAttachment } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { bankHasItem } from 'oldschooljs/dist/util';

import { continuationChars, PerkTier, Time } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { RuneTable, SeedTable } from '../simulation/seedTable';
import { ActivityTaskOptions } from '../types/minions';
import { itemNameFromID, randomItemFromArray, roll, shuffle } from '../util';
import { channelIsSendable } from './channelIsSendable';
import createReadableItemListFromBank from './createReadableItemListFromTuple';
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
	onContinue:
		| undefined
		| ((message: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: Buffer | undefined,
	data: ActivityTaskOptions
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

	const minutes = data.duration / Time.Minute;
	const pet = user.equippedPet();
	if (pet === itemID('Peky')) {
		let loot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (roll(10)) {
				loot.add(SeedTable.roll());
			}
		}
		await user.addItemsToBank(loot.bank);
		message += `\n<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${await createReadableItemListFromBank(
			client,
			loot.bank
		)}.`;
	} else if (pet === itemID('Obis')) {
		let loot = new Bank();
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			loot.add(RuneTable.roll());
		}
		await user.addItemsToBank(loot.bank);
		message += `\n<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${await createReadableItemListFromBank(
			client,
			loot.bank
		)}.`;
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
