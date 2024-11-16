import { channelIsSendable, makeComponents } from '@oldschoolgg/toolkit/util';
import type { activity_type_enum } from '@prisma/client';
import type { AttachmentBuilder, ButtonBuilder, MessageCollector, MessageCreateOptions } from 'discord.js';
import { Bank } from 'oldschooljs';

import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { sumArr } from 'e';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { canRunAutoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { updateClientGPTrackSetting, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { ClueTiers } from '../clues/clueTiers';
import { buildClueButtons } from '../clues/clueUtils';
import { combatAchievementTripEffect } from '../combat_achievements/combatAchievements';
import { BitField, COINS_ID, Emoji, MAX_CLUES_DROPPED, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { triggerRandomEvent } from '../randomEvents';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import type { ActivityTaskData } from '../types/minions';
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

const collectors = new Map<string, MessageCollector>();

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

type TripEffectReturn = {
	itemsToAddWithCL?: Bank;
	itemsToRemove?: Bank;
};

export interface TripFinishEffect {
	name: string;
	// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
	fn: (options: TripFinishEffectOptions) => Promise<TripEffectReturn | undefined | void>;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: async ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					await updateClientGPTrackSetting('gp_pvm', GP);
				}
			}
			return {};
		}
	},
	{
		name: 'Implings',
		fn: async ({ data, messages, user }) => {
			const imp = handlePassiveImplings(user, data);
			if (imp && imp.bank.length > 0) {
				const many = imp.bank.length > 1;
				messages.push(`Caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${imp.bank}`);
				await userStatsBankUpdate(user, 'passive_implings_bank', imp.bank);
				return {
					itemsToAddWithCL: imp.bank
				};
			}
			return {};
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
			return triggerRandomEvent(user, data.type, data.duration, messages);
		}
	},
	{
		name: 'Combat Achievements',
		fn: async options => {
			return combatAchievementTripEffect(options);
		}
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	_message: string | ({ content: string } & MessageCreateOptions),
	attachment:
		| AttachmentBuilder
		| Buffer
		| undefined
		| {
				name: string;
				attachment: Buffer;
		  },
	data: ActivityTaskData,
	loot: Bank | null,
	_messages?: string[],
	_components?: ButtonBuilder[]
) {
	const message = typeof _message === 'string' ? { content: _message } : _message;
	if (attachment) {
		if (!message.files) {
			message.files = [attachment];
		} else if (Array.isArray(message.files)) {
			message.files.push(attachment);
		} else {
			console.warn(`Unexpected attachment type in handleTripFinish: ${typeof attachment}`);
		}
	}
	const perkTier = user.perkTier();
	const messages: string[] = [];

	const itemsToAddWithCL = new Bank();
	const itemsToRemove = new Bank();
	for (const effect of tripFinishEffects) {
		const stopwatch = new Stopwatch().start();
		const res = await effect.fn({ data, user, loot, messages });
		if (res?.itemsToAddWithCL) itemsToAddWithCL.add(res.itemsToAddWithCL);
		if (res?.itemsToRemove) itemsToRemove.add(res.itemsToRemove);
		stopwatch.stop();
		if (stopwatch.duration > 500) {
			debugLog(`Finished ${effect.name} trip effect for ${user.id} in ${stopwatch}`);
		}
	}
	if (itemsToAddWithCL.length > 0 || itemsToRemove.length > 0) {
		await user.transactItems({ itemsToAdd: itemsToAddWithCL, collectionLog: true, itemsToRemove });
	}

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

	if (sumArr(ClueTiers.map(t => user.bank.amount(t.scrollID))) >= MAX_CLUES_DROPPED) {
		messages.push(
			`You cannot stack anymore clue scrolls (${ClueTiers.map(tier => `${user.bank.amount(tier.scrollID)} ${tier.name}`)}), you can't hold anymore than this, but lower tier clues will be replaced with higher tier clues.`
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
		const birdHousedetails = await calculateBirdhouseDetails(user);
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
		} else if (!user.bitfield.includes(BitField.DisableAutoSlayButton)) {
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
