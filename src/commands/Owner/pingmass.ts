import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { Roles, SupportServer } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pm'],
			cooldown: 60 * 5
		});
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (!msg.member) return;
		if (!(msg.channel instanceof TextChannel)) return;
		if (!msg.member.roles.has('734055552933429280') && !msg.member.roles.has(Roles.Moderator)) {
			return;
		}
		if (msg.channel.id === '789717054902763520') {
			return msg.send(`<@&789724904885846016>`);
		}

		if (msg.channel.parentID === '835876917252587581') {
			return msg.send(`<@&836539487815204865>`);
		}
		return msg.send('<@&711215501543473182>');
	}
}
