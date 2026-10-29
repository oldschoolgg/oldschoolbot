export const farmingPatchNames = [
	'herb',
	'fruit_tree',
	'tree',
	'allotment',
	'hops',
	'cactus',
	'bush',
	'spirit',
	'hardwood',
	'seaweed',
	'vine',
	'calquat',
	'redwood',
	'crystal',
	'celastrus',
	'hespori',
	'flower',
	'mushroom',
	'belladonna'
] as const;

export type FarmingPatchName = (typeof farmingPatchNames)[number];
