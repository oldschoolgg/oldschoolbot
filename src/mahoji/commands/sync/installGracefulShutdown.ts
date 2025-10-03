import { REST, Routes } from 'discord.js';

let isInstalled = false;

export function installGracefulShutdown({
        rest,
        clientId,
        supportGuildId
}: {
        rest: REST;
        clientId: string;
        supportGuildId: string;
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

        const handler = async () => {
                if (handlingSignal) {
                        return;
                }
                handlingSignal = true;

                await clearGuildCommands();
                process.exit(0);
        };

        (['SIGINT', 'SIGTERM'] as const).forEach(signal =>
                process.on(signal, () => {
                        void handler();
                })
        );
}
