import { formatDuration, increaseNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import Runecraft from '@/lib/skilling/skills/runecraft.js';
import type { OuraniaAltarOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import {
	getZeroTimeActivityPreferences,
	prepareZeroTimeActivityTrip,
	resolveConfiguredFletchItemsPerHour
} from '@/lib/util/zeroTimeActivity.js';

const gracefulPenalty = 20;
export const OURANIA_ALTAR_FLETCH_CAP_PER_HOUR = 9000;
export const OURANIA_ALTAR_FLETCH_INVENTORY_SPACES = 3;

export interface OuraniaAltarEssencePlan {
	quantity: number;
	numberOfInventories: number;
	duration: number;
}

export function calculateOuraniaAltarEssencePlan({
	requestedQuantity,
	inventorySize,
	maxTripLength,
	timePerTrip,
	pureEssenceOwned,
	daeyaltEssenceOwned,
	useDaeyaltEssence,
	minionName
}: {
	requestedQuantity?: number;
	inventorySize: number;
	maxTripLength: number;
	timePerTrip: number;
	pureEssenceOwned: number;
	daeyaltEssenceOwned: number;
	useDaeyaltEssence: boolean;
	minionName: string;
}): OuraniaAltarEssencePlan | string {
	const maxCanDo = Math.floor(maxTripLength / timePerTrip) * inventorySize;
	let plannedEssenceQuantity = requestedQuantity;

	// If no quantity provided, set it to the max.
	if (useDaeyaltEssence) {
		if (!plannedEssenceQuantity) plannedEssenceQuantity = Math.min(daeyaltEssenceOwned, maxCanDo);
		if (daeyaltEssenceOwned === 0 || plannedEssenceQuantity === 0 || daeyaltEssenceOwned < plannedEssenceQuantity) {
			return "You don't have enough Daeyalt Essence to craft these runes. You can acquire Daeyalt Shards through Mining, and then exchange for essence with the `/create` command.";
		}
	} else {
		if (!plannedEssenceQuantity) plannedEssenceQuantity = Math.min(pureEssenceOwned, maxCanDo);

		if (pureEssenceOwned === 0 || plannedEssenceQuantity === 0 || pureEssenceOwned < plannedEssenceQuantity) {
			return "You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players.";
		}
	}

	const plannedNumberOfInventories = Math.max(Math.ceil(plannedEssenceQuantity / inventorySize), 1);
	const plannedDuration = plannedNumberOfInventories * timePerTrip;

	if (plannedDuration > maxTripLength) {
		return `${minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of essence you can craft is ${Math.floor(maxCanDo)}.`;
	}

	return {
		quantity: plannedEssenceQuantity,
		numberOfInventories: plannedNumberOfInventories,
		duration: plannedDuration
	};
}

export async function ouraniaAltarStartCommand({
	user,
	channelId,
	quantity,
	usestams,
	daeyalt_essence
}: {
	user: MUser;
	channelId: string;
	quantity?: number;
	usestams?: boolean;
	daeyalt_essence?: boolean;
}) {
	let timePerTrip = Time.Minute * 1.05;
	const stamina: boolean = usestams !== undefined ? usestams : true;
	const daeyalt = daeyalt_essence || false;
	const requestedQuantity = quantity;

	const { bank } = user;
	const numEssenceOwned = bank.amount('Pure essence');
	const daeyaltEssenceOwned = bank.amount('Daeyalt essence');
	const boosts = [];
	const notes = [];
	const mageLvl = user.skillsAsLevels.magic;
	const spellbookSwap = mageLvl > 95;

	let inventorySize = 28;
	// For each pouch the user has, increase their inventory size.
	for (const pouch of Runecraft.pouches) {
		if (user.skillsAsLevels.runecraft < pouch.level) continue;
		if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
		if (bank.has(pouch.id) && pouch.id === EItem.COLOSSAL_POUCH) break;
	}

	if (inventorySize > 28) boosts.push(`+${inventorySize - 28} inv spaces from pouches`);

	if (!user.hasGracefulEquipped() && !spellbookSwap) {
		boosts.push(`${gracefulPenalty}% slower without Graceful or Spellbook Swap`);
		timePerTrip = increaseNumByPercent(timePerTrip, gracefulPenalty);
	}

	if (mageLvl < 71 && user.QP < 120) {
		boosts.push('50% slower for not having the Ourania Teleport Spell');
		timePerTrip = increaseNumByPercent(timePerTrip, 50);
	}

	if (stamina || spellbookSwap) {
		timePerTrip *= 0.8;
	}

	if (user.hasEquippedOrInBank(['Ring of endurance'])) {
		boosts.push('2% faster for Ring of Endurance');
		timePerTrip *= 0.98;
	}

	const maxTripLength = await user.calcMaxTripLength('OuraniaAltar');
	const preferences = getZeroTimeActivityPreferences(user);
	const zeroTimeOptions = {
		user,
		preferences,
		alch: { disabledReason: 'Alching is unavailable while runecrafting at the Ourania Altar.' },
		fletch: {
			itemsPerHour: (preference: (typeof preferences)[number]) => {
				const configuredRate = resolveConfiguredFletchItemsPerHour(preference);
				if (!configuredRate) return undefined;
				return Math.min(configuredRate, OURANIA_ALTAR_FLETCH_CAP_PER_HOUR);
			}
		}
	};

	const buildEssencePlan = (essenceInventorySize: number) => {
		return calculateOuraniaAltarEssencePlan({
			requestedQuantity,
			inventorySize: essenceInventorySize,
			maxTripLength,
			timePerTrip,
			pureEssenceOwned: numEssenceOwned,
			daeyaltEssenceOwned,
			useDaeyaltEssence: daeyalt_essence ?? false,
			minionName: user.minionName
		});
	};

	let essencePlan = buildEssencePlan(inventorySize);
	if (typeof essencePlan === 'string') return essencePlan;

	const initialZeroTimeResult = await prepareZeroTimeActivityTrip({
		...zeroTimeOptions,
		duration: essencePlan.duration
	});

	if (initialZeroTimeResult.fletchResult) {
		inventorySize -= OURANIA_ALTAR_FLETCH_INVENTORY_SPACES;
		notes.push(`${OURANIA_ALTAR_FLETCH_INVENTORY_SPACES} inv spaces used by zero-time fletching`);

		essencePlan = buildEssencePlan(inventorySize);
		if (typeof essencePlan === 'string') return essencePlan;
	}

	const { quantity: essenceQuantity, numberOfInventories, duration } = essencePlan;

	const totalCost = new Bank();
	const itemCost = new Bank();

	if (stamina || spellbookSwap) {
		if (spellbookSwap) {
			boosts.push('20% faster for using Spellbook Swap and Vile Vigour instead of Staminas');
		} else {
			itemCost.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
			totalCost.add(itemCost);
			boosts.push('20% faster for using Stamina potions.');
			if (!user.owns(totalCost)) {
				return `You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
					Math.ceil(duration / (Time.Minute * 8)),
					1
				)}x Stamina potion(4).`;
			}
		}
	}

	if (daeyalt_essence) {
		totalCost.add('Daeyalt essence', essenceQuantity);
		if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;
	} else {
		totalCost.add('Pure essence', essenceQuantity);
	}
	if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;

	const { fletchResult, infoMessages, zeroTimePreferenceRole } = await prepareZeroTimeActivityTrip({
		...zeroTimeOptions,
		duration,
		removeItems: true
	});

	await user.removeItemsFromBank(totalCost);
	await ClientSettings.updateBankSetting('runecraft_cost', totalCost);

	await ActivityManager.startTrip<OuraniaAltarOptions>({
		quantity: essenceQuantity,
		userID: user.id,
		duration,
		type: 'OuraniaAltar',
		channelId,
		stamina,
		daeyalt,
		fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined,
		zeroTimePreferenceRole
	});

	let response = `${user.minionName} is now crafting ${essenceQuantity}x`;

	if (daeyalt_essence) {
		response += ' Daeyalt ';
	} else {
		response += ' Pure ';
	}

	response += `Essence at the Ourania Altar, it'll take around ${formatTripDuration(
		user,
		duration
	)} to finish, this will take ${numberOfInventories}x trips to the altar.\nYour minion has consumed: ${itemCost}.\n\n**Boosts:** ${boosts.join(
		', '
	)}`;

	if (fletchResult) {
		const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
		const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
		notes.push(
			`Fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name}${fallbackNote}, removed ${fletchResult.itemsToRemove} from your bank`
		);
	}
	if (notes.length > 0) {
		response += `\n\n**Notes:** ${notes.join(', ')}.`;
	}
	if (infoMessages.length > 0) {
		response += `\n${infoMessages.join('\n')}`;
	}

	return response;
}
