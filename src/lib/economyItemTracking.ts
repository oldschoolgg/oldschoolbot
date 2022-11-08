import { Time } from 'e';

import { BitField, COINS_ID } from './constants';
import { prisma } from './settings/prisma';

export async function globalEconomyItemSync() {
	await prisma.$queryRawUnsafe(`INSERT INTO economy_item
SELECT item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users) AS banks
)
AS DATA
GROUP BY item_id;`);
}

export async function userEconomyItemSync() {
	// Only track it for people who have used the bot within the last 2 days.
	// Or, if they are a patron.
	const date = new Date(Date.now() - Time.Day * 2);
	console.log(`Only for users last cmd above ${date.toLocaleString()}`);
	const usersShouldSync = await prisma.user.findMany({
		where: {
			OR: [
				{
					last_command_date: {
						gt: date
					},
					minion_hasBought: true
				},
				{
					minion_hasBought: true,
					bitfield: {
						hasSome: [
							BitField.IsPatronTier1,
							BitField.IsPatronTier2,
							BitField.IsPatronTier3,
							BitField.IsPatronTier4,
							BitField.IsPatronTier5,
							BitField.IsPatronTier6,
							BitField.isModerator,
							BitField.isContributor,
							BitField.IsWikiContributor
						]
					}
				}
			]
		},
		select: {
			id: true,
			GP: true
		}
	});
	await prisma.userEconomyItem.createMany({
		data: usersShouldSync.map(i => ({
			user_id: BigInt(i.id),
			item_id: COINS_ID,
			quantity: i.GP
		}))
	});
	await prisma.$queryRawUnsafe(`INSERT INTO user_economy_item
SELECT id, item_id::integer, SUM(qty)::bigint FROM 
(
    SELECT id, (jdata).key AS item_id, (jdata).value::text::bigint AS qty FROM (select id, json_each(bank) AS jdata FROM users WHERE id in ${usersShouldSync.map(
		i => i.id
	)}) AS banks
)
AS DATA
GROUP BY item_id;`);
}
