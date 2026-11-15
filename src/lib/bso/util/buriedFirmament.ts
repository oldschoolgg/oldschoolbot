import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';

import type { ItemBank } from 'oldschooljs';
import { type Bank, itemID } from 'oldschooljs';

const REQUIRED_COLLECTION_LOG_ITEMS = [
	itemID('Elder sigil'),
	itemID('Elderflame bow'),
	itemID('Empyrean greathelm'),
	itemID('Vitrolic curse'),
	itemID('Dragonbane aegis'),
	itemID('Dragonbane glaive'),
	itemID('Celestial pendant'),
	itemID('Prismare ring'),
	itemID('Searcrown band')
] as const;

const REQUIRED_BOSSES = [
	EBSOMonster.ORYM,
	EBSOMonster.ORRODIL,
	EBSOMonster.CRYSTALLINE_SENTINEL,
	EBSOMonster.FUNGAL_BEHEMOTH,
	EBSOMonster.BURNING_DOMINION
] as const;

const ELDER_MIMIC = EBSOMonster.ELDER_MIMIC;
const REQUIRED_MIMIC_KILLS = 10;
const REQUIRED_BOSS_KILLS = 100;

const REQUIRED_OPENABLES: [number, number][] = [
	[itemID('Gemstone bundle'), 50],
	[itemID('Gemstone satchel'), 50],
	[itemID('Gemstone core'), 50],
	[itemID('Elder sigil'), 1]
];

const REQUIRED_MINIGAME_SCORES: [string, number][] = [
	['construction_contracts', 100],
	['brimstone_distillery', 100]
];

const REQUIRED_ISLAND_UPGRADES = [
	'boss',
	'megaboss',
	'minigame',
	'gathering',
	'prismare',
	'fishing',
	'mining',
	'woodcutting',
	'divination',
	'farming'
] as const;

export function meetsBuriedFirmamentRequirements(args: {
	cl: Bank;
	monsterScores: ItemBank;
	opens: Bank;
	upgrades: Record<(typeof REQUIRED_ISLAND_UPGRADES)[number], number>;
	minigameScores: Record<string, number>;
}): boolean {
	const { cl, monsterScores, minigameScores, opens, upgrades } = args;

	if (REQUIRED_ISLAND_UPGRADES.some(k => (upgrades[k] ?? 0) < 5)) return false;
	if (REQUIRED_COLLECTION_LOG_ITEMS.some(id => !cl.has(id))) return false;
	if (REQUIRED_BOSSES.some(id => ((monsterScores[id] ?? 0) as number) < REQUIRED_BOSS_KILLS)) return false;
	if (((monsterScores[ELDER_MIMIC] ?? 0) as number) < REQUIRED_MIMIC_KILLS) return false;
	if (REQUIRED_OPENABLES.some(([id, min]) => opens.amount(id) < min)) return false;
	if (REQUIRED_MINIGAME_SCORES.some(([id, min]) => (minigameScores[id] ?? 0) < min)) return false;

	return true;
}
