import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { GITBOOK_URL } from '../../config';
import { DefaultDocsResults, getAllDocsResults, getDocsResults } from '../../lib/docsActivity';
import { stringMatches } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

export const docsCommand: OSBMahojiCommand = {
	name: 'docs',
	description: 'Search the bot wiki.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'query',
			description: 'Your search query.',
			required: true,
			autocomplete: async value => {
				if (!value)
					return DefaultDocsResults.map(i => ({
						name: i.name,
						value: i.name
					}));
				try {
					const autocompleteResult = await getDocsResults(value);
					const returnArr: { name: string; value: string }[] = [];
					for (let index = 0; index < autocompleteResult.length; index++) {
						returnArr.push({ name: autocompleteResult[index].name, value: autocompleteResult[index].name });
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
		const validDoc = liveDocs.find(item => stringMatches(item.name, options.query));
		const defaultDoc = DefaultDocsResults.find(item => stringMatches(item.name, options.query));

		if (!validDoc && options.query !== '' && !defaultDoc) return 'That article was not found.';

		if (defaultDoc) return `<${GITBOOK_URL}${defaultDoc.value}>`;
		const bodyParse = validDoc?.body.replace(/[\r\n]{2,}/gs, '\n').replace(/[\r\n]/gs, ' | ');

		let response = '';

		if (bodyParse?.length !== 0) response += `${bodyParse}\nRead more: `;

		response += `<${GITBOOK_URL}${validDoc?.path}>`;

		return response;
	}
};
