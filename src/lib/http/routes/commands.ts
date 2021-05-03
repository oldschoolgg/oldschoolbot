import { client } from '../../..';
import { Time } from '../../constants';
import { BotCommand } from '../../structures/BotCommand';
import { FastifyServer } from '../types';

export const commandsRoute = (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/commands',
		async handler(_, reply) {
			const commands = client.commands.array() as BotCommand[];
			reply.header(
				'Cache-Control',
				`public, max-age=${(Time.Minute * 5) / 1000}, s-maxage=${(Time.Minute * 5) / 1000}`
			);
			reply.send(
				commands
					.filter(
						c =>
							typeof c.description === 'string' &&
							c.description.length > 1 &&
							c.permissionLevel < 9
					)
					.map((cmd: BotCommand) => ({
						name: cmd.name,
						desc: cmd.description,
						examples: cmd.examples,
						permissionLevel: cmd.permissionLevel,
						aliases: cmd.aliases,
						perkTier: cmd.perkTier,
						flags: cmd.categoryFlags
					}))
					.sort((a, b) => a.name.localeCompare(b.name))
			);
		}
	});
