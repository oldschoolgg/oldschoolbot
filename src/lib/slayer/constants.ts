import { Monsters } from 'oldschooljs';

export enum AutoslayOptionsEnum {
	Default = 0,
	HighestUnlocked = 1,
	MaxEfficiency = 2,
	LowestCombat = 3
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

export const wildySlayerOnlyMonsters = [
	Monsters.DustDevil,
	Monsters.GreaterNechryael,
	Monsters.AbyssalDemon,
	Monsters.Jelly
];

export enum SlayerMasterEnum {
	Reserved = 0,
	Turael = 1,
	Mazchna = 2,
	Vannaka = 3,
	Chaeldar = 4,
	Konar = 5,
	Nieve = 6,
	Duradel = 7
}
