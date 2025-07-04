import { SoulBank } from './SoulBank';

export function calcSoulChance({
	monsterKillTime,
	necromancyLevel
}: { monsterKillTime: number; necromancyLevel: number }): number {
	const monsterStrengthFactor = 10 + monsterKillTime / 490;
	const difficultyScale = Math.pow(monsterStrengthFactor + 1, monsterStrengthFactor >= 200 ? 1.35 : 3);
	const power = Math.pow(necromancyLevel, 0.25 + (necromancyLevel / 100 - 0.25));
	const raw = power / difficultyScale;
	const curved = Math.pow(raw, 0.75);
	return Math.min(0.25, Math.max(0.001, curved));
}

export function calcNecroLevelForMonster({ monsterKillTime }: { monsterKillTime: number }): number {
	const seconds = monsterKillTime / 1000;
	const maxSeconds = 120 * 60 * 0.6;
	const ratio = Math.min(1, seconds / maxSeconds);
	const level = Math.pow(ratio, 0.54) * 120;
	return Math.max(1, Math.floor(level));
}

export { SoulBank };
