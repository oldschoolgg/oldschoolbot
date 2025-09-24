export function convertLVLtoXP(lvl: number): number {
	let points = 0;

	for (let i = 1; i < lvl; i++) {
		points += Math.floor(i + 300 * Math.pow(2, i / 7));
	}

	return Math.floor(points / 4);
}

export function convertXPtoLVL(xp: number, cap = 99): number {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
}

export function getBrimKeyChanceFromCBLevel(combatLevel: number): number {
	// https://twitter.com/JagexKieren/status/1083781544135847936
	if (combatLevel < 100) {
		return Math.round(0.2 * (combatLevel - 100) ** 2 + 100);
	}
	return Math.max(Math.round((-1 / 5) * combatLevel + 120), 50);
}

export function getLarranKeyChanceFromCBLevel(combatLevel: number, slayerMonster: boolean): number {
	let baseChance = 0;

	if (combatLevel <= 80) {
		baseChance = (3 / 10) * Math.pow(80 - combatLevel, 2) + 100;
	} else if (combatLevel <= 350) {
		baseChance = (-5 / 27) * combatLevel + 115;
	} else {
		baseChance = 50;
	}

	// Reduce the base chance by 20% if slayerMonster is true
	const adjustedChance = slayerMonster ? baseChance * 0.8 : baseChance;

	return adjustedChance;
}

export function JSONClone<O>(object: O): O {
	return JSON.parse(JSON.stringify(object));
}

export function getAncientShardChanceFromHP(hitpoints: number): number {
	return Math.round((500 - hitpoints) / 1.5);
}

export function getTotemChanceFromHP(hitpoints: number): number {
	return 500 - hitpoints;
}

export function getSlayersEnchantmentChanceFromHP(hitpoints: number): number {
	const chanceHitpoints = Math.min(hitpoints, 300);
	return Math.round(320 - (chanceHitpoints * 8) / 10);
}

export function calcCombatLevel(
	skills: Record<'strength' | 'defence' | 'hitpoints' | 'ranged' | 'attack' | 'prayer' | 'magic', number>,
	levelCap: number
): number {
	const defence = skills.defence ? convertXPtoLVL(skills.defence, levelCap) : 1;
	const ranged = skills.ranged ? convertXPtoLVL(skills.ranged, levelCap) : 1;
	const hitpoints = skills.hitpoints ? convertXPtoLVL(skills.hitpoints, levelCap) : 1;
	const magic = skills.magic ? convertXPtoLVL(skills.magic, levelCap) : 1;
	const prayer = skills.prayer ? convertXPtoLVL(skills.prayer, levelCap) : 1;
	const attack = skills.attack ? convertXPtoLVL(skills.attack, levelCap) : 1;
	const strength = skills.strength ? convertXPtoLVL(skills.strength, levelCap) : 1;

	const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
	const melee = 0.325 * (attack + strength);
	const range = 0.325 * (Math.floor(ranged / 2) + ranged);
	const mage = 0.325 * (Math.floor(magic / 2) + magic);
	return Math.floor(base + Math.max(melee, range, mage));
}

export * from './smallUtils.js';
