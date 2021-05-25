import { CommandStore, KlasaMessage } from 'klasa';

import { SupportServer } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { PingableRolesTable } from '../../lib/typeorm/PingableRoles.entity';
import { stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<name:str{1,32}>'
		});
	}

	async run(message: KlasaMessage, [str]: [string]) {
		if (!message.guild || message.guild.id !== SupportServer) return;
		const roles = await PingableRolesTable.find();
		const roleToPing = roles.find(i => i.id === Number(str) || stringMatches(i.name, str));
		if (!roleToPing) {
			return message.channel.send(`No role with that name found.`);
		}
		if (!message.member) return;
		if (!message.member?.roles.has('759572886364225558')) {
			return;
		}
		return message.channel.send(
			`<@&${roleToPing.roleID}> You were pinged because you have this role, you can remove it using \`+role ${roleToPing.name}\`.`
		);
	}
}
