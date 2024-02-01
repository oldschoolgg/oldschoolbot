import { activity_type_enum } from '@prisma/client';
import { AttachmentBuilder, ButtonBuilder, MessageCollector, MessageCreateOptions } from 'discord.js';
import { Bank } from 'oldschooljs';

import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { canRunAutoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { updateClientGPTrackSetting, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { ClueTiers } from '../clues/clueTiers';
import { buildClueButtons } from '../clues/clueUtils';
import { combatAchievementTripEffect } from '../combat_achievements/combatAchievements';
import { BitField, COINS_ID, Emoji, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { triggerRandomEvent } from '../randomEvents';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import { ActivityTaskData } from '../types/minions';
import { channelIsSendable, makeComponents } from '../util';
import {
	makeAutoContractButton,
	makeAutoSlayButton,
	makeBirdHouseTripButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
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

interface TripFinishEffectOptions {
	data: ActivityTaskData;
	user: MUser;
	loot: Bank | null;
	messages: string[];
}
export interface TripFinishEffect {
	name: string;
	fn: (options: TripFinishEffectOptions) => unknown;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					updateClientGPTrackSetting('gp_pvm', GP);
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
			await triggerRandomEvent(user, data.type, data.duration, messages);
		}
	},
	{
		name: 'Combat Achievements',
		fn: combatAchievementTripEffect
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	_message: string | ({ content: string } & MessageCreateOptions),
	attachment: AttachmentBuilder | Buffer | undefined,
	data: ActivityTaskData,
	loot: Bank | null,
	_messages?: string[],
	_components?: ButtonBuilder[]
) {
	const message = typeof _message === 'string' ? { content: _message } : _message;
	if (attachment) {
		!message.files ? (message.files = [attachment]) : message.files.push(attachment);
	}
	const perkTier = user.perkTier();
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });

	const clueReceived = loot ? ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0) : [];

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message.content += `\n**Messages:** ${messages.join(', ')}`;
	}

	if (clueReceived.length > 0 && perkTier < PerkTier.Two) {
		clueReceived.map(
			clue => (message.content += `\n${Emoji.Casket} **You got a ${clue.name} clue scroll** in your loot.`)
		);
	}

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	const components: ButtonBuilder[] = [];
	components.push(makeRepeatTripButton());
	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components.push(makeOpenCasketButton(casketReceived));
	if (perkTier > PerkTier.One) {
		components.push(...buildClueButtons(loot, perkTier, user));
		const birdHousedetails = await calculateBirdhouseDetails(user.id);
		if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton))
			components.push(makeBirdHouseTripButton());

		if ((await canRunAutoContract(user)) && !user.bitfield.includes(BitField.DisableAutoFarmContractButton))
			components.push(makeAutoContractButton());

		const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
		if (
			(currentTask === null || currentTask.quantity_remaining <= 0) &&
			['MonsterKilling', 'Inferno', 'FightCaves'].includes(data.type)
		) {
			components.push(makeNewSlayerTaskButton());
		} else {
			components.push(makeAutoSlayButton());
		}
		if (loot?.has('Seed pack')) {
			components.push(makeOpenSeedPackButton());
		}
	}

	if (_components) {
		components.push(..._components);
	}

	handleTriggerShootingStar(user, data, components);

	if (components.length > 0) {
		message.components = makeComponents(components);
	}

	sendToChannelID(channelID, message);
}
