export enum AutoslayOptionsEnum {
	Default,
	HighestUnlocked,
	MaxEfficiency,
	LowestCombat
}

export const slayerMasterChoices = [
	'Duradel',
	'Vannaka',
	'Konar quo Maten',
	'Nieve',
	'Chaeldar',
	'Mazchna',
	'Turael',
	'Krystilia'
].map(smc => {
	return { name: smc, value: smc };
});

export const autoslayModes = [
	{
		name: 'default',
		aliases: ['default', 'normal'],
		focus: 'Assigned monster',
		key: AutoslayOptionsEnum.Default
	},
	{
		name: 'ehp',
		aliases: ['ehp', 'efficient', 'xp'],
		focus: 'XP/hr',
		key: AutoslayOptionsEnum.MaxEfficiency
	},
	{
		name: 'boss',
		aliases: ['boss', 'highest', 'high'],
		focus: 'Boss/strongest monster',
		key: AutoslayOptionsEnum.HighestUnlocked
	},
	{
		name: 'low',
		aliases: ['low', 'lowest', 'speed'],
		focus: 'Lowest level',
		key: AutoslayOptionsEnum.LowestCombat
	}
];

export const autoslayChoices = autoslayModes.map(asm => ({
	name: `${asm.name} (Focus: ${asm.focus})`,
	value: asm.name
}));
