import { toKMB } from 'oldschooljs';

export const gpCommand = defineCommand({
	name: 'gp',
	description: 'See your current GP balance.',
	options: [],
	run: async ({ user }) => {
		return `${Emoji.MoneyBag} You have ${toKMB(user.GP)} (${user.GP.toLocaleString()}) GP.`;
	}
});
