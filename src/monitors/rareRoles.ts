import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import { TextChannel } from 'discord.js';

import { SupportServer, Emoji, Channel } from '../lib/constants';
import { roll } from '../lib/util';

// The actual rates are these numbers divided by 10.
const rareRoles: [string, number, string][] = [
	['670211706907000842', 250, 'Bronze'],
	['670211798091300864', 2500, 'Iron'],
	['688563471096348771', 5000, 'Steel'],
	['688563333464457304', 10_000, 'Mithril'],
	['688563389185917072', 15_000, 'Adamant'],
	['670212713258942467', 25_000, 'Rune'],
	['670212821484568577', 50_000, 'Dragon'],
	['670212821484568577', 75_000, 'Barrows'],
	['688563780686446649', 100_000, 'Justiciar'],
	['670212876832735244', 10_000_000, 'Third Age']
];

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreBots: true,
			ignoreEdits: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) {
			return;
		}

		if (!msg.command && !msg.author.bot) {
			return;
		}

		if (!roll(10)) return;

		for (const [roleID, chance, name] of rareRoles) {
			if (roll(chance / 10)) {
				if (msg.member?.roles.has(roleID)) continue;
				if (!this.client.production) {
					return msg.send(`${msg.author}, you would've gotten the **${name}** role.`);
				}
				msg.member?.roles.add(roleID);
				msg.react(Emoji.Gift);

				const channel = this.client.channels.get(Channel.Notifications);

				if (
					!rareRoles
						.slice(0, 3)
						.map(i => i[2])
						.includes(name)
				) {
					(channel as TextChannel).send(
						`${Emoji.Fireworks} **${msg.author.username}** just received the **${name}** role. `
					);
				}
				break;
			}
		}
	}
}
