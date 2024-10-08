import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { uniqueArr } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import type { AttackStyles } from '.';

const validStyles: AttackStyles[] = [
	SkillsEnum.Attack,
	SkillsEnum.Strength,
	SkillsEnum.Defence,
	SkillsEnum.Ranged,
	SkillsEnum.Magic
];

function isValidAttackStyle(str: string): str is AttackStyles {
	return (validStyles as string[]).includes(str);
}

const invalidCombinations: [AttackStyles, AttackStyles][] = [
	[SkillsEnum.Attack, SkillsEnum.Magic],
	[SkillsEnum.Strength, SkillsEnum.Magic],
	[SkillsEnum.Attack, SkillsEnum.Ranged],
	[SkillsEnum.Strength, SkillsEnum.Ranged],
	[SkillsEnum.Magic, SkillsEnum.Ranged]
];

export const allPossibleStyles: string[] = uniqueArr([
	'shared',
	...validStyles,
	...validStyles
		.map(i => {
			const styles = [];
			for (const style of validStyles) {
				if (style === i) continue;
				if (invalidCombinations.some(t => t.includes(i) && t.includes(style))) continue;
				styles.push([style, i].sort().reverse().join(' '));
			}
			return styles;
		})
		.flat(2)
]);

export async function trainCommand(user: MUser, _styles: string | undefined) {
	if (user.minionIsBusy) {
		return "You can't change your attack style in the middle of a trip.";
	}
	if (!_styles || typeof _styles !== 'string') {
		return `Your current attack style is ${user
			.getAttackStyles()
			.map(toTitleCase)}, the available styles are: Shared, Attack, Strength, Defence, Magic, Ranged.`;
	}
	const parsed = _styles
		.toLowerCase()
		.split(' ')
		.map(i => i.trim());

	if (uniqueArr(parsed).length !== parsed.length || (_styles !== 'shared' && !parsed.every(isValidAttackStyle))) {
		return 'That is not a valid attack style, the available styles are: Shared, Attack, Strength, Defence, Magic, Ranged.';
	}
	const styles: AttackStyles[] =
		_styles === 'shared'
			? [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence]
			: isValidAttackStyle(_styles)
				? [_styles]
				: parsed.filter(isValidAttackStyle);

	for (const comb of invalidCombinations) {
		if (comb.every(i => styles.includes(i))) {
			return `That's not a valid attack style, you can't train these at the same time: ${comb.join(', ')}.`;
		}
	}

	await user.setAttackStyle(styles);

	return `You're now training: ${styles
		.map(toTitleCase)
		.join(', ')}. When you do PvM, you will receive XP in these skills.`;
}
