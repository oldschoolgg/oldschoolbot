import { Emoji } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

export const gpCommand: OSBMahojiCommand = {
	name: 'gp',
	description: 'See your current GP balance.',
	options: [],
	run: async ({ user }: CommandRunOptions<{ question: string }>) => {
		return `${Emoji.MoneyBag} You have ${toKMB(user.GP)} (${user.GP.toLocaleString()}) GP.`;
	}
};
