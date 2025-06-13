import { Prisma } from '@prisma/client';
import { courses } from '../skilling/skills/agility';
import Farming from '../skilling/skills/farming';
import Woodcutting from '../skilling/skills/woodcutting/woodcutting';
import type { Plant } from '../skilling/types';
import { Bank, type ItemBank } from '../util';
import itemID from './itemID';

export async function xpDry(itemID: number, column: string, ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;
	const res = await prisma.$queryRaw<{ id: string; val: bigint }[]>(Prisma.sql`
               SELECT id, ${Prisma.raw(column)}::bigint AS val
               FROM users
               WHERE "collectionLogBank"->>'${itemID}' IS NULL
               ${ironSQL}
               ORDER BY ${Prisma.raw(column)}::bigint DESC
               LIMIT 10;
       `);
	return res.map(r => ({ id: r.id, val: `${Number(r.val).toLocaleString()} XP` }));
}

export async function babyChinchompaDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;
	const chinRates = {
		grey: 131395,
		red: 98373,
		black: 82758
	};

	const res = await prisma.$queryRaw<
		{
			id: string;
			hunter_level: number;
			grey: number;
			red: number;
			black: number;
		}[]
	>(Prisma.sql`
		SELECT users.id,
			stats.skills_hunter AS hunter_level,
			COALESCE(("creature_scores"->>'7')::int, 0) AS grey,
			COALESCE(("creature_scores"->>'8')::int, 0) AS red,
			COALESCE(("creature_scores"->>'9')::int, 0) AS black
		FROM users
		INNER JOIN user_stats stats ON stats.user_id::text = users.id
		WHERE "collectionLogBank"->>'13323' IS NULL
		${ironSQL}
	`);

	function getChance(base: number, level: number): number {
		return 1 / (base - level * 25);
	}

	// Add expected pets & sort
	const withExpected = res.map(user => {
		const level = user.hunter_level;
		const expected =
			user.grey * getChance(chinRates.grey, level) +
			user.red * getChance(chinRates.red, level) +
			user.black * getChance(chinRates.black, level);

		const total = user.grey + user.red + user.black;

		return {
			id: user.id,
			grey: user.grey,
			red: user.red,
			black: user.black,
			total,
			expected
		};
	});

	const sorted = withExpected.sort((a, b) => b.expected - a.expected).slice(0, 10);

	return sorted.map(u => ({
		id: u.id,
		val: `${u.total.toLocaleString()} caught (${u.grey.toLocaleString()} grey, ${u.red.toLocaleString()} red, ${u.black.toLocaleString()} black) - ${u.expected.toFixed(2)}x expected`
	}));
}

export async function squirrelDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const courseMap = new Map<number, number>();
	for (const course of courses) {
		if (typeof course.petChance === 'number') {
			courseMap.set(course.id, course.petChance);
		}
	}

	const ids = [...courseMap.keys()];

	const res = await prisma.$queryRaw<
		Array<{ id: string; skills_agility: number } & Record<`lap_${number}`, string>>
	>(Prisma.sql`
		SELECT users.id, stats.skills_agility,
			${Prisma.raw(ids.map(id => `COALESCE(("laps_scores"->>'${id}')::int, 0) AS "lap_${id}"`).join(', '))}
		FROM users
		INNER JOIN user_stats stats ON stats.user_id::text = users.id
		WHERE "collectionLogBank"->>'20659' IS NULL
		${ironSQL}
	`);

	const results = res.map(row => {
		let totalLaps = 0;
		let expectedPets = 0;

		for (const id of ids) {
			const laps = Number(row[`lap_${id}`] ?? 0);
			totalLaps += laps;
			const rate = courseMap.get(id)!;
			expectedPets += laps / rate;
		}

		return {
			id: row.id,
			expected: expectedPets,
			laps: totalLaps
		};
	});

	const sorted = results.sort((a, b) => b.expected - a.expected).slice(0, 10);

	return sorted.map(r => ({
		id: r.id,
		val: `${r.laps.toLocaleString()} laps - ${r.expected.toFixed(2)}x expected`
	}));
}

export async function tanglerootDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const rows = await prisma.$queryRaw<{ id: string; item_id: number; qty: number }[]>(Prisma.sql`
		SELECT fc.user_id::text AS id, fc.item_id, COUNT(*)::int AS qty
		FROM farmed_crop fc
		JOIN users u ON u.id = fc.user_id
		WHERE fc.date_harvested IS NOT NULL
			AND u."collectionLogBank"->>'20661' IS NULL
			${ironSQL}
		GROUP BY fc.user_id, fc.item_id
	`);

	const plantMap = new Map<number, Plant>();
	for (const plant of Farming.Plants) {
		if (plant.givesCrops && plant.petChance > 0) {
			plantMap.set(plant.id, plant);
		}
	}

	const userData: Record<string, { total: number; expected: number; crops: [string, number, number][] }> = {};

	for (const row of rows) {
		const plant = plantMap.get(row.item_id);
		if (!plant) continue;

		if (!userData[row.id]) {
			userData[row.id] = { total: 0, expected: 0, crops: [] };
		}

		const expectedFromThisCrop = row.qty / plant.petChance;
		userData[row.id].crops.push([plant.name, row.qty, expectedFromThisCrop]);
		userData[row.id].total += row.qty;
		userData[row.id].expected += expectedFromThisCrop;
	}

	const sorted = Object.entries(userData)
		.sort((a, b) => b[1].expected - a[1].expected)
		.slice(0, 10);

	return sorted.map(([id, data]) => {
		// Sort crops by quantity descending
		const topCrop = data.crops.sort((a, b) => b[1] - a[1])[0];
		const topCropStr = topCrop ? `${topCrop[1]} ${topCrop[0]}` : 'No data';

		return {
			id,
			val: `${topCropStr} (${data.total.toLocaleString()} total – ${data.expected.toFixed(2)}x expected)`
		};
	});
}

