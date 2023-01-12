import { Time } from 'e';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { randomizeBank } from '../../lib/randomizer';
import { getItem } from '../../lib/util/getOSItem';
import { formatDuration } from '../../lib/util/smallUtils';
import { itemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

export const decodeCommand: OSBMahojiCommand = {
	name: 'decode',
	description: 'Allows you to show what an item is randomized to, once every 24h.',
	options: [
		{
			...itemOption(),
			description: 'The item you want to decode.'
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ item: string }>) => {
		const user = await mUserFetch(userID.toString());
		const currentDate = Date.now();
		const lastVoteDate = Number(user.user.lastDailyTimestamp);
		const difference = currentDate - lastVoteDate;

		let cd = Time.Day;
		if (difference < cd) {
			const duration = Date.now() - (lastVoteDate + cd);
			return `You can't decode an item yet. Try again in ${formatDuration(duration)}.`;
		}

		const item = getItem(options.item);
		if (!item) return 'Invalid item;';
		let sample = new Bank().add(item.id);
		await user.update({
			last_decode_date: new Date()
		});
		return `For you, ${item.name} is randomized to... ${randomizeBank(user.id, sample).items()[0][0].name}.`;
	}
};
