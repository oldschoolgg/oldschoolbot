import { populateRoboChimpCache } from '../mahoji/lib/perkTier';
import { BadgesEnum } from './constants';

export async function handleDeletedPatron(userID: string[]) {
	const users = await prisma.user.findMany({
		where: {
			id: {
				in: userID
			}
		}
	});

	for (const user of users) {
		if (user.badges.includes(BadgesEnum.Patron) || user.badges.includes(BadgesEnum.LimitedPatron)) {
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					badges: user.badges.filter(b => b !== BadgesEnum.Patron && b !== BadgesEnum.LimitedPatron)
				}
			});
		}
	}

	await populateRoboChimpCache();
}

export async function handleEditPatron(userID: string[]) {
	const users = await prisma.user.findMany({
		where: {
			id: {
				in: userID
			}
		}
	});

	for (const user of users) {
		if (!user.badges.includes(BadgesEnum.Patron) && !user.badges.includes(BadgesEnum.LimitedPatron)) {
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					badges: {
						push: BadgesEnum.Patron
					}
				}
			});
		}
	}

	await populateRoboChimpCache();
}
