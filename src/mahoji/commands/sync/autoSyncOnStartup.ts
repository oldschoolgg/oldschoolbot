import { type REST, Routes } from 'discord.js';

import { logError } from '@/lib/util/logError.js';
import { buildPayloadsFromAllCommands } from '@/mahoji/commands/sync/buildPayloads.js';

export async function autoSyncOnStartup({
	rest,
	clientId,
	supportGuildId,
	isProduction
}: {
	rest: REST;
	clientId: string;
	supportGuildId: string;
	isProduction: boolean;
}) {
	const { globalPayload, supportGuildPayload } = buildPayloadsFromAllCommands({ isProduction });

	try {
		await rest.put(Routes.applicationGuildCommands(clientId, supportGuildId), {
			body: supportGuildPayload
		});
		console.log('Synced support guild application commands on startup.');
	} catch (error) {
		logError(error, {
			action: 'sync support guild application commands on startup'
		});
	}

	if (isProduction) {
		try {
			await rest.put(Routes.applicationCommands(clientId), {
				body: globalPayload
			});
			console.log('Synced global application commands on startup.');
		} catch (error) {
			logError(error, {
				action: 'sync global application commands on startup'
			});
		}
	} else {
		try {
			await rest.put(Routes.applicationCommands(clientId), {
				body: []
			});
			console.log('Cleared global application commands on startup (non-production).');
		} catch (error) {
			logError(error, {
				action: 'clear global application commands on startup (non-production)'
			});
		}
	}
}
