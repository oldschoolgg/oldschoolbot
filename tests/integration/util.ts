import { randomSnowflake } from '@oldschoolgg/toolkit';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { globalConfig } from '../../src/lib/constants';
import { prisma } from '../../src/lib/settings/prisma';
import { OSBMahojiCommand } from '../../src/mahoji/lib/util';

export const commandRunOptions = (userID: string): Omit<CommandRunOptions, 'options'> => ({
	userID,
	guildID: '342983479501389826',
	member: {} as any,
	user: { id: userID } as any,
	channelID: '111111111',
	interaction: {
		deferReply: () => Promise.resolve()
	} as any,
	client: {} as any
});

interface UserOptions {
	ownedBank?: Bank;
	id?: string;
}

export async function integrationCmdRun({
	command,
	options = {},
	userOptions
}: {
	command: OSBMahojiCommand;
	options?: object;
	userOptions?: UserOptions;
}) {
	const userId = userOptions?.id ?? randomSnowflake();
	await prisma.user.upsert({
		create: {
			id: userId,
			bank: userOptions?.ownedBank?.bank
		},
		update: {
			bank: userOptions?.ownedBank?.bank
		},
		where: {
			id: userId
		}
	});
	const result = await command.run({ ...commandRunOptions(userId), options });
	return result;
}

export async function mockClient() {
	const clientId = randomSnowflake();
	const client = await prisma.clientStorage.create({
		data: {
			id: clientId
		}
	});

	globalConfig.clientID = clientId;
	return client;
}
