export interface AssignableSlayerTask {
	name: string;
	amount: [number, number];
	weight: number;
	id: number[];
	slayerLevel?: number;
	combatLevel?: number;
	alternatives?: string[];
	questPoints?: number;
	unlocked?: boolean;
}
