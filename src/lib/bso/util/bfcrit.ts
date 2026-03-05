import { Bank, itemID } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs';


const _F = 75_073;

const _CL_IDS = [
	itemID('Elder sigil'),
	itemID('Elderflame bow'),
	itemID('Empyrean greathelm'),
	itemID('Vitrolic curse'),
	itemID('Dragonbane aegis'),
	itemID('Dragonbane glaive'),
	itemID('Celestial pendant'),
	itemID('Prismare ring'),
	itemID('Searcrown band'),
] as const;

const _BOSS_IDS_100 = [142_001, 142_002, 142_003, 142_004, 142_006] as const;

const _MIMIC_ID  = 142_005;
const _MIMIC_MIN = 10;
const _BOSS_MIN  = 100;

const _OPENS: [number, number][] = [
	[75_022, 50],
	[75_023, 50],
	[75_024, 50],
	[75_043,  1],
];

const _MINIGAMES: [string, number][] = [
    ['construction_contracts', 100],
    ['brimstone_distillery',   100],
];

const _TIER_KEYS = [
	'boss', 'megaboss', 'minigame', 'gathering', 'prismare',
	'fishing', 'mining', 'woodcutting', 'divination', 'farming',
] as const;

export function _itemId(): number {
	return _F;
}

export function _grantBank(): Bank {
	return new Bank().add(_F, 1);
}

export function _userOwnsOrEquips(user: MUser): boolean {
	if (user.bank.has(_F)) return true;
	for (const setup of Object.values(user.gear)) {
		for (const slot of Object.values(setup.raw())) {
			if (slot?.item === _F) return true;
		}
	}
	return false;
}

export function _everEarned(user: MUser): boolean {
	return user.cl.has(_F);
}

export function _checkCriteria(args: {
	cl:             Bank;
	monsterScores:  ItemBank;
	activityCounts: Record<string, number>;
	opens:          Bank;
	upgrades:       Record<typeof _TIER_KEYS[number], number>;
	minigameScores: Record<string, number>;
}): boolean {
	const { cl, monsterScores, minigameScores, opens, upgrades } = args;

	if (_TIER_KEYS.some(k => (upgrades[k] ?? 0) < 5)) return false;
	if (_CL_IDS.some(id => !cl.has(id))) return false;
	if (_BOSS_IDS_100.some(id => ((monsterScores[id] ?? 0) as number) < _BOSS_MIN)) return false;
	if (((monsterScores[_MIMIC_ID] ?? 0) as number) < _MIMIC_MIN) return false;
	if (_OPENS.some(([id, min]) => opens.amount(id) < min)) return false;
	if (_MINIGAMES.some(([id, min]) => (minigameScores[id] ?? 0) < min)) return false;

	return true;
}
