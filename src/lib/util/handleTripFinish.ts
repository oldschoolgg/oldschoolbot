import { MessageAttachment } from 'discord.js';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { PerkTier, Time } from '../constants';
import { getRandomMysteryBox } from '../data/openables';
import { setActivityLoot } from '../settings/settings';
import { RuneTable, SeedTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { ActivityTaskOptions } from '../types/minions';
import { generateContinuationChar, itemID, roll, stringMatches } from '../util';
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
	attachment: MessageAttachment | Buffer | undefined,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	data: ActivityTaskOptions,
	loot: ItemBank | null
) {
	if (loot) {
		setActivityLoot(data.id, loot);
	}

	const perkTier = getUsersPerkTier(user);
	const continuationChar = generateContinuationChar(user);
	if (onContinue) {
		message += `\nSay \`${continuationChar}\` to repeat this trip.`;
	}

	const minutes = data.duration / Time.Minute;
	const pet = user.equippedPet();
	if (minutes < 5) {
		// Do nothing
	} else if (pet === itemID('Peky')) {
		let loot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (roll(10)) {
				loot.add(SeedTable.roll());
			}
		}
		await user.addItemsToBank(loot.bank, true);
		message += `\n<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${loot}.`;
	} else if (pet === itemID('Obis')) {
		let loot = new Bank();
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			loot.add(RuneTable.roll());
		}
		await user.addItemsToBank(loot.bank, true);
		message += `\n<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Brock')) {
		let loot = new Bank();
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			loot.add(WoodTable.roll());
		}
		await user.addItemsToBank(loot.bank, true);
		message += `\n<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Wilvus')) {
		let loot = new Bank();
		let rolls = minutes / 6;
		for (let i = 0; i < rolls; i++) {
			loot.add(WilvusTable.roll());
		}
		await user.addItemsToBank(loot.bank, true);
		message += `\n<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${loot}.`;
	} else if (pet === itemID('Smokey')) {
		let loot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (roll(450)) {
				loot.add(getRandomMysteryBox());
			}
		}
		if (loot.length > 0) {
			await user.addItemsToBank(loot.bank, true);
			message += `\n<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${loot}.`;
		}
	}

	client.queuePromise(() => {
		const channel = client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		const attachable = attachment
			? attachment instanceof MessageAttachment
				? attachment
				: new MessageAttachment(attachment)
			: undefined;
		channel.send(message, attachable);
		if (!onContinue) return;

		channel
			.awaitMessages(
				mes => mes.author === user && stringMatches(mes.content, continuationChar),
				{
					time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				}
			)
			.then(async messages => {
				const response = messages.first();
				if (
					response &&
					!user.minionIsBusy &&
					!client.oneCommandAtATimeCache.has(response.author.id)
				) {
					client.oneCommandAtATimeCache.add(response.author.id);
					try {
						await client.inhibitors.run(
							response as KlasaMessage,
							client.commands.get('mine')!
						);
						await onContinue(response as KlasaMessage).catch(err => {
							channel.send(err);
						});
					} catch (err) {
						channel.send(err);
					} finally {
						client.oneCommandAtATimeCache.delete(response.author.id);
					}
				}
			});
	});
}
