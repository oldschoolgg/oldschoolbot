import { randArrItem, randInt, SeedableRNG } from '@oldschoolgg/rng';
import { randomSnowflake } from '@oldschoolgg/util';
import { generateRandomBank } from 'oldschooljs';
import { chunk, pick } from 'remeda';

import { initPrismaClients } from '@/lib/prisma.js';

const userIds: bigint[] = [];

const rng = new SeedableRNG(1);
for (let i = 0; i < 1000; i++) {
	userIds.push(BigInt(randomSnowflake(rng)));
}

const userIdsStr: string[] = userIds.map(id => id.toString());

async function seedRobochimpDb() {
	await roboChimpClient.$transaction([
		...userIds.map(id =>
			roboChimpClient.user.upsert({
				where: { id },
				create: {
					id
				},
				update: {}
			})
		),
		...userIds.map(id =>
			roboChimpClient.discordUser.upsert({
				where: { id: id.toString() },
				create: {
					id: id.toString(),
					username: `User${id.toString().slice(0, 6)}`,
					created_at: new Date()
				},
				update: {}
			})
		)
	]);

	await osbClient.$transaction([
		...userIdsStr.map(id =>
			osbClient.user.upsert({
				where: { id },
				create: {
					id
				},
				update: {}
			})
		)
	]);
	await bsoClient.$transaction([
		...userIdsStr.map(id =>
			bsoClient.user.upsert({
				where: { id },
				create: {
					id
				},
				update: {}
			})
		)
	]);

	const userPairs = chunk(userIds, 2).filter(pair => pair.length === 2);

	await osbClient.$transaction(
		userPairs.map(([user1, user2]) =>
			osbClient.economyTransaction.create({
				data: {
					sender: user1,
					recipient: user2!,
					items_sent: generateRandomBank(randInt(1, 30)).toJSON(),
					items_received: generateRandomBank(randInt(1, 30)).toJSON(),
					type: randArrItem(['trade', 'gift', 'giveaway', 'duel'])
				}
			})
		)
	);
	await bsoClient.$transaction(
		userPairs.map(([user1, user2]) =>
			bsoClient.economyTransaction.create({
				data: {
					sender: user1,
					recipient: user2!,
					items_sent: generateRandomBank(randInt(1, 30)).toJSON(),
					items_received: generateRandomBank(randInt(1, 30)).toJSON(),
					type: randArrItem(['trade', 'gift', 'giveaway', 'gri', 'duel'])
				}
			})
		)
	);
}

async function main() {
	await initPrismaClients();
	await seedRobochimpDb();
}

main();
