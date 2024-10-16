import type { CommandOption } from '@oldschoolgg/toolkit/util';
import { toTitleCase } from '@oldschoolgg/toolkit/util';
import type { APIApplicationCommandOptionChoice } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { uniqueArr } from 'e';
import { Bank, type Item, type ItemBank, Items } from 'oldschooljs';

import { baseFilters, filterableTypes } from '../../lib/data/filterables';
import { GearSetupTypes } from '../../lib/gear/types';
import killableMonsters from '../../lib/minions/data/killableMonsters';

import { SkillsEnum } from '../../lib/skilling/types';
import { globalPresets } from '../../lib/structures/Gear';
import getOSItem from '../../lib/util/getOSItem';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const filterOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'filter',
	description: 'The filter you want to use.',
	required: false,
	autocomplete: async (value: string) => {
		const res = !value
			? filterableTypes
			: [...filterableTypes].filter(filter => filter.name.toLowerCase().includes(value.toLowerCase()));
		return [...res]
			.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

const itemArr = Items.array().map(i => ({ ...i, key: `${i.name.toLowerCase()}${i.id}` }));

export const tradeableItemArr = itemArr.filter(i => i.tradeable_on_ge);

export const allEquippableItems = Items.array().filter(i => i.equipable && i.equipment?.slot);

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

export const gearSetupOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'gear_setup',
	description: 'The gear setup want to select.',
	required: false,
	choices: GearSetupTypes.map(i => ({ name: toTitleCase(i), value: i }))
};

export const equippedItemOption = (): CommandOption => ({
	type: ApplicationCommandOptionType.String,
	name: 'item',
	description: 'The item you want to pick.',
	required: false,
	autocomplete: async (value, user) => {
		const mUser = await mUserFetch(user.id);

		const results: APIApplicationCommandOptionChoice[] = [];
		const entries: [string, Item[]][] = Object.entries(mUser.gear).map(entry => [
			entry[0],
			entry[1].allItems(false).map(getOSItem)
		]);
		for (const item of uniqueArr(entries.map(i => i[1]).flat(2))) {
			if (results.length >= 15) break;
			if (value && !item.name.toLowerCase().includes(value.toLowerCase())) continue;
			const equippedIn = entries.filter(i => i[1].includes(item));
			results.push({
				name: `${item.name} (${equippedIn.map(i => i[0]).join(', ')})`,
				value: item.name
			});
		}
		return results;
	}
});

export const ownedItemOption = (filter?: (item: Item) => boolean): CommandOption => ({
	type: ApplicationCommandOptionType.String,
	name: 'item',
	description: 'The item you want to pick.',
	required: false,
	autocomplete: async (value, user) => {
		const mUser = await mahojiUsersSettingsFetch(user.id, { bank: true });
		const bank = new Bank(mUser.bank as ItemBank);
		let res = bank.items().filter(i => i[0].name.toLowerCase().includes(value.toLowerCase()));
		if (filter) res = res.filter(i => filter(i[0]));
		return res.map(i => ({ name: `${i[0].name}`, value: i[0].name.toString() }));
	}
});

export const gearPresetOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'gear_preset',
	description: 'The gear preset you want to select.',
	required: false,
	autocomplete: async (value, user) => {
		const presets = await prisma.gearPreset.findMany({
			where: {
				user_id: user.id
			},
			select: {
				name: true
			}
		});
		return presets
			.map(i => ({ name: i.name, value: i.name }))
			.concat(globalPresets.map(i => ({ name: `${i.name} (Global)`, value: i.name })))
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())));
	}
};
