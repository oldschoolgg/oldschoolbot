import { clamp, objectValues } from 'e';
import { Bank, type Item } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { Skills } from '../../../lib/types';
import { assert, isValidSkill, itemID } from '../../../lib/util';
import { getItem } from '../../../lib/util/getOSItem';

interface IXPLamp {
	itemID: number;
	amount: number;
	name: string;
	minimumLevel: number;
	allowedSkills?: SkillsEnum[];
}

export const XPLamps: IXPLamp[] = [
	{
		itemID: 11_137,
		amount: 2500,
		name: 'Antique lamp 1',
		minimumLevel: 1
	},
	{
		itemID: 11_139,
		amount: 7500,
		name: 'Antique lamp 2',
		minimumLevel: 30
	},
	{
		itemID: 11_141,
		amount: 15_000,
		name: 'Antique lamp 3',
		minimumLevel: 40
	},
	{
		itemID: 11_185,
		amount: 50_000,
		name: 'Antique lamp 4',
		minimumLevel: 70
	},
	{
		itemID: 28_409,
		amount: 100_000,
		name: 'Ancient lamp',
		minimumLevel: 60,
		allowedSkills: [
			SkillsEnum.Attack,
			SkillsEnum.Strength,
			SkillsEnum.Defence,
			SkillsEnum.Hitpoints,
			SkillsEnum.Ranged,
			SkillsEnum.Magic,
			SkillsEnum.Prayer
		]
	},
	{
		itemID: 28_587,
		amount: 30_000,
		name: 'Magic lamp (strength)',
		minimumLevel: 1,
		allowedSkills: [SkillsEnum.Strength]
	},
	{
		itemID: 28_588,
		amount: 20_000,
		name: 'Magic lamp (slayer)',
		minimumLevel: 1,
		allowedSkills: [SkillsEnum.Slayer]
	},
	{
		itemID: 28_589,
		amount: 5000,
		name: 'Magic lamp (thieving)',
		minimumLevel: 1,
		allowedSkills: [SkillsEnum.Thieving]
	},
	{
		itemID: 28_590,
		amount: 500,
		name: 'Magic lamp (magic)',
		minimumLevel: 1,
		allowedSkills: [SkillsEnum.Magic]
	},
	{
		itemID: 28_820,
		amount: 5000,
		name: 'Antique lamp (defender of varrock)',
		minimumLevel: 1
	},
	{
		itemID: itemID('Antique lamp (easy ca)'),
		amount: 5000,
		name: 'Antique lamp (easy ca)',
		minimumLevel: 20
	},
	{
		itemID: itemID('Antique lamp (medium ca)'),
		amount: 10_000,
		name: 'Antique lamp (medium ca)',
		minimumLevel: 30
	},
	{
		itemID: itemID('Antique lamp (hard ca)'),
		amount: 15_000,
		name: 'Antique lamp (hard ca)',
		minimumLevel: 40
	},
	{
		itemID: itemID('Antique lamp (elite ca)'),
		amount: 25_000,
		name: 'Antique lamp (elite ca)',
		minimumLevel: 50
	},
	{
		itemID: itemID('Antique lamp (master ca)'),
		amount: 35_000,
		name: 'Antique lamp (master ca)',
		minimumLevel: 60
	},
	{
		itemID: itemID('Antique lamp (grandmaster ca)'),
		amount: 50_000,
		name: 'Antique lamp (grandmaster ca)',
		minimumLevel: 70
	}
];

interface IFunctionData {
	user: MUser;
	item: Item;
	quantity: number;
}

interface IXPObject {
	items: number[];
	function: (data: IFunctionData) => [Skills, Skills | undefined];
}

