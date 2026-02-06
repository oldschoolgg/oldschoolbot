export type SailingDifficultyId = 'easy' | 'standard' | 'hard' | 'elite';

export interface SailingDifficulty {
	id: SailingDifficultyId;
	name: string;
	xpMultiplier: number;
	lootMultiplier: number;
	riskBonus: number;
	timeMultiplier: number;
}

export const SailingDifficulties: SailingDifficulty[] = [
	{
		id: 'easy',
		name: 'Easy',
		xpMultiplier: 0.85,
		lootMultiplier: 0.85,
		riskBonus: -0.02,
		timeMultiplier: 0.9
	},
	{
		id: 'standard',
		name: 'Standard',
		xpMultiplier: 1,
		lootMultiplier: 1,
		riskBonus: 0,
		timeMultiplier: 1
	},
	{
		id: 'hard',
		name: 'Hard',
		xpMultiplier: 1.2,
		lootMultiplier: 1.15,
		riskBonus: 0.06,
		timeMultiplier: 1.1
	},
	{
		id: 'elite',
		name: 'Elite',
		xpMultiplier: 1.35,
		lootMultiplier: 1.25,
		riskBonus: 0.12,
		timeMultiplier: 1.2
	}
];

export const SailingDifficultyById = new Map(SailingDifficulties.map(d => [d.id, d]));
