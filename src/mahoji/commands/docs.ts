import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import fetch from 'node-fetch';

import { GITBOOK_SPACE_ID, GITBOOK_TOKEN } from '../../config';
import { DocsResponse } from '../../lib/docsTypes';
import { OSBMahojiCommand } from '../lib/util';

export const docsCommand: OSBMahojiCommand = {
	name: 'docs',
	description: 'Search the BSO wiki.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'query',
			description: 'Your search query.',
			required: true,
			autocomplete: async value => {
				if (!value) return [];
				try {
					const autocompleteResult = await fetch(
						`https://api.gitbook.com/v1/spaces/${GITBOOK_SPACE_ID}/search?query=${encodeURIComponent(
							value
						)}&limit=10`,
						{
							headers: {
								Authorization: `Bearer ${GITBOOK_TOKEN}`
							}
						}
					);
					const resultJson = await autocompleteResult.json();
					const { items } = resultJson as DocsResponse;
					const returnArr: { name: string; value: string }[] = [];
					for (let item of items) {
						returnArr.push({ name: item.title, value: item.path });
						for (let section of item.sections) {
							if (section.title === '') continue;
							returnArr.push({
								name: section.title,
								value: section.path
							});
						}
					}
					console.log(returnArr);
					return returnArr;
				} catch (_) {
					return [];
				}
			}
		}
	],
	run: async ({ options }: CommandRunOptions<{ query: string }>) => {
		return `https://bso-wiki.oldschool.gg/${options.query}`;
	}
};
