import { CommandStore, KlasaMessage } from 'klasa';

import { Roles, SupportServer } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { BotCommand } from '../lib/structures/BotCommand';
import { stringMatches } from '../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str{1,32}>'
		});
	}

	async run(message: KlasaMessage, [str]: [string]) {
		if (!message.guild || message.guild.id !== SupportServer) return;
		const roles = await prisma.pingableRole.findMany();
		const roleToPing = roles.find(i => i.id === Number(str) || stringMatches(i.name, str));
		if (!roleToPing) {
			return message.channel.send('No role with that name found.');
		}
		if (!message.member) return;
		if (!message.member.roles.cache.has(Roles.BSOMassHoster)) {
			return;
		}
		return message.channel.send(
			`<@&${roleToPing.role_id}> You were pinged because you have this role, you can remove it using \`=roles ${roleToPing.name}\`.`
		);
	}
}
