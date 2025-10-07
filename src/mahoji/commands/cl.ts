import { toTitleCase } from '@oldschoolgg/toolkit';

import type { CollectionLogType } from '@/lib/collectionLogTask.js';
import { CollectionLogFlags, clImageGenerator, collectionLogTypes } from '@/lib/collectionLogTask.js';
import { allCollectionLogs } from '@/lib/data/Collections.js';

export const collectionLogCommand: OSBMahojiCommand = {
	name: 'cl',
	description: 'See your Collection Log.',
	attributes: {
		requiresMinion: true,
		examples: ['/cl name:Boss']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The log you want to see.',
			required: true,
			autocomplete: async (value: string) => {
				return [
					{ name: 'Overall (Main Collection Log)', value: 'overall' },
					{ name: 'Overall+', value: 'overall+' },
					...Object.entries(allCollectionLogs)
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
				].filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
			}
		},
		{
			type: 'String',
			name: 'type',
			description: 'The type of log you want to see.',
			required: false,
			choices: collectionLogTypes.map(i => ({
				name: `${toTitleCase(i.name)} (${i.description})`,
				value: i.name
			}))
		},
		{
			type: 'String',
			name: 'flag',
			description: 'The flag you want to pass.',
			required: false,
			choices: CollectionLogFlags.map(i => ({
				name: `${toTitleCase(i.name)} (${i.description})`,
				value: i.name
			}))
		},
		{
			type: 'String',
			name: 'flag_extra',
			description: 'An additional flag you want to pass.',
			required: false,
			choices: CollectionLogFlags.map(i => ({
				name: `${toTitleCase(i.name)} (${i.description})`,
				value: i.name
			}))
		},
		{
			type: 'Boolean',
			name: 'all',
			description: 'Show all items?',
			required: false
		}
	],
	run: async ({
		options,
		user
	}: CommandRunOptions<{
		name: string;
		type?: CollectionLogType;
		flag?: string;
		flag_extra?: string;
		all?: boolean;
	}>) => {
		const flags: Record<string, string> = {};
		if (options.flag) flags[options.flag] = options.flag;
		if (options.flag_extra) flags[options.flag_extra] = options.flag_extra;
		if (options.all) flags.all = 'all';
		const result = await clImageGenerator.generateLogImage({
			user,
			type: options.type ?? 'collection',
			flags,
			collection: options.name,
			stats: await user.fetchMStats()
		});
		return result;
	}
};
