import { Emoji } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

import { mahojiUsersSettingsFetch } from '@/mahoji/mahojiSettings.js';

export const gpCommand: OSBMahojiCommand = {
	name: 'gp',
	description: 'See your current GP balance.',
	options: [],
	run: async ({ user }: CommandRunOptions<{ question: string }>) => {
		const mUser = await mahojiUsersSettingsFetch(user.id, {
			GP: true
		});
		const gp = Number(mUser.GP);
		return `${Emoji.MoneyBag} You have ${toKMB(gp)} (${gp.toLocaleString()}) GP.`;
	}
};
