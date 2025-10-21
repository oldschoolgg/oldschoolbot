import { stringSearch, toTitleCase, truncateString, uniqueArr } from '@oldschoolgg/toolkit';
import type { APIApplicationCommandOptionChoice, GuildMember } from 'discord.js';
import { Bank, type Item, type ItemBank, Items } from 'oldschooljs';

import type { GearPreset } from '@/prisma/main.js';
import { baseFilters, filterableTypes } from '@/lib/data/filterables.js';
import { choicesOf, defineOption } from '@/lib/discord/index.js';
import { GearSetupTypes } from '@/lib/gear/types.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import { Gear, type GlobalPreset, globalPresets } from '@/lib/structures/Gear.js';

export const filterOption = {
	type: 'String',
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
} as const;

const itemArr = Items.array().map(i => ({ ...i, key: `${i.name.toLowerCase()}${i.id}` }));

export const tradeableItemArr = itemArr.filter(i => i.tradeable_on_ge);

export const allEquippableItems = Items.array().filter(i => i.equipable && i.equipment?.slot);

export const itemOption = (filter?: (item: Item) => boolean) =>
	defineOption({
		type: 'String',
		name: 'item',
		description: 'The item you want to pick.',
		required: false,
		autocomplete: async (value: string, _user: MUser, _member?: GuildMember) => {
			let res = itemArr.filter(i => i.key.includes(value.toLowerCase()));
			if (filter) res = res.filter(filter);
			return res
				.slice(0, 25)
				.map(i => ({ name: i.name, value: String(i.id) })) as APIApplicationCommandOptionChoice<string>[];
		}
	});

export const monsterOption = defineOption({
	type: 'String',
	name: 'monster',
	description: 'The monster you want to pick.',
	required: true,
	autocomplete: async (value: string) => {
		return killableMonsters
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }));
	}
});

export const skillOption = defineOption({
	type: 'String',
	name: 'skill',
	description: 'The skill you want to select.',
	required: false,
	choices: SkillsArray.map(i => ({ name: toTitleCase(i), value: i }))
});

export const gearSetupOption = defineOption({
	type: 'String',
	name: 'gear_setup',
	description: 'The gear setup want to select.',
	required: false,
	choices: choicesOf(GearSetupTypes)
});

export const equippedItemOption = defineOption({
	type: 'String',
	name: 'item',
	description: 'The item you want to pick.',
	required: false,
	autocomplete: async (value: string, user: MUser) => {
		const mUser = await mUserFetch(user.id);

		const results = [];
		const entries: [string, Item[]][] = Object.entries(mUser.gear).map(entry => [
			entry[0],
			entry[1].allItems(false).map(id => Items.getOrThrow(id))
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

export const ownedItemOption = (filter?: (item: Item) => boolean) =>
	defineOption({
		type: 'String',
		name: 'item',
		description: 'The item you want to pick.',
		required: false,
		autocomplete: async (value: string, user: MUser): Promise<APIApplicationCommandOptionChoice<string>[]> => {
			const q = value.toLowerCase();
			let items = user.bank.items() as Array<[Item, number]>;
			if (filter) items = items.filter(([it]) => filter(it));
			return items
				.filter(([it]) => it.name.toLowerCase().includes(q))
				.slice(0, 25)
				.map(([it]) => ({ name: it.name, value: it.name }));
		}
	});

export const gearPresetOption: CommandOption = {
	type: 'String',
	name: 'gear_preset',
	description: 'The gear preset you want to select.',
	required: false,
	autocomplete: async (value, user) => {
		const [presets, userWithBank] = await prisma.$transaction([
			prisma.gearPreset.findMany({
				where: {
					user_id: user.id
				}
			}),
			prisma.user.findFirst({
				where: {
					id: user.id
				},
				select: {
					bank: true
				}
			})
		]);

		let allPresets: (GlobalPreset | GearPreset)[] = [...presets, ...globalPresets];
		if (value) {
			allPresets = allPresets.filter(_preset => stringSearch(value, _preset));
		}

		const theirBank = new Bank(userWithBank?.bank as ItemBank);

		return allPresets
			.sort((a, b) => b.times_equipped - a.times_equipped)
			.slice(0, 25)
			.map(i => {
				const gear = Gear.fromGearPreset(i);
				const ownsAllItems = theirBank.has(gear.toBank());
				return {
					name: truncateString(`${ownsAllItems ? '🟢' : '🔴'} ${i.name} (${gear.toString()})`, 100),
					value: i.name
				};
			});
	}
} as const;
