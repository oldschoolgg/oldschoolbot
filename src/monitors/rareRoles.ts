import { TextChannel } from 'discord.js';
import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { Channel, Emoji, SupportServer, Time } from '../lib/constants';
import { roll } from '../lib/util';

const rareRoles: [string, number, string][] = [
	['670211706907000842', 250, 'Bronze'],
	['706511231242076253', 1000, 'Xerician'],
	['670211798091300864', 2500, 'Iron'],
	['688563471096348771', 5000, 'Steel'],
	['705987772372221984', 7500, 'Void'],
	['688563333464457304', 10_000, 'Mithril'],
	['688563389185917072', 15_000, 'Adamant'],
	['705988547202515016', 20_000, "Inquisitor's"],
	['670212713258942467', 25_000, 'Rune'],
	['705988292646141983', 30_000, 'Obsidian'],
	['706512132899995648', 40_000, 'Crystal'],
	['670212821484568577', 50_000, 'Dragon'],
	['706508079184871446', 60_000, 'Bandos'],
	['706512315805204502', 65_000, 'Armadyl'],
	['688563635873644576', 75_000, 'Barrows'],
	['705988130401943643', 80_000, 'Ancestral'],
	['706510440452194324', 85_000, "Dagon'hai"],
	['706510238643388476', 90_000, 'Lunar'],
	['688563780686446649', 100_000, 'Justiciar'],
	['670212876832735244', 1_000_000, 'Third Age']
];

export default class extends Monitor {
	public userCache: { [key: string]: number } = {};

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreBots: false,
			ignoreEdits: true,
			ignoreSelf: false
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer || msg.command) {
			return;
		}

		const lastMessage = this.userCache[msg.author.id] || 1;
		if (Date.now() - lastMessage < Time.Second * 13) return;
		this.userCache[msg.author.id] = Date.now();

		if (!roll(10)) return;

		for (const [roleID, chance, name] of rareRoles) {
			if (roll(chance / 10)) {
				if (msg.member?.roles.cache.has(roleID)) continue;
				if (!this.client.production) {
					return msg.send(`${msg.author}, you would've gotten the **${name}** role.`);
				}
				msg.member?.roles.add(roleID);
				msg.react(Emoji.Gift);

				const channel = this.client.channels.cache.get(Channel.Notifications);

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
