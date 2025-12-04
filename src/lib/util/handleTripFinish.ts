import type { ButtonBuilder } from '@oldschoolgg/discord';
import { getNextUTCReset } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import type { MessageBuilderClass } from '@/discord/MessageBuilder.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { combatAchievementTripEffect } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, CONSTANTS, PerkTier } from '@/lib/constants.js';
import { handleGrowablePetGrowth } from '@/lib/growablePets.js';
import { handlePassiveImplings } from '@/lib/implings.js';
import { MUserClass } from '@/lib/MUser.js';
import { triggerRandomEvent } from '@/lib/randomEvents.js';
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
import { isUsersDailyReady } from '@/mahoji/lib/abstracted_commands/dailyCommand.js';
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
	components: ButtonBuilder[];
	lastDailyTimestamp: bigint | null;
	lastTearsOfGuthixTimestamp: bigint | null;
	perkTier: PerkTier | 0;
}

type TripEffectReturn = {
	itemsToAddWithCL?: Bank;
	itemsToRemove?: Bank;
};

export interface TripFinishEffect {
	name: string;
	requiredPerkTier?: PerkTier;
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
	},
	{
		name: 'Shooting Stars',
		fn: async ({ user, data, components }) => {
			await handleTriggerShootingStar(user, data, components);
		}
	},
	{
		name: 'Open Casket Button',
		fn: async ({ loot, components }) => {
			const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
			if (casketReceived) components.push(makeOpenCasketButton(casketReceived));
		}
	},
	{
		name: 'Birdhouse Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components }) => {
			const birdHousedetails = user.fetchBirdhouseData();
			if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton)) {
				components.push(makeBirdHouseTripButton());
			}
		}
	},
	{
		name: 'Autocontract Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components }) => {
			if (user.bitfield.includes(BitField.DisableAutoFarmContractButton)) return;
			const canRun = Boolean(await canRunAutoContract(user));
			if (!canRun) return;
			components.push(makeAutoContractButton());
		}
	},
	{
		name: 'Claim Daily Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components }) => {
			if (user.bitfield.includes(BitField.DisableDailyButton)) return;
	
			const { isReady } = await isUsersDailyReady(user);
			if (isReady) {
				components.push(makeClaimDailyButton());
			}
		}
	},
	{
		name: 'Tears of Guthix Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components, lastTearsOfGuthixTimestamp }) => {
			if (user.bitfield.includes(BitField.DisableTearsOfGuthixButton)) return;
			const lastPlayedDate = Number(lastTearsOfGuthixTimestamp);
			const nextReset = getNextUTCReset(lastPlayedDate, CONSTANTS.TEARS_OF_GUTHIX_CD);
			const ready = nextReset < Date.now();
			const meetsSkillReqs = hasSkillReqs(user, tearsOfGuthixSkillReqs)[0];
			const meetsIronmanReqs = user.user.minion_ironman ? hasSkillReqs(user, tearsOfGuthixIronmanReqs)[0] : true;

			if (user.QP >= 43 && ready && meetsSkillReqs && meetsIronmanReqs) {
				components.push(makeTearsOfGuthixButton());
			}
		}
	},
	{
		name: 'Clue Buttons',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components, loot, perkTier }) => {
			components.push(...buildClueButtons(loot ?? null, perkTier, user));
		}
	},
	{
		name: 'Slayer Task Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ user, components, data }) => {
			const { currentTask } = await user.fetchSlayerInfo();
			if (
				(currentTask === null || currentTask.quantity_remaining <= 0) &&
				['MonsterKilling', 'Inferno', 'FightCaves'].includes(data.type)
			) {
				components.push(makeNewSlayerTaskButton());
			} else if (!user.bitfield.includes(BitField.DisableAutoSlayButton)) {
				components.push(makeAutoSlayButton());
			}
		}
	},
	{
		name: 'Open Seed Pack Button',
		requiredPerkTier: PerkTier.Two,
		fn: async ({ components, loot }) => {
			if (loot?.has('Seed pack')) {
				components.push(makeOpenSeedPackButton());
			}
		}
	}
];

type OSBSendableMessage = string | MessageBuilderClass | BaseSendableMessage;

export async function handleTripFinish(
	user: MUser,
	_channelId: string,
	_message: OSBSendableMessage,
	_data: ActivityTaskData,
	_loot?: Bank | null,
	_messages?: string[]
): Promise<void>;

export async function handleTripFinish(params: {
	user: MUser;
	channelId: string;
	message: OSBSendableMessage;
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
				message: OSBSendableMessage;
				data: ActivityTaskData;
				loot?: Bank | null;
				messages?: string[];
		  },
	_channelId?: string,
	_message?: OSBSendableMessage,
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

	const { last_tears_of_guthix_timestamp, last_daily_timestamp } =
		perkTier > PerkTier.One
			? await user.fetchStats()
			: { last_tears_of_guthix_timestamp: null, last_daily_timestamp: null };

	const messages: string[] = inputMessages ?? [];

	const components: ButtonBuilder[] = [];
	components.push(makeRepeatTripButton());

	const itemsToAddWithCL = new Bank();
	const itemsToRemove = new Bank();
	for (const effect of tripFinishEffects) {
		if (effect.requiredPerkTier && perkTier < effect.requiredPerkTier) continue;
		const start = performance.now();
		const res = await effect.fn({
			data,
			user,
			loot: loot ?? null,
			components,
			messages,
			lastDailyTimestamp: last_daily_timestamp,
			lastTearsOfGuthixTimestamp: last_tears_of_guthix_timestamp,
			perkTier
		});
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

	if (components.length > 0) {
		message.addComponents(components);
	}

	message.addAllowedUserMentions([user.id]);
	if ('users' in data) {
		message.addAllowedUserMentions(data.users);
	}

	await globalClient.sendMessageOrWebhook(channelId, message);
}
