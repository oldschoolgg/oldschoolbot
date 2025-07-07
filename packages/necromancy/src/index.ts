import { SoulBank } from './SoulBank';

export function calcMonsterStrengthFactor(monsterKillTime: number): number {
	return 10 + monsterKillTime / 490;
}

export function calcSoulChance({
	monsterKillTime,
	necromancyLevel
}: { monsterKillTime: number; necromancyLevel: number }): number {
	const requiredNecromancyLevel = calcNecroLevelForMonster({ monsterKillTime });
	const monsterStrengthFactor = calcMonsterStrengthFactor(monsterKillTime);
	const exponent = 3 - 1.65 * Math.min(1, monsterStrengthFactor / 200);
	const difficultyScale = Math.pow(monsterStrengthFactor + 1, exponent);
	const power = Math.pow(necromancyLevel, 0.25 + (necromancyLevel / 100 - 0.25));
	const raw = power / difficultyScale;

	let curve = 0.1;
	if (monsterStrengthFactor > 14_000) {
		curve = 0.9;
	} else if (monsterStrengthFactor > 12_000) {
		curve = 0.6;
	} else if (monsterStrengthFactor > 11_000) {
		curve = 0.55;
	} else if (monsterStrengthFactor > 400) {
		curve = 0.55;
	} else if (monsterStrengthFactor > 300) {
		curve = 0.45;
	} else if (monsterStrengthFactor > 200) {
		curve = 0.35;
	} else {
		curve = 0.2;
	}

	const curved = Math.pow(raw, curve);
	const normal = Math.min(0.9, Math.max(0.01, curved));
	const difference = Math.pow(necromancyLevel - requiredNecromancyLevel, 0.8);
	const differenceBasedResult =
		(necromancyLevel === requiredNecromancyLevel
			? normal
			: calcSoulChance({ monsterKillTime, necromancyLevel: requiredNecromancyLevel })) +
		difference * 0.01;
	return Math.max(differenceBasedResult, normal);
}

export { SoulBank };

export function calcNecroLevelForMonster({ monsterKillTime }: { monsterKillTime: number }): number {
	const minTime = 2000;
	const maxTime = 7200000;
	const minLevel = 1;
	const maxLevel = 120;

	if (monsterKillTime <= minTime) return minLevel;
	if (monsterKillTime >= maxTime) return maxLevel;

	const t = (monsterKillTime - minTime) / (maxTime - minTime);

	const seconds = monsterKillTime / 1000;
	let factor = 0.1;

	if (seconds < 10) {
		factor = 0.4;
	} else if (seconds < 30) {
		factor = 0.2;
	} else if (seconds < 60) {
		factor = 0.1;
	} else if (seconds < 150) {
		factor = 0.05;
	} else if (seconds < 200) {
		factor = 0.02;
	} else if (seconds < 300) {
		factor = 0.01;
	} else if (seconds < 400) {
		factor = 0.005;
	} else {
		factor = 0.005;
	}

	const eased = 1 - Math.sqrt(1 - Math.pow(t, factor));

	const level = minLevel + (maxLevel - minLevel) * eased;
	return Math.floor(level);
}