export const Lampables: IXPObject[] = [
	{
		items: resolveItems(['Dark relic']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] =
					data.user.skillLevel(skill) *
					([
						SkillsEnum.Attack,
						SkillsEnum.Strength,
						SkillsEnum.Defence,
						SkillsEnum.Magic,
						SkillsEnum.Ranged,
						SkillsEnum.Hitpoints,
						SkillsEnum.Prayer,
						SkillsEnum.Mining,
						SkillsEnum.Woodcutting,
						SkillsEnum.Herblore,
						SkillsEnum.Farming,
						SkillsEnum.Hunter,
						SkillsEnum.Cooking,
						SkillsEnum.Fishing,
						SkillsEnum.Thieving,
						SkillsEnum.Firemaking,
						SkillsEnum.Agility
					].includes(skill)
						? 150
						: 50) *
					data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Genie lamp']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] = data.user.skillLevel(skill) * 10 * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Book of knowledge']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] = data.user.skillLevel(skill) * 15 * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: XPLamps.map(i => i.itemID),
		function: data => {
			const lamp = XPLamps.find(l => l.itemID === data.item.id)!;
			const skills: Skills = {};
			const requirements: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (lamp.allowedSkills && !lamp.allowedSkills.includes(skill)) continue;
				skills[skill] = lamp.amount * data.quantity;
				requirements[skill] = lamp.minimumLevel;
			}
			return [skills, requirements];
		}
	},
	{
		items: resolveItems(['Book of arcane knowledge']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (skill !== SkillsEnum.Magic && skill !== SkillsEnum.Runecraft) {
					continue;
				}
				skills[skill] =
					data.user.skillLevel(skill) * ([SkillsEnum.Magic].includes(skill) ? 15 : 5) * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Training manual']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (
					![SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Hitpoints].includes(skill)
				) {
					continue;
				}
				skills[skill] =
					Math.round(Number(Math.pow(data.user.skillLevel(skill), 2)) / 4 + 7 * data.user.skillLevel(skill)) *
					data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(["Duradel's Notes"]),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (![SkillsEnum.Slayer].includes(skill)) {
					continue;
				}
				skills[skill] = data.user.skillLevel(skill) * 15 * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Antique lamp (Historian Aldo)']),
		function: data => {
			const skills: Skills = {};

			for (const skill of objectValues(SkillsEnum)) {
				if (
					![
						SkillsEnum.Attack,
						SkillsEnum.Strength,
						SkillsEnum.Defence,
						SkillsEnum.Hitpoints,
						SkillsEnum.Ranged,
						SkillsEnum.Magic,
						SkillsEnum.Prayer
					].includes(skill)
				) {
					continue;
				}

				skills[skill] = (skill === SkillsEnum.Prayer ? 3500 : 5000) * data.quantity;
			}
			return [skills, undefined];
		}
	}
];

export async function lampCommand(user: MUser, itemToUse: string, skill: string, _quantity: number | undefined) {
	const item = getItem(itemToUse);
	if (!item) return "That's not a valid item.";

	const xpObject = Lampables.find(x => x.items.includes(item.id));
	if (!xpObject) return "That's not a valid item to use.";

	if (!isValidSkill(skill)) return "That's not a valid skill.";

	const qty = !_quantity ? 1 : clamp(_quantity, 1, 1000);
	const toRemoveFromBank = new Bank().add(item.id, qty);
	if (!user.owns(toRemoveFromBank)) {
		return `You don't have **${toRemoveFromBank}** in your bank.`;
	}

	let skillsToReceive: Skills = {};
	let skillsRequirements: Skills | undefined = undefined;

	[skillsToReceive, skillsRequirements] = xpObject.function({
		user,
		quantity: qty,
		item
	});

	if (!skillsToReceive[skill]) {
		return 'This is not a valid skill for this item.';
	}

	if (skillsRequirements && user.skillLevel(skill) < skillsRequirements[skill]!) {
		return `You are not skilled enough to receive this reward. You need level **${skillsRequirements[
			skill
		]!}** in ${skill} to receive it.`;
	}

	const amount = skillsToReceive[skill]!;
	assert(typeof amount === 'number' && amount > 0);

	await user.removeItemsFromBank(toRemoveFromBank);
	const xpStr = await user.addXP({ skillName: skill, amount, artificial: true });

	return { content: `You used ${toRemoveFromBank}. ${xpStr}` };
}
