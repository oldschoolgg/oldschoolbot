import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { GearSetupTypes } from '../../lib/gear/types';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Ancient from '../../lib/skilling/skills/combat/magic/castables/Ancient';
import Standard from '../../lib/skilling/skills/combat/magic/castables/Standard';
import { stringMatches } from '../../lib/util';
import { Castable } from './../../lib/skilling/types';

// No Lunar at this point, vengence etc isn't useful here.
const castables: Castable[] = [...Standard, ...Ancient];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[melee|mage|range] [combatSkill:string] [combatSpell:...string]',
			usageDelim: ' ',
			aliases: ['cs']
		});
	}

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[combatSkill, combatStyle, combatSpell]: [string, string, string]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change combat style!`
			);
		}
		const oldCombatSkill = msg.author.settings.get(UserSettings.Minion.CombatSkill);
		if (!combatSkill) {
			return msg.send(
				`${msg.author.minionName} is currently using combat skill ${oldCombatSkill}. To swap skill type \`${msg.cmdPrefix}combatsetup melee/range/mage\`.`
			);
		}

		if (!combatStyle) {
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, combatSkill);

			msg.author.log(`Changed combat skill to ${combatSkill}`);

			return msg.send(
				`${msg.author.minionName} changed main combat style from ${oldCombatSkill} to ${combatSkill}.`
			);
		}

		if (combatSkill === 'melee') {
			combatStyle = combatStyle.toLowerCase();
			const weapon = msg.author.equippedWeapon(GearSetupTypes.Melee);
			if (weapon === null || weapon.weapon === null) {
				throw `No weapon is equipped.`;
			}
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, combatSkill);

			for (let stance of weapon!.weapon!.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === combatStyle) {
					await msg.author.settings.update(
						UserSettings.Minion.MeleeCombatStyle,
						combatStyle
					);

					return msg.send(
						`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill} and combat style to ${combatStyle}.`
					);
				}
			}

			return msg.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the styles that the current equipped weapon ${
					weapon?.name
				} have. The following combat styles is possible: ${weapon?.weapon?.stances
					.map(styles => styles.combat_style)
					.join(', ')}.`
			);
		}

		if (combatSkill === 'range') {
			combatStyle = combatStyle.toLowerCase();
			const weapon = msg.author.equippedWeapon(GearSetupTypes.Range);
			if (weapon === null || weapon.weapon === null) {
				throw `No weapon is equipped.`;
			}
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, combatSkill);

			for (let stance of weapon!.weapon!.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === combatStyle) {
					await msg.author.settings.update(
						UserSettings.Minion.RangeCombatStyle,
						combatStyle
					);

					return msg.send(
						`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill} and combat style to ${combatStyle}.`
					);
				}
			}

			return msg.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the styles that the current equipped weapon ${
					weapon?.name
				} have. The following combat styles is possible: ${weapon?.weapon?.stances
					.map(styles => styles.combat_style)
					.join(', ')}.`
			);
		}

		if (combatSkill === 'mage') {
			combatStyle = combatStyle.toLowerCase();
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, combatSkill);

			if (combatStyle === 'standard' || combatStyle === 'defensive') {
				if (!combatSpell) {
					await msg.author.settings.update(
						UserSettings.Minion.MageCombatStyle,
						combatStyle
					);

					return msg.send(
						`${
							msg.author.minionName
						} changed main combat skill from ${oldCombatSkill} to ${combatSkill} and combat style to ${combatStyle}, your current combat spell is ${msg.author.settings.get(
							UserSettings.Minion.CombatSpell
						)}.`
					);
				}
				combatSpell = combatSpell.toLowerCase();

				const CombatSpells = castables.filter(
					_spell => _spell.category.toLowerCase() === 'combat' && _spell.baseMaxHit
				);

				const Spell = CombatSpells.find(_spell =>
					stringMatches(_spell.name.toLowerCase(), combatSpell)
				);

				if (!Spell) {
					return msg.send(
						`The combat spell \`${combatSpell}\` dosen't match any of the available combat spells. The following combat spells is possible: ${CombatSpells.map(
							spell => spell.name
						).join(', ')}.`
					);
				}

				await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, combatStyle);

				await msg.author.settings.update(UserSettings.Minion.CombatSpell, Spell.name);

				return msg.send(
					`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill}, combat style to ${combatStyle} and combat spell to ${Spell.name}.`
				);
			}

			return msg.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the available styles. The following combat styles is possible: Standard, Defensive.`
			);
		}
		return msg.send('Unexpected error');
	}
}
