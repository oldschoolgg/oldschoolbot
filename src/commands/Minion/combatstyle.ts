import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export enum combatStyle {
	Melee = 'melee',
	Mage = 'mage',
	Range = 'range',
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[melee|mage|range]'
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [combatStyle]: [combatStyle]): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change combat style!`
			);
		}
		const oldCombatStyle = msg.author.settings.get(UserSettings.Minion.CombatStyle);
		
		if (!combatStyle) {
			return msg.send(
				`${msg.author.minionName} is currently using combat style ${oldCombatStyle}. To swap style type \`${msg.prefix}combatstyle melee/range/mage\`.`
			);
		}

		await msg.author.settings.update(UserSettings.Minion.CombatStyle, combatStyle);

		msg.author.log(`Changed combatStyle to ${combatStyle}`);

		return msg.send(
			`${msg.author.minionName} changed main combat style from ${oldCombatStyle} to ${combatStyle}.`
		);
	}
}