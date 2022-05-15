import { ApplicationCommandOptionType } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { baseFilters, filterableTypes } from '../../lib/data/filterables';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import { toTitleCase } from '../../lib/util';

export const filterOption: CommandOption = {
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
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

const itemArr = Items.array().map(i => ({ ...i, key: `${i.name.toLowerCase()}${i.id}` }));

export const itemOption = (filter?: (item: Item) => boolean): CommandOption => ({
	type: ApplicationCommandOptionType.String,
	name: 'item',
	description: 'The item you want to pick.',
	required: false,
	autocomplete: async value => {
		let res = itemArr.filter(i => i.key.includes(value.toLowerCase()));
		if (filter) res = res.filter(filter);
		return res.map(i => ({ name: `${i.name}`, value: i.id.toString() }));
	}
});

export const monsterOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'monster',
	description: 'The monster you want to pick.',
	required: true,
	autocomplete: async value => {
		return killableMonsters
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }));
	}
};

export const skillOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'skill',
	description: 'The skill you want to select.',
	required: false,
	choices: Object.values(SkillsEnum).map(i => ({ name: toTitleCase(i), value: i }))
};

export const Option: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'skill',
	description: 'The skill you want to select.',
	required: false,
	autocomplete: async (value: string) => {
		return Object.values(Skills)
			.filter(skill => (!value ? true : skill.name.toLowerCase().includes(value.toLowerCase())))
			.map(val => ({ name: val.name, value: val.name }));
	}
};
