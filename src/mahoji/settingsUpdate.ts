import { Prisma } from '@prisma/client';

import { prisma } from '../lib/settings/prisma';
import { logError } from '../lib/util/logError';

export async function mahojiUserSettingsUpdate(user: string | bigint, data: Prisma.UserUpdateArgs['data']) {
	try {
		const newUser = await prisma.user.update({
			data,
			where: {
				id: user.toString()
			}
		});

		return { newUser };
	} catch (err) {
		logError(err, {
			user_id: user.toString(),
			updated_data: JSON.stringify(data)
		});
		throw err;
	}
}
