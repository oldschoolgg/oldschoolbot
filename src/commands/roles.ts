import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { Roles, SupportServer } from '../lib/constants';
import { BotCommand } from '../lib/structures/BotCommand';
import { PingableRolesTable } from '../lib/typeorm/PingableRoles.entity';
import { stringMatches } from '../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			cooldown: 2,
			subcommands: true,
			usage: '[add|remove] [role:role|str:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		const roles = await PingableRolesTable.find();
		const allRolesStr = roles.map(r => `${r.id}. ${r.name}`).join('\n');
		if (str && msg.member) {
			const role = roles.find(i => i.id === Number(str) || stringMatches(i.name, str));
			if (!role) {
				return msg.channel.send(`That's not a valid role.\n${allRolesStr}`);
			}
			const has = msg.member.roles.has(role.roleID);
			if (!has) {
				await msg.member.roles.add(role.roleID);
				return msg.channel.send(
					`Added the \`${role.name}\` role to you. You can remove this using the same command again.`
				);
			}
			await msg.member.roles.remove(role.roleID);
			return msg.channel.send(`Removed \`${role.name}\`.`);
		}

		return msg.channel.send(`Here are the roles you can get: \n${allRolesStr}`);
	}

	async add(msg: KlasaMessage, [role]: [Role]) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			!role ||
			[
				'342983479501389826',
				Roles.Moderator,
				'590527706974781470',
				'346238402737340416'
			].includes(role.id) ||
			!msg.member ||
			!msg.member!.roles.has(Roles.Moderator)
		) {
			return;
		}
		const entity = new PingableRolesTable();
		entity.name = role.name;
		entity.roleID = role.id;
		try {
			await entity.save();
			return msg.channel.send(`Added \`${role.name}\` as a pingable role - ${entity.id}.`);
		} catch (_) {}
	}

	async remove(msg: KlasaMessage, [role]: [Role]) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (!role || !msg.member || !msg.member!.roles.has(Roles.Moderator)) {
			return;
		}
		const entity = await PingableRolesTable.findOne({ roleID: role.id });
		if (!entity) return;
		await entity.remove();
		return msg.channel.send(`Deleted.`);
	}
}
