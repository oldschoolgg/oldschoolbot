import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { Roles, SupportServer } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { BotCommand } from '../lib/structures/BotCommand';
import { stringMatches } from '../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			subcommands: true,
			usage: '[add|remove] [role:role|str:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		const roles = await prisma.pingableRole.findMany();
		const allRolesStr = roles.map(r => `${r.id}. ${r.name}`).join('\n');
		if (str && msg.member) {
			const role = roles.find(i => i.id === Number(str) || stringMatches(i.name, str));
			if (!role) {
				return msg.channel.send(`That's not a valid role.\n${allRolesStr}`);
			}
			const has = msg.member.roles.cache.has(role.role_id);
			if (!has) {
				await msg.member.roles.add(role.role_id);
				return msg.channel.send(
					`Added the \`${role.name}\` role to you. You can remove this using the same command again.`
				);
			}
			await msg.member.roles.remove(role.role_id);
			return msg.channel.send(`Removed \`${role.name}\`.`);
		}

		return msg.channel.send(`Here are the roles you can get: \n${allRolesStr}`);
	}

	async add(msg: KlasaMessage, [role]: [Role]) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			!role ||
			// 346238402737340416 = Bot role
			// 590527706974781470 = Skira role
			[Roles.Moderator, '590527706974781470', '346238402737340416'].includes(role.id) ||
			!msg.member ||
			!msg.member!.roles.cache.has(Roles.Moderator)
		) {
			return;
		}
		const result = await prisma.pingableRole.create({
			data: {
				name: role.name,
				role_id: role.id
			}
		});
		return msg.channel.send(`Added \`${role.name}\` as a pingable role - ${result.id}.`);
	}

	async remove(msg: KlasaMessage, [role]: [Role]) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (!role || !msg.member || !msg.member!.roles.cache.has(Roles.Moderator)) {
			return;
		}
		const entity = await prisma.pingableRole.findFirst({ where: { role_id: role.id } }); // PingableRolesTable.findOne({ roleID: role.id });
		if (!entity) return;
		await prisma.pingableRole.delete({
			where: {
				role_id: role.id
			}
		});
		return msg.channel.send('Deleted.');
	}
}
