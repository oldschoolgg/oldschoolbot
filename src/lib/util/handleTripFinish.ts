import { activity_type_enum } from '@prisma/client';
import { Message, MessageAttachment, MessageCollector, TextChannel } from 'discord.js';
import { randInt, Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { alching } from '../../commands/Minion/laps';
import { BitField, COINS_ID, Emoji, lastTripCache, PerkTier } from '../constants';
import { getRandomMysteryBox } from '../data/openables';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import clueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { ClientSettings } from '../settings/types/ClientSettings';
import { RuneTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { DougTable, PekyTable } from '../simulation/sharedTables';
import { ActivityTaskOptions } from '../types/minions';
import {
	channelIsSendable,
	generateContinuationChar,
	itemID,
	roll,
	stringMatches,
	updateBankSetting,
	updateGPTrackSetting
} from '../util';
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

	const pet = user.equippedPet();

	if (
		loot &&
		!['GroupMonsterKilling', 'KingGoldemar', 'Ignecarus', 'Inferno', 'Alching', 'Agility'].includes(data.type) &&
		data.duration > Time.Minute * 20 &&
		roll(pet === itemID('Mr. E') ? 12 : 15)
	) {
		const otherLoot = new Bank().add(getRandomMysteryBox());
		const bonusLoot = new Bank().add(loot).add(otherLoot);
		message += `\n<:mysterybox:680783258488799277> **You received 2x loot and ${otherLoot}.**`;
		await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
		updateBankSetting(client, ClientSettings.EconomyStats.TripDoublingLoot, bonusLoot);
	}

	const minutes = data.duration / Time.Minute;
	let bonusLoot = new Bank();
	if (minutes < 5) {
		// Do nothing
	} else if (pet === itemID('Peky')) {
		for (let i = 0; i < minutes; i++) {
			if (roll(10)) {
				bonusLoot.add(PekyTable.roll());
			}
		}
		message += `\n<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${bonusLoot}.`;
	} else if (pet === itemID('Obis')) {
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(RuneTable.roll());
		}
		message += `\n<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Brock')) {
		let rolls = minutes / 3;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WoodTable.roll());
		}
		message += `\n<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Wilvus')) {
		let rolls = minutes / 6;
		for (let i = 0; i < rolls; i++) {
			bonusLoot.add(WilvusTable.roll());
		}
		message += `\n<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Smokey')) {
		for (let i = 0; i < minutes; i++) {
			if (roll(450)) {
				bonusLoot.add(getRandomMysteryBox());
			}
		}
		if (bonusLoot.length > 0) {
			message += `\n<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${bonusLoot}.`;
		}
	} else if (pet === itemID('Doug')) {
		for (let i = 0; i < minutes / 2; i++) {
			bonusLoot.add(DougTable.roll());
		}

		message += `\nDoug did some mining while you were on your trip and got you: ${bonusLoot}.`;
	} else if (pet === itemID('Harry')) {
		for (let i = 0; i < minutes; i++) {
			bonusLoot.add('Banana', randInt(1, 3));
		}

		message += `\n<:harry:749945071104819292>: ${bonusLoot}.`;
	}

	if (bonusLoot.length > 0) {
		if (bonusLoot.has('Coins')) {
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourcePet, bonusLoot.amount('Coins'));
		}
		await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
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

	if (user.allItemsOwned().has('Voidling')) {
		const voidlingEquipped = user.usingPet('Voidling');
		const alchResult = alching({
			user,
			tripLength: voidlingEquipped
				? data.duration * (user.hasItemEquippedAnywhere('Magic master cape') ? 3 : 1)
				: data.duration / (user.hasItemEquippedAnywhere('Magic master cape') ? 1 : randInt(6, 7)),
			isUsingVoidling: true,
			flags: { alch: 'yes' }
		});
		if (alchResult !== null) {
			if (!user.owns(alchResult.bankToRemove)) {
				message += `Your Voidling couldn't do any alching because you don't own ${alchResult.bankToRemove}.`;
			}
			await user.removeItemsFromBank(alchResult.bankToRemove);
			updateBankSetting(client, ClientSettings.EconomyStats.MagicCostBank, alchResult.bankToRemove);

			const alchGP = alchResult.itemToAlch.highalch * alchResult.maxCasts;
			await user.addGP(alchGP);
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceAlching, alchGP);
			message += `\nYour Voidling alched ${alchResult.maxCasts}x ${alchResult.itemToAlch.name}. Removed ${
				alchResult.bankToRemove
			} from your bank and added ${toKMB(alchGP)} GP. ${
				!voidlingEquipped && !user.hasItemEquippedAnywhere('Magic master cape')
					? "As you left your Voidling alone in the bank, it got distracted easily and didn't manage to alch at its full potential."
					: ''
			}${
				user.hasItemEquippedAnywhere('Magic master cape')
					? '\nVoidling notices your Magic Master cape and wants to be just like you. Voidling is now alching much faster!'
					: ''
			}`;
		} else if (user.getUserFavAlchs().length !== 0) {
			message +=
				"\nYour Voidling didn't alch anything because you either don't have any nature runes or fire runes.";
		}
	}

	const imp = await handlePassiveImplings(user, data);
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

	const onContinueFn = Array.isArray(onContinue) ? (msg: KlasaMessage) => runCommand(msg, ...onContinue) : onContinue;

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
				runCommand(mes, 'mclue', [1, clueReceived.name]);
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
