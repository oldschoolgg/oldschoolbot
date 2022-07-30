import { uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { toTitleCase } from '../../util';
import { CombatStyles } from '.';

const validStyles: CombatStyles[] = [
	SkillsEnum.Attack,
	SkillsEnum.Strength,
	SkillsEnum.Defence,
	SkillsEnum.Ranged,
	SkillsEnum.Magic
];

function isValidCombatStyle(str: string): str is CombatStyles {
	return (validStyles as string[]).includes(str);
}

const invalidCombinations: [CombatStyles, CombatStyles][] = [
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
			let styles = [];
			for (const style of validStyles) {
				if (style === i) continue;
				if (invalidCombinations.some(t => t.includes(i) && t.includes(style))) continue;
				styles.push([style, i].sort().reverse().join(' '));
			}
			return styles;
		})
		.flat(2)
]);

export async function trainCommand(user: KlasaUser, _styles: string | undefined) {
	if (user.minionIsBusy) {
		return "You can't change your attack style in the middle of a trip.";
	}
	if (!_styles || typeof _styles !== 'string') {
		return `Your current attack style is ${user
			.getCombatStyles()
			.map(toTitleCase)}, the available styles are: Shared, Attack, Strength, Defence, Magic, Ranged.`;
	}
	const parsed = _styles
		.toLowerCase()
		.split(' ')
		.map(i => i.trim());

	if (uniqueArr(parsed).length !== parsed.length || (_styles !== 'shared' && !parsed.every(isValidCombatStyle))) {
		return 'That is not a valid attack style, the available styles are: Shared, Attack, Strength, Defence, Magic, Ranged.';
	}
	const styles: CombatStyles[] =
		_styles === 'shared'
			? [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence]
			: isValidCombatStyle(_styles)
			? [_styles]
			: parsed.filter(isValidCombatStyle);

	for (const comb of invalidCombinations) {
		if (comb.every(i => styles.includes(i))) {
			return `That's not a valid attack style, you can't train these at the same time: ${comb.join(', ')}.`;
		}
	}

	await user.setCombatStyles(styles);

	return `You're now training: ${styles
		.map(toTitleCase)
		.join(', ')}. When you do PvM, you will receive XP in these skills.`;
}
