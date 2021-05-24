import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/settings/types/GuildSettings';

export default class extends Inhibitor {
    public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}
	public async run(msg: KlasaMessage, command: Command) {
		if (command.disabled && !msg.guild!.settings.get(GuildSettings.Silenced)) {
			throw "This command has been disabled.";
		}
        else if (command.disabled) {
            return true;
        }
	}
}