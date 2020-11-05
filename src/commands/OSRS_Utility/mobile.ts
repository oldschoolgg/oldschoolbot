import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the link for the official OSRS mobile app.',
			examples: ['+mobile']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`
<https://oldschool.runescape.com/mobile>

**Play Store:** <https://play.google.com/store/apps/details?id=com.jagex.oldscape.android>
**App Store:** <https://itunes.apple.com/us/app/old-school-runescape/id1269648762>
`);
	}
}
