import { Time } from 'e';

import { client } from '../../..';
import { AbstractCommand } from '../../../mahoji/lib/inhibitors';
import { allAbstractCommands } from '../../../mahoji/lib/util';
import { FastifyServer } from '../types';

export const commandsRoute = (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/commands',
		async handler(_, reply) {
			reply.header(
				'Cache-Control',
				`public, max-age=${(Time.Minute * 5) / 1000}, s-maxage=${(Time.Minute * 5) / 1000}`
			);
			reply.send(
				allAbstractCommands(client)
					.filter(c => typeof c.attributes?.description === 'string' && c.attributes.description.length > 1)
					.map((cmd: AbstractCommand) => {
						const botCommand = client.commands.get(cmd.name);
						return {
							name: cmd.name,
							desc: cmd.attributes?.description,
							examples: cmd.attributes?.examples,
							aliases: botCommand?.aliases ?? [],
							perkTier: cmd.attributes?.perkTier,
							flags: cmd.attributes?.categoryFlags
						};
					})
					.sort((a, b) => a.name.localeCompare(b.name))
			);
		}
	});
