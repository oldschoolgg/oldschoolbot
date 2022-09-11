import { Bank } from 'oldschooljs';

import { diaries, userhasDiaryTier } from '../../diaries';
import { SkillsEnum } from '../../skilling/types';
import { Buyable } from './buyables';

export const capeBuyables: Buyable[] = [
	{
		name: 'Achievement diary cape',
		outputItems: new Bank({
			'Achievement diary cape': 1,
			'Achievement diary cape(t)': 1,
			'Achievement diary hood': 1
		}),
		gpCost: 1_000_000,
		customReq: async user => {
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [false, "You can't buy this because you haven't completed all the Elite diaries!"];
				}
			}
			return [true];
		}
	},
	{
		name: 'Max cape',
		outputItems: new Bank({
			'Max cape': 1,
			'Max hood': 1
		}),
		gpCost: 2_277_000,
		customReq: async user => {
			if (user.totalLevel < 2277) {
				return [false, "You can't buy this because you aren't maxed!"];
			}
			return [true];
		}
	},
	{
		name: "Artisan's cape",
		itemCost: new Bank()
			.add('Crafting master cape')
			.add('Construction master cape')
			.add('Cooking master cape')
			.add('Firemaking master cape')
			.add('Fletching master cape')
			.add('Herblore master cape')
			.add('Runecraft master cape')
			.add('Smithing master cape'),
		outputItems: new Bank({
			"Artisan's cape": 1
		}),
		customReq: async user => {
			for (const skill of [
				SkillsEnum.Crafting,
				SkillsEnum.Construction,
				SkillsEnum.Cooking,
				SkillsEnum.Firemaking,
				SkillsEnum.Fletching,
				SkillsEnum.Herblore,
				SkillsEnum.Runecraft,
				SkillsEnum.Smithing
			]) {
				if ((user.settings.get(`skills.${skill}`) as number) < 500_000_000) {
					return [false, `You don't have 500m ${skill}.`];
				}
			}
			return [true];
		}
	},
	{
		name: "Combatant's cape",
		itemCost: new Bank()
			.add('Attack master cape')
			.add('Hitpoints master cape')
			.add('Defence master cape')
			.add('Magic master cape')
			.add('Prayer master cape')
			.add('Ranged master cape')
			.add('Strength master cape'),
		outputItems: new Bank({
			"Combatant's cape": 1
		}),
		customReq: async user => {
			for (const skill of [
				SkillsEnum.Attack,
				SkillsEnum.Hitpoints,
				SkillsEnum.Defence,
				SkillsEnum.Magic,
				SkillsEnum.Prayer,
				SkillsEnum.Ranged,
				SkillsEnum.Strength
			]) {
				if ((user.settings.get(`skills.${skill}`) as number) < 500_000_000) {
					return [false, `You don't have 500m ${skill}.`];
				}
			}
			return [true];
		}
	},
	{
		name: "Gatherer's cape",
		itemCost: new Bank()
			.add('Farming master cape')
			.add('Fishing master cape')
			.add('Hunter master cape')
			.add('Mining master cape')
			.add('Woodcutting master cape'),
		outputItems: new Bank({
			"Gatherer's cape": 1
		}),
		customReq: async user => {
			for (const skill of [
				SkillsEnum.Farming,
				SkillsEnum.Fishing,
				SkillsEnum.Hunter,
				SkillsEnum.Mining,
				SkillsEnum.Woodcutting
			]) {
				if ((user.settings.get(`skills.${skill}`) as number) < 500_000_000) {
					return [false, `You don't have 500m ${skill}.`];
				}
			}
			return [true];
		}
	},
	{
		name: 'Support cape',
		itemCost: new Bank()
			.add('Agility master cape')
			.add('Dungeoneering master cape')
			.add('Thieving master cape')
			.add('Slayer master cape'),
		outputItems: new Bank({
			'Support cape': 1
		}),
		customReq: async user => {
			for (const skill of [
				SkillsEnum.Slayer,
				SkillsEnum.Agility,
				SkillsEnum.Dungeoneering,
				SkillsEnum.Thieving
			]) {
				if ((user.settings.get(`skills.${skill}`) as number) < 500_000_000) {
					return [false, `You don't have 500m ${skill}.`];
				}
			}
			return [true];
		}
	},
	{
		name: 'Master quest cape',
		outputItems: new Bank({
			'Master quest cape': 1
		}),
		gpCost: 1_000_000_000,
		qpRequired: 5000
	}
];
