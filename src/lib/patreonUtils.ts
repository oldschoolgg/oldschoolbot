import { BadgesEnum } from './constants';
import { populateRoboChimpCache } from './perkTier';

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
			await prisma.user.updateMany({
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

	const usersToGiveBadge = users.filter(
		u => !u.badges.includes(BadgesEnum.Patron) && !u.badges.includes(BadgesEnum.LimitedPatron)
	);
	await prisma.user.updateMany({
		where: {
			id: {
				in: usersToGiveBadge.map(u => u.id)
			}
		},
		data: {
			badges: {
				push: BadgesEnum.Patron
			}
		}
	});

	await populateRoboChimpCache();
}
