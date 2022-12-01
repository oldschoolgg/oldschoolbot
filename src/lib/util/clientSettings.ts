import { ClientStorage, Prisma } from '@prisma/client';

import { CLIENT_ID } from '../../config';
import { prisma } from '../settings/prisma';

// Is not typesafe, returns only what is selected, but will say it contains everything.
export async function mahojiClientSettingsFetch(select?: Prisma.ClientStorageSelect) {
	const clientSettings = await prisma.clientStorage.findFirst({
		where: {
			id: CLIENT_ID
		},
		select
	});
	return clientSettings as ClientStorage;
}

export async function mahojiClientSettingsUpdate(data: Prisma.ClientStorageUpdateInput) {
	await prisma.clientStorage.update({
		where: {
			id: CLIENT_ID
		},
		data
	});
}
