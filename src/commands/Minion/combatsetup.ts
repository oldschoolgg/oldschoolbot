import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearSetupTypes } from '../../lib/gear/types';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export enum combatStyle {
	Melee = 'melee',
	Mage = 'mage',
	Range = 'range'
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[melee|mage|range] [attackstyle:string] [spell:string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [combatStyle, attackStyle, spell]: [combatStyle, string, string]): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change combat style!`
			);
		}
		const oldCombatStyle = msg.author.settings.get(UserSettings.Minion.CombatStyle);
		await msg.author.settings.update(UserSettings.Minion.MeleeAttackStyle, 'accurate');
		
		if (!combatStyle) {
			return msg.send(
				`${msg.author.minionName} is currently using combat style ${oldCombatStyle}. To swap style type \`${msg.cmdPrefix}combatstyle melee/range/mage\`.`
			);
		}

		if (!attackStyle) {
			await msg.author.settings.update(UserSettings.Minion.CombatStyle, combatStyle);

			msg.author.log(`Changed combatStyle to ${combatStyle}`);

			return msg.send(
				`${msg.author.minionName} changed main combat style from ${oldCombatStyle} to ${combatStyle}.`
			);
		}
		
		if (combatStyle === 'melee') {
			const weapon = msg.author.equippedWeapon(GearSetupTypes.Melee);
			await msg.author.settings.update(UserSettings.Minion.CombatStyle, combatStyle);

			for (let stance of weapon!.weapon!.stances) {
				if (stance.attack_style.toLowerCase === attackStyle.toLowerCase) {
					await msg.author.settings.update(UserSettings.Minion.MeleeAttackStyle, attackStyle.toLowerCase);

					return msg.send(
						`${msg.author.minionName} changed main combat style from ${oldCombatStyle} to ${combatStyle} and melee attack style to ${attackStyle}.`
					);
				}
			}

			return msg.send(`The attackstyle ${attackStyle} dosen't match any of the styles that the current equipped melee weapon ${weapon?.name} got. The following attack styles is possible: ${weapon?.weapon?.stances.map(styles => styles.attack_style).join(', ')}.`
			);
		}
		
		return msg.send(spell);
	}
}