export async function beaverDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const rows = await prisma.$queryRaw<{ id: string; log_id: number; qty: number }[]>(Prisma.sql`
		SELECT u.id::text, (a.data->>'logID')::int AS log_id, SUM((a.data->>'quantity')::int) AS qty
		FROM activity a
		JOIN users u ON u.id = a.user_id
		WHERE a.type = 'Woodcutting'
			AND a.completed = true
			AND a.data->>'logID' IS NOT NULL
			AND u."collectionLogBank"->>'13322' IS NULL
			${ironSQL}
		GROUP BY u.id, log_id
	`);

	const logMap = new Map<number, { name: string; petChance: number }>();
	for (const log of Woodcutting.Logs) {
		if (log.petChance) {
			logMap.set(log.id, { name: log.name, petChance: log.petChance });
		}
	}

	const users: Record<string, { total: number; expected: number; logs: [string, number, number][] }> = {};

	for (const row of rows) {
		const logInfo = logMap.get(row.log_id);
		if (!logInfo) continue;

		if (!users[row.id]) users[row.id] = { total: 0, expected: 0, logs: [] };

		const expected = row.qty / logInfo.petChance;
		users[row.id].total += row.qty;
		users[row.id].expected += expected;
		users[row.id].logs.push([logInfo.name, row.qty, expected]);
	}

	const sorted = Object.entries(users)
		.sort((a, b) => b[1].expected - a[1].expected)
		.slice(0, 10);

	return sorted.map(([id, data]) => {
		const topLog = data.logs.sort((a, b) => b[1] - a[1])[0];
		const topLogStr = topLog ? `${topLog[1].toLocaleString()} ${topLog[0]}` : 'No data';

		return {
			id,
			val: `${topLogStr} (${data.total.toLocaleString()} total – ${data.expected.toFixed(2)}x expected)`
		};
	});
}

export async function riftGuardianDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	// Get users with no Rift guardian pet
	const users = await prisma.$queryRaw<{ id: string; runecraft: number }[]>(Prisma.sql`
		SELECT u.id::text, s.skills_runecraft
		FROM users u
		JOIN user_stats s ON s.user_id::text = u.id
		WHERE u."collectionLogBank"->>'20667' IS NULL
		${ironSQL}
	`);

	// Load lootTrack rows for relevant RC activity types
	const allLootTracks = await prisma.lootTrack.findMany({
		where: {
			type: 'Skilling',
			user_id: {
				in: users.map(u => BigInt(u.id))
			},
			key: {
				in: ['ourania_altar', 'darkaltar', 'runecraft']
			}
		}
	});

	const bloodRuneID = itemID('Blood rune');
	const soulRuneID = itemID('Soul rune');

	const altarChances = {
		blood: 804_984,
		soul: 782_999,
		ourania: 1_487_213,
		default: 1_795_758
	};

	const runeTotalsPerUser: Record<string, { blood: number; soul: number; ourania: number; other: number }> = {};

	for (const row of allLootTracks) {
		if (!row.user_id || !row.loot) continue;
		const userID = row.user_id.toString();
		if (!runeTotalsPerUser[userID]) {
			runeTotalsPerUser[userID] = { blood: 0, soul: 0, ourania: 0, other: 0 };
		}

		const lootBank = new Bank(row.loot as ItemBank);
		for (const [item, qty] of lootBank.items()) {
			const id = typeof item === 'number' ? item : item.id;
			if (id === bloodRuneID) {
				runeTotalsPerUser[userID].blood += qty;
			} else if (id === soulRuneID) {
				runeTotalsPerUser[userID].soul += qty;
			} else if (row.key === 'ourania_altar') {
				runeTotalsPerUser[userID].ourania += qty;
			} else {
				runeTotalsPerUser[userID].other += qty;
			}
		}
	}

	// Build result set with expected pet rolls
	const results: { id: string; expected: number; total: number; top: [string, number] }[] = [];

	for (const u of users) {
		const totals = runeTotalsPerUser[u.id];
		if (!totals) continue;

		const level = u.runecraft;
		const expected =
			totals.blood / (altarChances.blood - level * 25) +
			totals.soul / (altarChances.soul - level * 25) +
			totals.ourania / (altarChances.ourania - level * 25) +
			totals.other / (altarChances.default - level * 25);

		const breakdown = (
			[
				['Blood runes', totals.blood],
				['Soul runes', totals.soul],
				['Ourania runes', totals.ourania],
				['Other runes', totals.other]
			] as [string, number][]
		).sort((a, b) => b[1] - a[1]);

		results.push({
			id: u.id,
			expected,
			total: totals.blood + totals.soul + totals.ourania + totals.other,
			top: breakdown[0]
		});
	}

	// Sort driest first
	const sorted = results.sort((a, b) => b.expected - a.expected).slice(0, 10);

	return sorted.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`
	}));
}
