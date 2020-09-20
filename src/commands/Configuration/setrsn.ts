import { Command, CommandStore, KlasaMessage } from 'klasa';

import { BadgesEnum } from '../../lib/constants';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[rsn:str{1,12}]'
		});
	}

	async run(msg: KlasaMessage, [newRSN]: [string]) {
		await msg.author.settings.sync(true);
		const RSN = msg.author.settings.get(UserSettings.RSN);
		if (!newRSN && RSN) {
			return msg.sendLocale('RSN_CURRENT', [msg.author.settings.get(UserSettings.RSN)]);
		}

		if (!newRSN && !RSN) {
			return msg.sendLocale('RSN_NOT_SET', [
				msg.guild?.settings.get(GuildSettings.Prefix) ?? '+'
			]);
		}

		newRSN = newRSN.toLowerCase();
		if (!newRSN.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$')) {
			return msg.sendLocale('RSN_INVALID');
		}

		if (RSN === newRSN) {
			return msg.sendLocale('RSN_SET_ALREADY', [RSN]);
		}

		if (RSN !== null) {
			await msg.author.settings.update(UserSettings.RSN, newRSN);
			msg.sendLocale('RSN_CHANGED', [RSN, newRSN]);
		} else {
			await msg.author.settings.update(UserSettings.RSN, newRSN);
			msg.sendLocale('RSN_SET_TO', [newRSN]);
		}

		// If this user has the booster badge, cache their new username.
		if (msg.author.settings.get(UserSettings.Badges).includes(BadgesEnum.Booster)) {
			this.client.tasks.get('badges')!.run();
		}

		return null;
	}
}
