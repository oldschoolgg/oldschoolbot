import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { getAllDocsResults, getDocsResults } from '../../lib/docsActivity';
import { stringMatches } from '../../lib/util';
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
					const autocompleteResult = await getDocsResults(value);
					const returnArr: { name: string; value: string }[] = [];
					for (let index = 0; index < autocompleteResult.length; index++) {
						returnArr.push({ name: autocompleteResult[index].name, value: autocompleteResult[index].path });
					}
					return returnArr;
				} catch (_) {
					return [];
				}
			}
		}
	],
	run: async ({ options }: CommandRunOptions<{ query: string }>) => {
		const liveDocs = await getAllDocsResults();
		const validDoc = liveDocs.find(item => stringMatches(item.path, options.query));

		if (!validDoc) return 'That article was not found.';

		return `https://bso-wiki.oldschool.gg/${options.query}`;
	}
};
