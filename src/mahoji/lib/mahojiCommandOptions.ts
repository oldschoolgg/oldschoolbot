import { attackStyles_enum, combats_enum } from '@prisma/client';
import { uniqueArr } from 'e';
import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Bank, Items } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { baseFilters, filterableTypes } from '../../lib/data/filterables';
import { GearSetupTypes, globalPresets } from '../../lib/gear';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { prisma } from '../../lib/settings/prisma';
import castables from '../../lib/skilling/skills/combat/magic/castables';
import { SkillsEnum } from '../../lib/skilling/types';
import { getSkillsOfMahojiUser, toTitleCase } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { getUserGear, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const filterOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'filter',
	description: 'The filter you want to use.',
	required: false,
	autocomplete: async (value: string) => {
		let res = !value
			? filterableTypes
			: [...filterableTypes].filter(filter => filter.name.toLowerCase().includes(value.toLowerCase()));
		return [...res]
			.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

const itemArr = Items.array().map(i => ({ ...i, key: `${i.name.toLowerCase()}${i.id}` }));

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
		const mUser = await mahojiUsersSettingsFetch(user.id);

		let results: APIApplicationCommandOptionChoice[] = [];
		const entries: [string, Item[]][] = Object.entries(getUserGear(mUser)).map(entry => [
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
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }))
			.concat(globalPresets.map(i => ({ name: `${i.name} (Global)`, value: i.name })));
	}
};

export const equippedWeaponCombatStyleOption = (): CommandOption => ({
	type: ApplicationCommandOptionType.String,
	name: 'attack_style_type',
	description: 'The attack style and attack type you want to use for specified combat skill',
	required: false,
	autocomplete: async (value, user) => {
		const mUser = await mahojiUsersSettingsFetch(user.id);
		const combatSkill = mUser.minion_combatSkill;
		let results: APIApplicationCommandOptionChoice[] = [];
		if (!combatSkill || combatSkill === combats_enum.auto || combatSkill === combats_enum.nocombat) return results;
		if (combatSkill === combats_enum.melee) {
			const meleeWeapon = getUserGear(mUser).melee.equippedWeapon();
			if (meleeWeapon === null || meleeWeapon.weapon === null || !meleeWeapon.weapon) {
				// Push unarmed
				results.push({ name: 'aggressive, crush', value: 'aggressive, crush' });
				results.push({ name: 'accurate, crush', value: 'accurate, crush' });
				results.push({ name: 'defensive, crush', value: 'defensive, crush' });
				return results;
			}
			for (let stance of meleeWeapon.weapon.stances) {
				if (stance === null) {
					continue;
				}
				results.push({
					name: `${stance.attack_style!}, ${stance.attack_type!}`,
					value: `${stance.attack_style!}, ${stance.attack_type!}`
				});
			}
			return results;
		}
		if (combatSkill === combats_enum.ranged) {
			const rangeWeapon = getUserGear(mUser).range.equippedWeapon();
			if (rangeWeapon === null || rangeWeapon.weapon === null || !rangeWeapon.weapon) {
				// Push nothing can't train ranged unarmed
				return results;
			}
			for (let stance of rangeWeapon.weapon.stances) {
				if (stance === null || !Object.keys(attackStyles_enum).includes(stance.combat_style)) {
					continue;
				}
				results.push({
					name: `${stance.combat_style!}`,
					value: `${stance.combat_style!}`
				});
			}
			return results;
		}
		if (combatSkill === combats_enum.magic) {
			const mageWeapon = getUserGear(mUser).mage.equippedWeapon();
			if (mageWeapon === null || mageWeapon.weapon === null || !mageWeapon.weapon) {
				results.push({ name: 'standard', value: 'standard' });
				results.push({ name: 'defensive', value: 'defensive' });
				return results;
			}
			// Make function that checks for equipped autocasting staff
			if (
				mageWeapon.name.toLowerCase() === 'trident of the seas' ||
				mageWeapon.name.toLowerCase() === 'trident of the seas (e)' ||
				mageWeapon.name.toLowerCase() === 'trident of the swamp' ||
				mageWeapon.name.toLowerCase() === 'trident of the swamp (e)'
			) {
				for (let stance of mageWeapon.weapon.stances) {
					if (stance === null || !Object.keys(attackStyles_enum).includes(stance.combat_style)) {
						continue;
					}
					results.push({
						name: `${stance.combat_style!}`,
						value: `${stance.combat_style!}`
					});
				}
				return results;
			}
			results.push({ name: 'standard', value: 'standard' });
			results.push({ name: 'defensive', value: 'defensive' });
			return results;
		}

		return results
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }));
	}
});

export const combatSpellOption = (): CommandOption => ({
	type: ApplicationCommandOptionType.String,
	name: 'combat_spell',
	description: 'The combat spell you want to cast while training magic.',
	required: false,
	autocomplete: async (value, user) => {
		const mUser = await mahojiUsersSettingsFetch(user.id);
		let results: APIApplicationCommandOptionChoice[] = [];
		const magicLvl = getSkillsOfMahojiUser(mUser, true).magic;
		let allCastables = castables
			.filter(
				_spell => _spell.category.toLowerCase() === 'combat' && _spell.baseMaxHit && _spell.level <= magicLvl
			)
			.sort((a, b) => b.level - a.level);
		allCastables.length = 25;
		results = allCastables.map(spell => ({ name: spell.name, value: spell.name }));
		return results
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }));
	}
});
