import { activity_type_enum } from '@prisma/client';
import { Message, MessageAttachment, MessageCollector } from 'discord.js';
import { Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { COINS_ID, Emoji, lastTripCache, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import clueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { ClientSettings } from '../settings/types/ClientSettings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, generateContinuationChar, stringMatches, updateGPTrackSetting } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { logError } from './logError';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource: activity_type_enum[] = [
	'GroupMonsterKilling',
	'MonsterKilling',
	'Raids',
	'ClueCompletion'
];

const tripFinishEffects: {
	name: string;
	fn: (options: { data: ActivityTaskOptions; user: KlasaUser; loot: Bank | null; messages: string[] }) => unknown;
}[] = [
	{
		name: 'Track GP Analytics',
		fn: ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					updateGPTrackSetting(globalClient, ClientSettings.EconomyStats.GPSourcePVMLoot, GP);
				}
			}
		}
	},
	{
		name: 'Implings',
		fn: async ({ data, messages, user }) => {
			const imp = handlePassiveImplings(user, data);
			if (imp && imp.bank.length > 0) {
				const many = imp.bank.length > 1;
				messages.push(`Caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${imp.bank}`);
				await user.addItemsToBank({ items: imp.bank, collectionLog: true });
			}
		}
	},
	{
		name: 'Growable Pets',
		fn: async ({ data, messages, user }) => {
			await handleGrowablePetGrowth(user, data, messages);
		}
	},
	{
		name: 'Random Events',
		fn: async ({ data, messages, user }) => {
			await triggerRandomEvent(user, data.duration, messages);
		}
	}
];

export async function handleTripFinish(
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
	const messages: string[] = [];
	if (onContinue) {
		messages.push(`Say \`${continuationChar}\` to repeat this trip`);
	}
	await Promise.all(tripFinishEffects.map(effect => effect.fn({ data, user, loot, messages })));

	const clueReceived = loot ? clueTiers.find(tier => loot.amount(tier.scrollID) > 0) : undefined;

	if (clueReceived) {
		if (perkTier > PerkTier.One) {
			messages.push(`${Emoji.Casket} **Got a ${clueReceived.name} clue**, say \`c\` to complete it now`);
		} else {
			messages.push(
				`${Emoji.Casket} **Got a ${clueReceived.name} clue**, complete it using \`+minion clue ${clueReceived.name}\``
			);
		}
	}

	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	sendToChannelID(channelID, { content: message, image: attachment });
	if (!onContinue && !clueReceived) return;

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const onContinueFn = Array.isArray(onContinue)
		? (msg: KlasaMessage) =>
				runCommand({
					message: msg,
					commandName: onContinue[0],
					args: onContinue[1],
					isContinue: onContinue[2],
					method: onContinue[3],
					bypassInhibitors: true
				})
		: onContinue;

	if (onContinueFn) {
		lastTripCache.set(user.id, { data, continue: onContinueFn });
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;
	const collector = new MessageCollector(channel, {
		filter: (mes: Message) =>
			mes.author === user && (mes.content.toLowerCase() === 'c' || stringMatches(mes.content, continuationChar)),
		time: perkTier > PerkTier.One ? Time.Minute * 10 : Time.Minute * 2,
		max: 1
	});

	collectors.set(user.id, collector);

	collector.on('collect', async (mes: KlasaMessage) => {
		if (globalClient.settings.get(ClientSettings.UserBlacklist).includes(mes.author.id)) return;
		if (user.minionIsBusy || globalClient.oneCommandAtATimeCache.has(mes.author.id)) {
			collector.stop();
			collectors.delete(user.id);
			return;
		}
		try {
			if (mes.content.toLowerCase() === 'c' && clueReceived && perkTier > PerkTier.One) {
				runCommand({
					message: mes,
					commandName: 'mclue',
					args: [1, clueReceived.name],
					bypassInhibitors: true
				});
				return;
			} else if (onContinueFn && stringMatches(mes.content, continuationChar)) {
				await onContinueFn(mes).catch(err => {
					channel.send(err.message ?? err);
				});
			}
		} catch (err: any) {
			logError(err, {
				user_id: user.id,
				type: data.type
			});
			channel.send(err);
		}
	});
}
