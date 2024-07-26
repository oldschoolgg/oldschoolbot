import type { ClientStorage, Prisma } from '@prisma/client';

import { globalConfig } from '../constants';

export async function mahojiClientSettingsFetch() {
	const clientSettings = await prisma.clientStorage.upsert({
		create: {
			id: globalConfig.clientID
		},
		where: {
			id: globalConfig.clientID
		},
		update: {}
	});
	return clientSettings as ClientStorage;
}

export async function mahojiClientSettingsUpdate(data: Prisma.ClientStorageUpdateInput) {
	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data,
		select: {
			id: true
		}
	});
}
