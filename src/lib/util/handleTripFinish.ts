import type { ButtonBuilder } from '@oldschoolgg/discord';
import { getNextUTCReset, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import { MESSAGE_COLLECTORS_CACHE } from '@/lib/cache.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { combatAchievementTripEffect } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, CONSTANTS, PerkTier } from '@/lib/constants.js';
import { handleGrowablePetGrowth } from '@/lib/growablePets.js';
import { handlePassiveImplings } from '@/lib/implings.js';
import { MUserClass } from '@/lib/MUser.js';
import { triggerRandomEvent } from '@/lib/randomEvents.js';
import { calculateBirdhouseDetails } from '@/lib/skilling/skills/hunter/birdhouses.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { displayCluesAndPets } from '@/lib/util/displayCluesAndPets.js';
import {
	makeAutoContractButton,
	makeAutoSlayButton,
	makeBirdHouseTripButton,
	makeClaimDailyButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
	makeRepeatTripButton,
	makeTearsOfGuthixButton
} from '@/lib/util/interactions.js';
import { hasSkillReqs } from '@/lib/util/smallUtils.js';
import { canRunAutoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { handleTriggerShootingStar } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';
import {
	tearsOfGuthixIronmanReqs,
	tearsOfGuthixSkillReqs
} from '@/mahoji/lib/abstracted_commands/tearsOfGuthixCommand.js';

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
	fn: (options: TripFinishEffectOptions) => Promise<TripEffectReturn | undefined | void>;
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: async ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(EItem.COINS);
				if (typeof GP === 'number') {
					await ClientSettings.updateClientGPTrackSetting('gp_pvm', GP);
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
				await user.statsBankUpdate('passive_implings_bank', imp.bank);
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
	_channelId: string,
	_message: SendableMessage,
	_data: ActivityTaskData,
	_loot?: Bank | null,
	_messages?: string[]
): Promise<void>;

export async function handleTripFinish(params: {
	user: MUser;
	channelId: string;
	message: SendableMessage;
	data: ActivityTaskData;
	loot?: Bank | null;
	messages?: string[];
}): Promise<void>;

export async function handleTripFinish(
	userOrParams:
		| MUser
		| {
				user: MUser;
				channelId: string;
				message: SendableMessage;
				data: ActivityTaskData;
				loot?: Bank | null;
				messages?: string[];
		  },
	_channelId?: string,
	_message?: SendableMessage,
	_data?: ActivityTaskData,
	_loot?: Bank | null,
	_messages?: string[]
) {
	const {
		data,
		user,
		loot,
		channelId,
		messages: inputMessages,
		message: inputMessage
	} = userOrParams instanceof MUserClass
		? {
				user: userOrParams as MUser,
				channelId: _channelId!,
				message: _message!,
				data: _data!,
				loot: _loot!,
				messages: _messages
			}
		: userOrParams;

	Logging.logDebug(`Handling trip finish for ${user.logName} (${data.type})`);
	const message =
		inputMessage instanceof MessageBuilder
			? inputMessage
			: typeof inputMessage === 'string'
				? new MessageBuilder().setContent(inputMessage)
				: new MessageBuilder(inputMessage);

	const perkTier = await user.fetchPerkTier();
	const messages: string[] = inputMessages ?? [];

	const itemsToAddWithCL = new Bank();
	const itemsToRemove = new Bank();
	for (const effect of tripFinishEffects) {
		const start = performance.now();
		const res = await effect.fn({ data, user, loot: loot ?? null, messages });
		if (res?.itemsToAddWithCL) itemsToAddWithCL.add(res.itemsToAddWithCL);
		if (res?.itemsToRemove) itemsToRemove.add(res.itemsToRemove);
		const end = performance.now();
		const duration = end - start;
		Logging.logPerf({
			text: `TripEffect.${effect.name}`,
			duration
		});
	}
	if (itemsToAddWithCL.length > 0 || itemsToRemove.length > 0) {
		await user.transactItems({ itemsToAdd: itemsToAddWithCL, collectionLog: true, itemsToRemove });
	}

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message.addContent(`\n**Messages:** ${messages.join(', ')}`);
	}

	message.addContent(displayCluesAndPets(user, loot));

	const existingCollector = MESSAGE_COLLECTORS_CACHE.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		MESSAGE_COLLECTORS_CACHE.delete(user.id);
	}

	const components: ButtonBuilder[] = [];
	components.push(makeRepeatTripButton());
	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components.push(makeOpenCasketButton(casketReceived));
	if (perkTier > PerkTier.One) {
		components.push(...buildClueButtons(loot ?? null, perkTier, user));

		const { last_tears_of_guthix_timestamp, last_daily_timestamp } = await user.fetchStats();

		// Tears of Guthix start button if ready
		if (!user.bitfield.includes(BitField.DisableTearsOfGuthixButton)) {
			const lastPlayedDate = Number(last_tears_of_guthix_timestamp);
			const nextReset = getNextUTCReset(lastPlayedDate, CONSTANTS.TEARS_OF_GUTHIX_CD);
			const ready = nextReset < Date.now();
			const meetsSkillReqs = hasSkillReqs(user, tearsOfGuthixSkillReqs)[0];
			const meetsIronmanReqs = user.user.minion_ironman ? hasSkillReqs(user, tearsOfGuthixIronmanReqs)[0] : true;

			if (user.QP >= 43 && ready && meetsSkillReqs && meetsIronmanReqs) {
				components.push(makeTearsOfGuthixButton());
			}
		}

		// Minion daily button if ready
		if (!user.bitfield.includes(BitField.DisableDailyButton)) {
			const last = Number(last_daily_timestamp);
			const ready = last <= 0 || Date.now() - last >= Time.Hour * 12;

			if (ready) {
				components.push(makeClaimDailyButton());
			}
		}

		const birdHousedetails = calculateBirdhouseDetails(user);
		if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton))
			components.push(makeBirdHouseTripButton());

		if ((await canRunAutoContract(user)) && !user.bitfield.includes(BitField.DisableAutoFarmContractButton)) {
			components.push(makeAutoContractButton());
		}

		const { currentTask } = await user.fetchSlayerInfo();
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

	await handleTriggerShootingStar(user, data, components);

	if (components.length > 0) {
		message.addComponents(components);
	}

	await globalClient.sendMessage(channelId, message);
}
