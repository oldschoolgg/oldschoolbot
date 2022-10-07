import { CommandRunOptions } from 'mahoji';

import { docArticles } from '../../lib/docsHelper';
import { stringMatches } from '../../lib/util/cleanString';
import { OSBMahojiCommand } from '../lib/util';

export const docsSyncCommand: OSBMahojiCommand = {
	name: 'docs',
	description: 'Search the BSO wiki.',
	options: [],
	run: async ({ options }: CommandRunOptions<{ query: string }>) => {
		const foundArticle = docArticles.find(item => stringMatches(item.name, options.query));
		console.log(foundArticle);
		console.log(docArticles);
		if (!foundArticle) return 'That article could not be found.';
		return `https://bso-wiki.oldschool.gg/${foundArticle.value}`;
	}
};
