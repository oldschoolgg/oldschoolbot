import type { Bank } from 'oldschooljs';

import type { AutoFarmSummary } from '@/lib/types/minions.js';

export const farmingBoostMessages = {
	gracefulTime: '10% time for Graceful',
	ringOfEnduranceTime: '10% time for Ring of endurance',
	ardougneHardTime: '4% time for Ardougne Hard diary',
	ardougneEliteTime: '4% time for Ardougne Elite diary',
	magicSecateursYield: 'Magic secateurs: +10% crop yield',
	farmingCapeYield: 'Farming cape: +5% crop yield'
} as const;

export function formatTreeRemovalPreparation(gpCost: number): string {
	return `You may need to pay a nearby farmer up to ${gpCost.toLocaleString()} GP to remove the previous trees when harvesting.`;
}

export function formatCropProtectionPayment(paymentCost: Bank): string {
	return `You are paying a nearby farmer ${paymentCost} to look after your patches.`;
}

export function formatMissingCropProtectionPayment(): string {
	return 'You did not have enough payment to automatically pay for crop protection.';
}

export function formatPatchTreatment(compostCost: Bank): string {
	return `You are treating your patches with ${compostCost}.`;
}

const compostItemNames = new Set(['Compost', 'Supercompost', 'Ultracompost']);

function isSeedOrSpore(itemName: string): boolean {
	const lowerName = itemName.toLowerCase();
	return (
		lowerName.endsWith(' seed') ||
		lowerName.endsWith(' seeds') ||
		lowerName.endsWith(' spore') ||
		lowerName.endsWith(' spores') ||
		lowerName === 'acorn' ||
		lowerName.endsWith(' acorn')
	);
}

function capitaliseFirst(value: string): string {
	return value.length === 0 ? value : `${value[0].toUpperCase()}${value.slice(1)}`;
}

function pushBankLine(lines: string[], label: string, bank: Bank): void {
	if (bank.length > 0) {
		lines.push(`**${label}:** ${bank}.`);
	}
}

export function formatItemsUsed(cost: Bank): string {
	if (cost.length === 0) {
		return '';
	}

	const compost = cost.filter(item => compostItemNames.has(item.name));
	const seedsAndSpores = cost.filter(item => isSeedOrSpore(item.name));
	const coins = cost.filter(item => item.name === 'Coins');
	const otherItems = cost.filter(
		item => !compostItemNames.has(item.name) && !isSeedOrSpore(item.name) && item.name !== 'Coins'
	);

	const lines = ['**Items used:**'];
	pushBankLine(lines, 'Compost', compost);
	pushBankLine(lines, 'Seeds/spores', seedsAndSpores);
	pushBankLine(lines, 'Coins', coins);
	pushBankLine(lines, 'Other items', otherItems);

	return lines.join('\n');
}

export function formatTreeRemovalPayment(coinsPaid: number): string {
	return `You did not have the woodcutting level required, so you paid a nearby farmer ${coinsPaid.toLocaleString()} GP to remove the previous trees.`;
}

export function formatTreeRemovalRefund(prePaid: number, actualCost: number, refund: number): string {
	return `You had prepaid ${prePaid.toLocaleString()} GP to remove the previous trees, but only ${actualCost.toLocaleString()} GP was needed, so ${refund.toLocaleString()} GP was refunded to you.`;
}

export function formatTreeRemovalPrepaid(prePaid: number, actualCost: number): string {
	return `You had already paid a nearby farmer ${Math.min(prePaid, actualCost).toLocaleString()} GP to remove the previous trees.`;
}

export function formatNoTreeRemovalPaymentNeeded(): string {
	return 'No payment was needed to remove the previous trees.';
}

export function formatFarmingBoosts(boosts: string[], options?: { prefix?: string; label?: string; suffix?: string }) {
	const uniqueBoosts = [...new Set(boosts)].filter(Boolean);
	if (uniqueBoosts.length === 0) {
		return '';
	}
	const prefix = options?.prefix ?? '\n\n';
	const label = options?.label ?? '**Boosts:**';
	const suffix = options?.suffix ?? '.';
	return `${prefix}${label} ${uniqueBoosts.join(', ')}${suffix}`;
}

export function pushFarmingCropYieldBoosts(user: MUser, boosts: string[]): void {
	if (user.hasEquippedOrInBank(['Magic secateurs'])) {
		boosts.push(farmingBoostMessages.magicSecateursYield);
	}
	if (user.hasEquippedOrInBank(['Farming cape'])) {
		boosts.push(farmingBoostMessages.farmingCapeYield);
	}
}

export function formatAutoFarmSummarySteps(summary: AutoFarmSummary): string[] {
	if (summary.steps.length === 0) {
		return [];
	}

	const patchTypes = summary.steps.map(step => capitaliseFirst(step.patchType.replace(/_/g, ' ')));
	return [`**Patches farmed:** ${patchTypes.join(', ')}.`];
}
