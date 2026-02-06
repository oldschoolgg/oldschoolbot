import { Bank } from 'oldschooljs';

export type ShipPart = 'hull' | 'sails' | 'crew' | 'navigation' | 'cargo';

export const SHIP_PARTS: ShipPart[] = ['hull', 'sails', 'crew', 'navigation', 'cargo'];

export const MAX_SHIP_TIER = 5;

const baseCosts: Record<ShipPart, Array<Bank>> = {
	hull: [
		new Bank({ Plank: 20, 'Iron nails': 50, Rope: 2 }),
		new Bank({ 'Oak plank': 30, 'Steel nails': 80, Rope: 3 }),
		new Bank({ 'Teak plank': 40, 'Mithril nails': 120, Rope: 4 }),
		new Bank({ 'Mahogany plank': 50, 'Adamantite nails': 160, Rope: 6 })
	],
	sails: [
		new Bank({ 'Bolt of cloth': 12, Rope: 4, 'Swamp tar': 20 }),
		new Bank({ 'Bolt of cloth': 20, Rope: 6, 'Swamp tar': 40 }),
		new Bank({ 'Bolt of cloth': 28, Rope: 8, 'Swamp tar': 60 }),
		new Bank({ 'Bolt of cloth': 36, Rope: 10, 'Swamp tar': 80 })
	],
	crew: [
		new Bank({ Coins: 10_000, 'Jug of wine': 5, 'Cooked chicken': 10 }),
		new Bank({ Coins: 25_000, 'Jug of wine': 10, 'Cooked chicken': 20 }),
		new Bank({ Coins: 50_000, 'Jug of wine': 15, 'Cooked chicken': 30 }),
		new Bank({ Coins: 100_000, 'Jug of wine': 20, 'Cooked chicken': 40 })
	],
	navigation: [
		new Bank({ 'Uncut sapphire': 2, 'Uncut emerald': 1, Compass: 1 }),
		new Bank({ 'Uncut emerald': 2, 'Uncut ruby': 1, Compass: 1 }),
		new Bank({ 'Uncut ruby': 2, 'Uncut diamond': 1, Compass: 1 }),
		new Bank({ 'Uncut diamond': 2, Dragonstone: 1, Compass: 1 })
	],
	cargo: [
		new Bank({ 'Oak plank': 20, 'Iron nails': 60 }),
		new Bank({ 'Teak plank': 30, 'Steel nails': 90 }),
		new Bank({ 'Mahogany plank': 40, 'Mithril nails': 120 }),
		new Bank({ 'Mahogany plank': 50, 'Adamantite nails': 160 })
	]
};

export function getShipUpgradeCost(part: ShipPart, fromTier: number, toTier: number): Bank {
	const cost = new Bank();
	const safeFrom = Math.max(1, fromTier);
	const safeTo = Math.min(MAX_SHIP_TIER, toTier);
	for (let nextTier = safeFrom + 1; nextTier <= safeTo; nextTier++) {
		const tierCost = baseCosts[part][nextTier - 2];
		if (tierCost) cost.add(tierCost);
	}
	return cost;
}
