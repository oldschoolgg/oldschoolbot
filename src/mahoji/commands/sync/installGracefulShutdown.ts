import { type REST, Routes } from 'discord.js';

let isInstalled = false;

export function installGracefulShutdown({
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
	if (isInstalled) {
		return;
	}
	isInstalled = true;

	let handlingSignal = false;

	const clearGuildCommands = async () => {
		try {
			await rest.put(Routes.applicationGuildCommands(clientId, supportGuildId), {
				body: []
			});
			console.log('Cleared support guild application commands on shutdown.');
		} catch (error) {
			console.error('Failed to clear guild commands on shutdown:', error);
		}
	};

	const clearGlobalCommands = async () => {
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
	};

	const handler = async () => {
		if (handlingSignal) {
			return;
		}
		handlingSignal = true;

		await clearGuildCommands();
		await clearGlobalCommands();
		process.exit(0);
	};

	void import('exit-hook')
		.then(({ asyncExitHook }) =>
			asyncExitHook(
				async () => {
					await clearGuildCommands();
					await clearGlobalCommands();
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
