export const slayerMasterChoices = [
	{ name: 'Duradel', value: 'duradel' },
	{ name: 'Vannaka', value: 'vannaka' },
	{ name: 'Konar quo Maten', value: 'konar quo maten' },
	{ name: 'Nieve', value: 'nieve' },
	{ name: 'Chaeldar', value: 'chaeldar' },
	{ name: 'Mazchna', value: 'mazchna' },
	{ name: 'Turael', value: 'turael' }
];

export const autoslayModes = [
	{
		name: 'default',
		aliases: ['default', 'normal'],
		focus: 'Assigned monster'
	},
	{
		name: 'ehp',
		aliases: ['ehp', 'efficient', 'xp'],
		focus: 'XP/hr'
	},
	{
		name: 'boss',
		aliases: ['boss', 'highest', 'high'],
		focus: 'Boss/strongest monster'
	},
	{
		name: 'low',
		aliases: ['low', 'lowest', 'speed'],
		focus: 'Lowest level'
	}
];

export const autoslayChoices = autoslayModes.map(asm => ({
	name: `${asm.name} (Focus: ${asm.focus})`,
	value: asm.name
}));
