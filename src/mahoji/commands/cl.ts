import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import {
	clImageGenerator,
	CollectionLogFlags,
	CollectionLogType,
	collectionLogTypes
} from '../../lib/collectionLogTask';
import { allCollectionLogs } from '../../lib/data/Collections';
import { toTitleCase } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const collectionLogCommand: OSBMahojiCommand = {
	name: 'cl',
	description: 'See your Collection Log.',
	attributes: {
		requiresMinion: true,
		examples: ['/cl name:Boss']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The log you want to see.',
			required: true,
			autocomplete: async (value: string) => {
				return Object.entries(allCollectionLogs)
					.map(i => {
						return [
							{ name: `${i[0]} (Group)`, value: i[0] },
							...Object.entries(i[1].activities).map(act => ({
								name: `${act[0]} (${act[1].items.length} Items)`,
								value: act[0]
							}))
						];
					})
					.flat(3)
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value)));
			}
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'type',
			description: 'The type of log you want to see.',
			required: false,
			choices: collectionLogTypes.map(i => ({ name: `${toTitleCase(i.name)} (${i.description})`, value: i.name }))
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'flag',
			description: 'The flag you want to pass.',
			required: false,
			choices: CollectionLogFlags.map(i => ({ name: `${toTitleCase(i.name)} (${i.description})`, value: i.name }))
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'all',
			description: 'Show all items?',
			required: false
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{ name: string; type?: CollectionLogType; flag?: string; all?: boolean }>) => {
		const user = await mUserFetch(userID);
		let flags: Record<string, string> = {};
		if (options.flag) flags[options.flag] = options.flag;
		if (options.all) flags.all = 'all';
		const result = await clImageGenerator.generateLogImage({
			user,
			mahojiUser: await mahojiUsersSettingsFetch(userID),
			type: options.type ?? 'collection',
			flags,
			collection: options.name
		});
		return result;
	}
};
