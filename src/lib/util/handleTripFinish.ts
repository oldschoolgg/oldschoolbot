import { activity_type_enum } from '@prisma/client';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { MessageAttachment, MessageCollector, MessageOptions } from 'discord.js';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { updateGPTrackSetting, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { ClueTiers } from '../clues/clueTiers';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { COINS_ID, Emoji, lastTripCache, LastTripRunArgs, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { triggerRandomEvent } from '../randomEvents';
import { runCommand } from '../settings/settings';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import {
	makeBirdHouseTripButton,
	makeDoClueButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeRepeatTripButton
} from './globalInteractions';
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
				userStatsBankUpdate(user.id, 'passive_implings_bank', imp.bank);
				await transactItems({ userID: user.id, itemsToAdd: imp.bank, collectionLog: true });
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
		| [string, Record<string, unknown>, boolean?, string?]
		| ((args: LastTripRunArgs) => Promise<CommandResponse | null>),
	attachment: MessageAttachment | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null,
	_messages?: string[]
) {
	const perkTier = getUsersPerkTier(user);
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });

	const clueReceived = loot ? ClueTiers.find(tier => loot.amount(tier.scrollID) > 0) : undefined;

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	if (clueReceived && perkTier < PerkTier.Two) {
		message += `\n${Emoji.Casket} **You got a ${clueReceived.name} clue scroll** in your loot.`;
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
	const birdHousedetails = await calculateBirdhouseDetails(user.id);
	if (birdHousedetails.isReady && perkTier > PerkTier.One) components[0].push(makeBirdHouseTripButton());
	const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
	if (
		(currentTask === null || currentTask.quantity_remaining <= 0) &&
		perkTier > PerkTier.One &&
		data.type === 'MonsterKilling'
	) {
		components[0].push(makeNewSlayerTaskButton());
	}
	handleTriggerShootingStar(user, data, components);

	sendToChannelID(channelID, {
		content: message,
		image: attachment,
		components: components[0].length > 0 ? components : undefined
	});
}
