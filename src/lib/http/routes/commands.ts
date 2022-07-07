import { Time } from 'e';
import { ApplicationCommandOptionType } from 'mahoji';

import { AbstractCommand } from '../../../mahoji/lib/inhibitors';
import { allAbstractCommands } from '../../../mahoji/lib/util';
import { stringMatches } from '../../util';
import { FastifyServer } from '../types';

const mahojiCommands = globalClient.mahojiClient.commands.values;

const commandData = allAbstractCommands(globalClient.mahojiClient)
	.filter(c => typeof c.attributes?.description === 'string' && c.attributes.description.length > 1)
	.map((cmd: AbstractCommand) => {
		const botCommand = globalClient.commands.get(cmd.name);
		const mahojiCommand = mahojiCommands.find(i => stringMatches(i.name, cmd.name));
		const subOptions: string[] = [];
		if (mahojiCommand) {
			for (const option of mahojiCommand.options) {
				if (
					option.type === ApplicationCommandOptionType.SubcommandGroup ||
					option.type === ApplicationCommandOptionType.Subcommand
				) {
					subOptions.push(option.name);
				}
			}
		}
		return {
			name: cmd.name,
			desc: cmd.attributes?.description,
			examples: cmd.attributes?.examples,
			aliases: botCommand?.aliases ?? [],
			perkTier: cmd.attributes?.perkTier,
			flags: cmd.attributes?.categoryFlags,
			subOptions
		};
	})
	.sort((a, b) => a.name.localeCompare(b.name));

export const commandsRoute = (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/commands',
		async handler(_, reply) {
			reply.header(
				'Cache-Control',
				`public, max-age=${(Time.Minute * 5) / 1000}, s-maxage=${(Time.Minute * 5) / 1000}`
			);
			reply.send(commandData);
		}
	});
