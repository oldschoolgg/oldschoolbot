import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { getGuildSettings } from '../lib/settings/settings';
import { GuildSettings } from '../lib/settings/types/GuildSettings';

export default class extends Inhibitor {
	async run(message: KlasaMessage, command: Command) {
		if (!command.enabled) throw message.language.get('INHIBITOR_DISABLED_GLOBAL');
		if (!message.guild) return false;
		const settings = await getGuildSettings(message.guild);
		if (settings.get(GuildSettings.DisabledCommands).includes(command.name))
			throw message.language.get('INHIBITOR_DISABLED_GUILD');
	}
}
