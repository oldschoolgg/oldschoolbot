import { CommandStore, KlasaMessage } from 'klasa';

import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AttackStyles, toTitleCase } from '../../lib/util';

function isValidAttackStyle(str: string): str is AttackStyles {
	return ([
		SkillsEnum.Attack,
		SkillsEnum.Strength,
		SkillsEnum.Defence,
		SkillsEnum.Ranged,
		SkillsEnum.Magic
	] as string[]).includes(str);
}

const invalidCombinations: [AttackStyles, AttackStyles][] = [
	[SkillsEnum.Attack, SkillsEnum.Magic],
	[SkillsEnum.Strength, SkillsEnum.Magic],
	[SkillsEnum.Attack, SkillsEnum.Ranged],
	[SkillsEnum.Strength, SkillsEnum.Ranged]
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['attackstyle'],
			description: 'Sets your attack style.',
			examples: ['+train defence, attack'],
			categoryFlags: ['minion'],
			usage: '[styles:...str]'
		});
	}

	async run(msg: KlasaMessage, [_styles]: [string]) {
		const styles =
			_styles === 'shared'
				? [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence]
				: isValidAttackStyle(_styles)
				? [_styles]
				: _styles
						.split(',')
						.map(i => i.trim())
						.filter(isValidAttackStyle);

		for (const comb of invalidCombinations) {
			if (comb.every(i => styles.includes(i))) {
				return msg.send(
					`That's not a valid attack style, you can't train these at the same time: ${comb.join(
						', '
					)}.`
				);
			}
		}
		return msg.send(
			`You're now training: ${styles
				.map(toTitleCase)
				.join(', ')}. When you do PvM, you will receive XP in these skills.`
		);
	}
}
