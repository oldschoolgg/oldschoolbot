import { ApplicationCommandOptionType } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';

import { baseFilters, filterableTypes } from '../lib/data/filterables';
import { evalMathExpression } from '../lib/expressionParser';

export function mahojiParseNumber({ input }: { input: string | undefined | null }): number | null {
	if (input === undefined || input === null) return null;
	const parsed = evalMathExpression(input);
	return parsed;
}

export const filterOption: CommandOption = {
	// what if we allow this
	// autoComplete: [filters.map(i => i.name)]
	type: ApplicationCommandOptionType.String,
	name: 'filter',
	description: 'The filter you want to use.',
	required: false,
	autocomplete: async (value: string) => {
		let res = !value
			? filterableTypes
			: filterableTypes.filter(filter => filter.name.toLowerCase().includes(value.toLowerCase()));

		return [...res]
			.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
			.slice(0, 10)
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

export const searchOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'search',
	description: 'An item name search query.',
	required: false
};
