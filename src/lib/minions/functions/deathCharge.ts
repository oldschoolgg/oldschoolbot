import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

export const DEATH_CHARGE_MAGIC_LEVEL = 80;
export const DEATH_CHARGE_RUNE_COST = new Bank().add('Death rune').add('Blood rune').add('Soul rune');

const deathChargeRuneNames = ['Death rune', 'Blood rune', 'Soul rune'] as const;

export function deathChargeCastCost(casts: number) {
	return DEATH_CHARGE_RUNE_COST.clone().multiply(casts);
}

export function maxAffordableDeathChargeCasts(bank: Bank) {
	return Math.min(...deathChargeRuneNames.map(rune => bank.amount(rune)));
}

export function calcDeathChargeCasts({ bank, duration, quantity }: { bank: Bank; duration: number; quantity: number }) {
	const maxCastsByCooldown = Math.max(1, Math.ceil(duration / Time.Minute));
	return Math.min(quantity, maxCastsByCooldown, maxAffordableDeathChargeCasts(bank));
}

export function scaleDeathChargeBoost(boostPercent: number, casts: number, quantity: number) {
	return boostPercent * (casts / quantity);
}

export function formatDeathChargeBoost(boostPercent: number, casts: number) {
	const formattedBoost = Number.isInteger(boostPercent) ? boostPercent.toString() : boostPercent.toFixed(2);
	return `${formattedBoost}% for Rite of vile transference (${casts.toLocaleString()} Death Charge cast${
		casts === 1 ? '' : 's'
	})`;
}
