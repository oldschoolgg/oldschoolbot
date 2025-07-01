export function calcSoulChance({
	monsterKillTime,
	necromancyLevel
}: { monsterKillTime: number; necromancyLevel: number }): number {
	const monsterStrengthFactor = 10 + monsterKillTime / 490;
	const difficultyScale = Math.pow(monsterStrengthFactor + 1, monsterStrengthFactor >= 200 ? 1.35 : 4);
	const power = Math.pow(necromancyLevel, 0.25 + (necromancyLevel / 100 - 0.25));
	const raw = power / difficultyScale;
	const curved = Math.pow(raw, 0.75);
	return Math.min(0.25, Math.max(0.001, curved));
}

export function rollSoulsForMonster({
	monsterKillTime,
	necromancyLevel,
	quantityKilled
}: { monsterKillTime: number; necromancyLevel: number; quantityKilled: number }): number {
	const baseChance = calcSoulChance({ monsterKillTime, necromancyLevel });

	let souls = 0;
	for (let i = 0; i < quantityKilled; i++) {
		if (Math.random() < baseChance) souls++;
	}

	return souls;
}
