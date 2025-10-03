import { ApplicationCommandType, type REST, Routes } from 'discord.js';

import { convertCommandOptionToAPIOption } from '@/lib/discord/commandOptions.js';
import { adminCommand } from '@/mahoji/commands/admin.js';

interface GracefulShutdownOptions {
	rest: REST;
	clientId: string;
	supportGuildId: string;
	isProduction: boolean;
}

let isInstalled = false;
let hasClearedCommands = false;

async function clearSupportGuildCommands({ rest, clientId, supportGuildId }: GracefulShutdownOptions) {
	try {
		const adminCommandPayload = {
			type: ApplicationCommandType.ChatInput,
			name: adminCommand.name,
			description: adminCommand.description,
			options: adminCommand.options.map(convertCommandOptionToAPIOption)
		};
		await rest.put(Routes.applicationGuildCommands(clientId, supportGuildId), {
			body: [adminCommandPayload]
		});
		console.log('Cleared support guild application commands except /admin on shutdown.');
	} catch (error) {
		console.error('Failed to clear guild commands on shutdown:', error);
	}
}

async function clearGlobalCommands({ rest, clientId, isProduction }: GracefulShutdownOptions) {
	if (isProduction) {
		return;
	}
	try {
		await rest.put(Routes.applicationCommands(clientId), {
			body: []
		});
		console.log('Cleared global application commands on shutdown (non-production).');
	} catch (error) {
		console.error('Failed to clear global application commands on shutdown (non-production):', error);
	}
}

export async function clearApplicationCommands(options: GracefulShutdownOptions) {
	if (hasClearedCommands) {
		return;
	}
	hasClearedCommands = true;
	await clearSupportGuildCommands(options);
	await clearGlobalCommands(options);
}

export function installGracefulShutdown(options: GracefulShutdownOptions) {
	if (isInstalled) {
		return;
	}
	isInstalled = true;

	let handlingSignal = false;

	const handler = async () => {
		if (handlingSignal) {
			return;
		}
		handlingSignal = true;

		await clearApplicationCommands(options);
		process.exit(0);
	};

	void import('exit-hook')
		.then(({ asyncExitHook }) =>
			asyncExitHook(
				async () => {
					await clearApplicationCommands(options);
				},
				{ wait: 2000 }
			)
		)
		.catch(error => {
			console.error('Failed to register graceful shutdown exit hook:', error);
		});

	(['SIGINT', 'SIGTERM'] as const).forEach(signal => {
		process.on(signal, () => {
			void handler();
		});
	});
}
