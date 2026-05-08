import { Stopwatch } from '@oldschoolgg/toolkit';
import { randomSnowflake } from '@oldschoolgg/util';
import { MathRNG, SeedableRNG } from 'node-rng';
import { chunk } from 'remeda';

import { initPrismaClients } from '@/lib/prisma.js';
import bsoItemsJson from '../../../../data/bso/bso_items.json' with { type: 'json' };
import osbAllObtainableItems from '../../../../src/lib/resources/spritesheets/items-spritesheet.json' with {
	type: 'json'
};

const osbItemsKeys = Object.keys(osbAllObtainableItems);
const bsoItemsKeys = Object.keys(bsoItemsJson);

const userIds: bigint[] = [157797566833098752n];

const rng = new SeedableRNG(1);
for (let i = 0; i < 50; i++) {
	userIds.push(BigInt(randomSnowflake(rng)));
}

const userIdsStr: string[] = userIds.map(id => id.toString());

function generateRandomBank(amount: number) {
	const bank = new Map<string, number>();
	for (let i = 0; i < amount; i++) {
		const randItem = MathRNG.pick(osbItemsKeys);
		bank.set(randItem, MathRNG.randInt(1, 5));
	}
	return Object.fromEntries(bank);
}

function generateRandomBsoBank(qty: number) {
	const bank = generateRandomBank(10);
	for (let i = 0; i < qty; i++) {
		const randBsoItem = MathRNG.pick(bsoItemsKeys);
		bank[randBsoItem] = (bank[randBsoItem] ?? 0) + MathRNG.randInt(1, 5);
	}
	return bank;
}

async function seedRobochimpDb() {
	const sw = new Stopwatch();
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
	sw.check('Seeded RoboChimp users');

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
	sw.check('Seeded osb users');

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
	sw.check('Seeded bso users');

	const userPairs = chunk(userIds, 2).filter(pair => pair.length === 2);

	await osbClient.$transaction(
		userPairs.slice(0, 5).map(([user1, user2]) =>
			osbClient.economyTransaction.create({
				data: {
					sender: user1,
					recipient: user2!,
					items_sent: generateRandomBank(MathRNG.randInt(1, 30)),
					items_received: generateRandomBank(MathRNG.randInt(1, 30)),
					type: MathRNG.pick(['trade', 'gift', 'giveaway', 'duel'])
				}
			})
		)
	);
	sw.check('Seeded osb transactions');

	await bsoClient.$transaction(
		userPairs.slice(0, 5).map(([user1, user2]) =>
			bsoClient.economyTransaction.create({
				data: {
					sender: user1,
					recipient: user2!,
					items_sent: generateRandomBank(MathRNG.randInt(1, 30)),
					items_received: generateRandomBank(MathRNG.randInt(1, 30)),
					type: MathRNG.pick(['trade', 'gift', 'giveaway', 'gri', 'duel'])
				}
			})
		)
	);

	sw.check('Seeded bso transactions');

	await roboChimpClient.blacklistedEntity.deleteMany({});
	await roboChimpClient.$transaction([
		...userIds.slice(-5).map(id =>
			roboChimpClient.blacklistedEntity.upsert({
				where: { id },
				create: {
					type: 'user',
					id
				},
				update: {}
			})
		)
	]);
	sw.check('Seeded blacklists');

	const allUserIdsOsb = (
		await osbClient.user.findMany({
			select: {
				id: true
			}
		})
	).map(u => u.id);
	await osbClient.$transaction(
		allUserIdsOsb.map(id =>
			osbClient.user.update({
				where: { id },
				data: {
					minion_hasBought: true,
					bank: generateRandomBank(MathRNG.randInt(1, 100))
				}
			})
		)
	);
	sw.check('Seeded osb user banks');

	const allUserIdsBso = (
		await bsoClient.user.findMany({
			select: {
				id: true
			}
		})
	).map(u => u.id);
	await bsoClient.$transaction(
		allUserIdsBso.map(id =>
			bsoClient.user.update({
				where: { id },
				data: {
					minion_hasBought: true,
					bank: generateRandomBsoBank(100)
				}
			})
		)
	);
	sw.check('Seeded bso user banks');
	process.exit(0);
}

async function main() {
	if (process.env.NODE_ENV === 'production') {
		throw new Error('Seeding should not be run in production');
	}
	await initPrismaClients();
	await seedRobochimpDb();
}

main();
