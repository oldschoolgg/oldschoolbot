import { ArrayActions } from '@klasa/settings-gateway';
import { CommandStore, KlasaMessage } from 'klasa';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[tier:string]',
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [tier]: ['0' | '1' | '2' | '3']) {
		const types = {
			'0': null,
			'1': BitField.IsPatronTier1,
			'2': BitField.IsPatronTier2,
			'3': BitField.IsPatronTier3
		};
		if (types[tier] !== undefined) {
			await msg.author.settings.update(UserSettings.BitField, types[tier], {
				arrayAction: ArrayActions.Overwrite
			});
			return msg.channel.send(
				`${
					tier !== '0'
						? `You are now Patreon Tier ${tier} on this testing bot.`
						: 'You removed your Patreon status'
				}`
			);
		}
		return msg.channel.send('You can only select 1, 2 or 3. Example: `?settier 3` for Tier 3 Patreon.');
	}
}
