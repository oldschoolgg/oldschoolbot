import { activity_type_enum } from '@prisma/client';
import { KlasaUser } from 'klasa';

import { prisma } from './settings/prisma';
import { RevenantOptions } from './types/minions';

export async function handleNaxxusTeaser(user: KlasaUser): Promise<boolean> {
	const lastTwoActivities = await prisma.activity.findMany({
		where: {
			user_id: BigInt(user.id)
		},
		take: 2,
		orderBy: {
			finish_date: 'desc'
		}
	});
	if (
		!lastTwoActivities.some(
			i => i.type === activity_type_enum.Revenants && (i.data as unknown as RevenantOptions).skulled
		)
	) {
		return false;
	}
	if (!user.hasItemEquippedAnywhere("Viggora's chainmace")) return false;
	if (user.cl().has('Tormented skull')) return false;
	return true;
}
