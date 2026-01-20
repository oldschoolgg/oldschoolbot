import { Items } from 'oldschooljs';

type StealingArtefactsCap = {
	level: number;
	base: number;
	teleport: number;
};

export const stealingArtefactsCaps: StealingArtefactsCap[] = [
	{ level: 49, base: 130_080, teleport: 150_000 },
	{ level: 55, base: 141_600, teleport: 163_000 },
	{ level: 60, base: 151_200, teleport: 174_000 },
	{ level: 65, base: 160_800, teleport: 186_000 },
	{ level: 70, base: 170_400, teleport: 197_000 },
	{ level: 75, base: 180_000, teleport: 208_000 },
	{ level: 80, base: 189_600, teleport: 219_000 },
	{ level: 85, base: 199_200, teleport: 230_000 },
	{ level: 90, base: 208_800, teleport: 241_000 },
	{ level: 95, base: 218_400, teleport: 252_000 },
	{ level: 99, base: 226_080, teleport: 261_000 }
];

export type StealingArtefactsCapColumn = 'base' | 'teleport';

export function getInterpolatedCapXpPerHour(level: number, column: StealingArtefactsCapColumn): number {
	const clampedLevel = Math.min(99, Math.max(49, level));
	const exact = stealingArtefactsCaps.find(cap => cap.level === clampedLevel);
	if (exact) return exact[column];

	let lower = stealingArtefactsCaps[0];
	let upper = stealingArtefactsCaps[stealingArtefactsCaps.length - 1];

	for (let i = 1; i < stealingArtefactsCaps.length; i++) {
		if (stealingArtefactsCaps[i].level > clampedLevel) {
			upper = stealingArtefactsCaps[i];
			lower = stealingArtefactsCaps[i - 1];
			break;
		}
	}

	return (
		lower[column] + ((clampedLevel - lower.level) * (upper[column] - lower[column])) / (upper.level - lower.level)
	);
}

export function getStealingArtefactsDeliveriesPerHour(teleportEligible: boolean): number {
	return teleportEligible ? 55 : 48;
}

export function canUseStealingArtefactsTeleport({
	teleportOptionEnabled,
	hasMemoirs,
	hasBook,
	questCompleted
}: {
	teleportOptionEnabled: boolean;
	hasMemoirs: boolean;
	hasBook: boolean;
	questCompleted: boolean;
}): boolean {
	return teleportOptionEnabled && (hasMemoirs || hasBook) && questCompleted;
}

export function calculateStealingArtefactsXpPerHour({
	thievingLevel,
	teleportEligible,
	hasGraceful,
	stamina
}: {
	thievingLevel: number;
	teleportEligible: boolean;
	hasGraceful: boolean;
	stamina: boolean;
}) {
	const capBase = getInterpolatedCapXpPerHour(thievingLevel, 'base');
	const capTeleport = getInterpolatedCapXpPerHour(thievingLevel, 'teleport');
	const capXpPerHour = teleportEligible ? capTeleport : capBase;
	const deliveriesPerHour = getStealingArtefactsDeliveriesPerHour(teleportEligible);
	const bonusXpPerHour = deliveriesPerHour * (40 * thievingLevel);

	let multiplier = 1;
	if (hasGraceful) multiplier *= 1.2;
	if (stamina) multiplier *= 1.3;

	const rawXpPerHour = (capBase + bonusXpPerHour) * multiplier;
	const finalXpPerHour = Math.min(rawXpPerHour, capXpPerHour);

	return {
		capBase,
		capTeleport,
		capXpPerHour,
		deliveriesPerHour,
		bonusXpPerHour,
		rawXpPerHour,
		finalXpPerHour,
		multiplier
	};
}

export const stealingArtefactsGlassblowingProducts = [
	{ key: 'beer_glass', item: Items.getOrThrow('Beer glass'), level: 1, xp: 17.5 },
	{ key: 'empty_candle_lantern', item: Items.getOrThrow('Empty candle lantern'), level: 4, xp: 19 },
	{ key: 'empty_oil_lamp', item: Items.getOrThrow('Empty oil lamp'), level: 12, xp: 25 },
	{ key: 'vial', item: Items.getOrThrow('Vial'), level: 33, xp: 35 },
	{ key: 'empty_fishbowl', item: Items.getOrThrow('Empty fishbowl'), level: 42, xp: 42.5 },
	{ key: 'unpowered_orb', item: Items.getOrThrow('Unpowered orb'), level: 46, xp: 52.5 },
	{ key: 'lantern_lens', item: Items.getOrThrow('Lantern lens'), level: 49, xp: 55 },
	{ key: 'empty_light_orb', item: Items.getOrThrow('Empty light orb'), level: 87, xp: 70 }
] as const;

export type StealingArtefactsGlassblowProductKey = (typeof stealingArtefactsGlassblowingProducts)[number]['key'];

export function getGlassblowingProduct(productKey: StealingArtefactsGlassblowProductKey) {
	return stealingArtefactsGlassblowingProducts.find(product => product.key === productKey);
}

export function calculateGlassblowingPlan({
	productKey,
	hours,
	availableMoltenGlass,
	craftingLevel,
	xpPerHourCap = 70_000
}: {
	productKey: StealingArtefactsGlassblowProductKey;
	hours: number;
	availableMoltenGlass: number;
	craftingLevel: number;
	xpPerHourCap?: number;
}):
	| { success: true; hours: number; itemsMade: number; craftingXp: number; moltenGlassUsed: number }
	| {
			success: false;
			error: string;
	  } {
	const product = getGlassblowingProduct(productKey);
	if (!product) {
		return { success: false, error: 'That is not a valid glassblowing product.' };
	}
	if (craftingLevel < product.level) {
		return {
			success: false,
			error: `You need at least level ${product.level} Crafting to glassblow ${product.item.name}.`
		};
	}

	if (availableMoltenGlass <= 0) {
		return { success: false, error: 'You need Molten glass to glassblow items.' };
	}

	const itemsPerHour = xpPerHourCap / product.xp;
	const maxHoursByGlass = availableMoltenGlass / itemsPerHour;
	const adjustedHours = Math.min(hours, maxHoursByGlass);
	const itemsMade = Math.floor(itemsPerHour * adjustedHours);

	if (itemsMade < 1) {
		return { success: false, error: 'You need more Molten glass to glassblow any items.' };
	}

	const moltenGlassUsed = itemsMade;
	const craftingXp = itemsMade * product.xp;

	return { success: true, hours: adjustedHours, itemsMade, craftingXp, moltenGlassUsed };
}
