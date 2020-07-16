export class RestrictionOpenables {
	public name: string;
	public skill: string;
	public req: number | [number, number];
	public constructor() {
		this.name = '';
		this.skill = '';
		this.req = 1;
	}
}

// Elven chest? QP? 205?
// Sinister chest 49 agility
// Grubby chest 57 theiving
// Ogren coffin 5 QP?
// Brimstone chest 75 slayer?
// Larrans big chest QP/combat restriction?
// Larrans small chest less QP/combat restriction?

export const tempRestriction: RestrictionOpenables[] = [
	{
		name: 'openablename',
		skill: 'restrictedskill',
		req: 1 // lvl restriction
	}
];

module.exports = {
	tempRestriction,
	RestrictionOpenables
};
