import { activity_type_enum } from '@prisma/client';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { MessageAttachment, MessageCollector, MessageOptions } from 'discord.js';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { COINS_ID, lastTripCache, LastTripRunArgs, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import ClueTiers from '../minions/data/clueTiers';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, updateGPTrackSetting } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import { makeDoClueButton, makeOpenCasketButton, makeRepeatTripButton } from './globalInteractions';
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
					updateGPTrackSetting('gp_pvm', GP);
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
		| ((args: LastTripRunArgs) => Promise<KlasaMessage | KlasaMessage[] | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null
) {
	const perkTier = getUsersPerkTier(user);
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });

	const clueReceived = loot ? ClueTiers.find(tier => loot.amount(tier.scrollID) > 0) : undefined;

	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	const runCmdOptions = {
		channelID,
		userID: user.id,
		guildID: isGuildBasedChannel(channel) && channel.guild ? channel.guild.id : undefined,
		user,
		member: null
	};

	const onContinueFn = Array.isArray(onContinue)
		? (args: LastTripRunArgs) =>
				runCommand({
					commandName: onContinue[0],
					args: onContinue[1],
					isContinue: onContinue[2],
					method: onContinue[3],
					bypassInhibitors: true,
					...runCmdOptions,
					...args
				})
		: onContinue;

	if (onContinueFn) lastTripCache.set(user.id, { data, continue: onContinueFn });
	const components: MessageOptions['components'] = [[]];
	if (onContinueFn) components[0].push(makeRepeatTripButton());
	if (clueReceived && perkTier > PerkTier.One) components[0].push(makeDoClueButton(clueReceived));

	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components[0].push(makeOpenCasketButton(casketReceived));
	sendToChannelID(channelID, {
		content: message,
		image: attachment,
		components: components[0].length > 0 ? components : undefined
	});
}
