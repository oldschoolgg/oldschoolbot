import './lib/prisma.js';
import './discord/client.js';

import { Bits } from '@/util.js';
import { globalConfig } from './constants.js';
import { startServer } from './http/server.js';

process.on('uncaughtException', err => {
	console.error(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
});

async function main() {
	console.log(`Started after ${process.uptime()}s`);
	await startServer();
	console.log(`Server started, logging in after ${process.uptime()}s`);
	await globalClient.login(globalConfig.botToken);
	console.log(
		`${globalClient.user!.username} logged in ${globalConfig.isProduction ? 'in production' : 'in dev'} after ${process.uptime()}s`
	);
	await roboChimpClient.user.update({
		where: {
			id: BigInt('157797566833098752')
		},
		data: {
			bits: {
				push: Bits.Admin
			}
		}
	});
}

main();
