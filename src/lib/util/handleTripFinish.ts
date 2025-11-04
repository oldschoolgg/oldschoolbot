import { channelIsSendable, getNextUTCReset, makeComponents, Time } from '@oldschoolgg/toolkit';
import type { AttachmentBuilder, ButtonBuilder, MessageCollector, MessageCreateOptions } from 'discord.js';
import { Bank, EItem } from 'oldschooljs';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { combatAchievementTripEffect } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import { TEARS_OF_GUTHIX_CD } from '@/lib/events.js';
import { handleGrowablePetGrowth } from '@/lib/growablePets.js';
import { handlePassiveImplings } from '@/lib/implings.js';
import {
	BERT_SAND_BUCKETS,
	bertResetStart,
	hasBertSandAutoDelivery,
	hasCollectedThisReset,
	isManualEligible
} from '@/lib/minions/data/bertSand.js';
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
import { sendToChannelID } from '@/lib/util/webhook.js';
import { canRunAutoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import { handleTriggerShootingStar } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';
import {
	tearsOfGuthixIronmanReqs,
	tearsOfGuthixSkillReqs
} from '@/mahoji/lib/abstracted_commands/tearsOfGuthixCommand.js';

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
		name: "Bert's Sand Auto Delivery",
		fn: async ({ user, messages }) => {
			if (!hasBertSandAutoDelivery(user)) {
				return {};
			}

			const requirementError = isManualEligible(user);
			if (requirementError) {
				return {};
			}

			const now = Date.now();
			const stats = await user.fetchStats();
			const lastCollected = Number(stats.last_bert_sand_timestamp ?? 0n);

			if (hasCollectedThisReset(lastCollected, now)) {
				return {};
			}

			const updated = await prisma.userStats.updateMany({
				where: {
					user_id: BigInt(user.id),
					last_bert_sand_timestamp: { lt: BigInt(bertResetStart(now)) }
				},
				data: { last_bert_sand_timestamp: BigInt(now) }
			});

			if (updated.count === 0) {
				return {};
			}

			const loot = new Bank({ 'Bucket of sand': BERT_SAND_BUCKETS });
			await user.addItemsToBank({ items: loot, collectionLog: true });
			messages.push(`Bert delivered ${BERT_SAND_BUCKETS.toLocaleString()} Buckets of sand.`);
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
	Logging.logDebug(`Handling trip finish for ${user.logName} (${data.type})`);
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
		const start = performance.now();
		const res = await effect.fn({ data, user, loot, messages });
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
		message.content += `\n**Messages:** ${messages.join(', ')}`;
	}

	message.content += displayCluesAndPets(user, loot);

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

		const { last_tears_of_guthix_timestamp, last_daily_timestamp } = await user.fetchStats();

		// Tears of Guthix start button if ready
		if (!user.bitfield.includes(BitField.DisableTearsOfGuthixButton)) {
			const lastPlayedDate = Number(last_tears_of_guthix_timestamp);
			const nextReset = getNextUTCReset(lastPlayedDate, TEARS_OF_GUTHIX_CD);
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

		if ((await canRunAutoContract(user)) && !user.bitfield.includes(BitField.DisableAutoFarmContractButton))
			components.push(makeAutoContractButton());

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

	if (_components) {
		components.push(..._components);
	}

	handleTriggerShootingStar(user, data, components);

	if (components.length > 0) {
		message.components = makeComponents(components);
	}

	await sendToChannelID(channelID, message);
}
