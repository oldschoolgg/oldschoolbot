import { Prisma } from '@prisma/client';
import { starSizes } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { MAX_XP } from '../constants';
import { plunderRooms } from '../minions/data/plunder';
import { courses } from '../skilling/skills/agility';
import Farming from '../skilling/skills/farming';
import Fishing from '../skilling/skills/fishing';
import { CamdozaalMine, MotherlodeMine, ores } from '../skilling/skills/mining';
import { stealables } from '../skilling/skills/thieving/stealables';
import Woodcutting from '../skilling/skills/woodcutting/woodcutting';
import type { Plant } from '../skilling/types';
import { Bank, type ItemBank, convertLVLtoXP, convertXPtoLVL } from '../util';
import itemID from './itemID';

function computeChance(base: number, xp: number): number {
	const level = convertXPtoLVL(xp);
	let chance = Math.max(base - level * 25, 1);
	if (xp >= MAX_XP) chance = Math.floor(chance / 15);
	return chance;
}

export async function babyChinchompaDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const chinRates = {
		grey: { base: 131_395, reduction: 25 },
		red: { base: 98_373, reduction: 65 },
		black: { base: 82_758, reduction: 75 }
	};

	const res = await prisma.$queryRaw<
		{
			id: string;
			hunter_level: bigint;
			grey: bigint;
			red: bigint;
			black: bigint;
		}[]
	>(Prisma.sql`
		SELECT u.id,
			   u."skills.hunter" AS hunter_level,
			   COALESCE((s.creature_scores->>'7')::int, 0) AS grey,
			   COALESCE((s.creature_scores->>'8')::int, 0) AS red,
			   COALESCE((s.creature_scores->>'9')::int, 0) AS black
		FROM users u
		JOIN user_stats s ON s.user_id::text = u.id
		WHERE u."collectionLogBank"->>'13323' IS NULL
		${ironSQL}
	`);

	function calcExpected(count: number, base: number, xp: number): number {
		const chance = computeChance(base, xp);
		return count / chance;
	}
	const withExpected = res
		.map(user => {
			const xp = Number(user.hunter_level);
			const grey = Number(user.grey);
			const red = Number(user.red);
			const black = Number(user.black);

			const expected =
				calcExpected(grey, chinRates.grey.base, xp) +
				calcExpected(red, chinRates.red.base, xp) +
				calcExpected(black, chinRates.black.base, xp);

			const total = grey + red + black;
			const actual = 0; // has no pet
			const dryPercent = expected > 0 ? ((expected - actual) / expected) * 100 : 0;

			return { id: user.id, grey, red, black, total, expected, dryPercent };
		})
		.filter(u => u.total > 0 && u.expected > 0);

	const sorted = withExpected.sort((a, b) => b.dryPercent - a.dryPercent).slice(0, 10);

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
   SELECT u.id, u."skills.agility" AS skills_agility,
			${Prisma.raw(ids.map(id => `COALESCE((s."laps_scores"->>'${id}')::int, 0) AS "lap_${id}"`).join(', '))}
	FROM users u
	JOIN user_stats s ON s.user_id::text = u.id
	WHERE u."collectionLogBank"->>'20659' IS NULL
	${ironSQL}
`);

	const results = res.map(row => {
		const xp = Number(row.skills_agility);
		const divisor = xp >= MAX_XP ? 15 : 1;
		let totalLaps = 0;
		let expectedPets = 0;

		for (const id of ids) {
			const laps = Number(row[`lap_${id}`] ?? 0);
			totalLaps += laps;
			const rate = courseMap.get(id)! / divisor;
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

	const rows = await prisma.$queryRaw<{ id: string; item_id: number; qty: number; farming_xp: bigint }[]>(Prisma.sql`
		SELECT fc.user_id::text AS id, fc.item_id, COUNT(*)::int AS qty, u."skills.farming" AS farming_xp
		FROM farmed_crop fc
		JOIN users u ON fc.user_id::text = u.id
		WHERE fc.date_harvested IS NOT NULL
				AND u."collectionLogBank"->>'20661' IS NULL
				${ironSQL}
		GROUP BY fc.user_id, fc.item_id, u."skills.farming"
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

		const xp = Number(row.farming_xp);
		const chance = computeChance(plant.petChance, xp);
		const expectedFromThisCrop = row.qty / chance;
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

	const rows = await prisma.$queryRaw<
		{ id: string; log_id: number; qty: number; woodcutting_xp: bigint }[]
	>(Prisma.sql`
		SELECT u.id::text, (a.data->>'logID')::int AS log_id, SUM((a.data->>'quantity')::int) AS qty, u."skills.woodcutting" AS woodcutting_xp
		FROM activity a
		JOIN users u ON a.user_id::text = u.id
		WHERE a.type = 'Woodcutting'
				AND a.completed = true
				AND a.data->>'logID' IS NOT NULL
				AND u."collectionLogBank"->>'13322' IS NULL
				${ironSQL}
		GROUP BY u.id, log_id, u."skills.woodcutting"
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

		const xp = Number(row.woodcutting_xp);
		const chance = computeChance(logInfo.petChance, xp);

		const expected = row.qty / chance;
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
	const users = await prisma.$queryRaw<{ id: string; runecraft: bigint }[]>(Prisma.sql`
		SELECT u.id::text, u."skills.runecraft" AS runecraft
		 FROM users u
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

	const runeTotalsPerUser: Record<string, { bloodDarkAltar: number; soul: number; ourania: number; other: number }> =
		{};

	for (const row of allLootTracks) {
		if (!row.user_id || !row.loot) continue;
		const userID = row.user_id.toString();
		if (!runeTotalsPerUser[userID]) {
			runeTotalsPerUser[userID] = {
				bloodDarkAltar: 0,
				soul: 0,
				ourania: 0,
				other: 0
			};
		}

		const lootBank = new Bank(row.loot as ItemBank);
		for (const [item, qty] of lootBank.items()) {
			const id = typeof item === 'number' ? item : item.id;
			if (id === bloodRuneID) {
				if (row.key === 'darkaltar') {
					runeTotalsPerUser[userID].bloodDarkAltar += qty;
				} else {
					runeTotalsPerUser[userID].other += qty;
				}
			} else if (id === soulRuneID) {
				runeTotalsPerUser[userID].soul += qty;
			} else if (row.key === 'ourania_altar') {
				runeTotalsPerUser[userID].ourania += qty;
			} else {
				runeTotalsPerUser[userID].other += qty;
			}
		}
	}

	const results: { id: string; expected: number; total: number; top: [string, number] }[] = [];

	for (const u of users) {
		const totals = runeTotalsPerUser[u.id];
		if (!totals) continue;

		const xp = Number(u.runecraft);
		const expected =
			totals.bloodDarkAltar / computeChance(altarChances.blood, xp) +
			totals.soul / computeChance(altarChances.soul, xp) +
			totals.ourania / computeChance(altarChances.ourania, xp) +
			totals.other / computeChance(altarChances.default, xp);

		const breakdown = (
			[
				['Blood runes (Zeah)', totals.bloodDarkAltar],
				['Soul runes', totals.soul],
				['Ourania runes', totals.ourania],
				['Other runes', totals.other]
			] as [string, number][]
		).sort((a, b) => b[1] - a[1]);

		results.push({
			id: u.id,
			expected,
			total: totals.bloodDarkAltar + totals.soul + totals.ourania + totals.other,
			top: breakdown[0]
		});
	}

	const sorted = results.sort((a, b) => b.expected - a.expected).slice(0, 10);

	return sorted.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`
	}));
}

export async function rockyDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; xp: bigint }[]>(Prisma.sql`
		SELECT u.id::text, u."skills.thieving" AS xp
		FROM users u
		WHERE u."collectionLogBank"->>'20663' IS NULL
		${ironSQL}
`);
	const activities = await prisma.activity.findMany({
		where: {
			completed: true,
			type: { in: ['Pickpocket', 'Plunder'] },
			user_id: { in: users.map(u => BigInt(u.id)) }
		},
		select: { user_id: true, type: true, data: true }
	});

	const xpMap = new Map(users.map(u => [u.id, Number(u.xp)]));
	const userData: Record<string, { total: number; expected: number; sources: Record<string, number> }> = {};

	function addData(id: string, xp: number, name: string, qty: number, base: number) {
		const chance = computeChance(base, xp);
		const expected = qty / chance;
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: {} };
		userData[id].total += qty;
		userData[id].expected += expected;
		userData[id].sources[name] = (userData[id].sources[name] ?? 0) + qty;
	}

	for (const act of activities) {
		const id = act.user_id.toString();
		const xp = xpMap.get(id);
		if (!xp) continue;
		const data = (act.data as Partial<Record<string, unknown>>) ?? {};

		if (act.type === 'Pickpocket') {
			const qty = Number(data.successfulQuantity ?? 0);
			const monsterID = data.monsterID as number | undefined;
			const stealable = stealables.find(s => s.id === monsterID);
			if (stealable && qty > 0) addData(id, xp, stealable.name, qty, stealable.petChance);
		} else if (act.type === 'Plunder') {
			const quantity = Number(data.quantity ?? 0);
			const rooms: number[] = Array.isArray(data.rooms) ? data.rooms : [];
			for (const roomNum of rooms) {
				const room = plunderRooms.find(r => r.number === roomNum);
				if (room) addData(id, xp, `Room ${room.number}`, quantity, room.rockyChance);
			}
		}
	}

	const results = Object.entries(userData)
		.map(([id, data]) => {
			const top = Object.entries(data.sources).sort((a, b) => b[1] - a[1])[0];
			return { id, expected: data.expected, total: data.total, top };
		})
		.sort((a, b) => b.expected - a.expected)
		.slice(0, 10);

	return results.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`
	}));
}

export async function rockGolemDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; mining: number }[]>(Prisma.sql`
			SELECT u.id::text, u."skills.mining" AS mining
			FROM users u
			WHERE u."collectionLogBank"->>'13321' IS NULL
			${ironSQL}
	`);

	const levelMap = new Map(users.map(u => [u.id, Number(u.mining)]));

	const miningRows = await prisma.$queryRaw<{ id: string; ore_id: number; qty: number }[]>(Prisma.sql`
			SELECT u.id::text, (a.data->>'oreID')::int AS ore_id, SUM((a.data->>'quantity')::int) AS qty
			FROM activity a
			JOIN users u ON a.user_id::text = u.id
			WHERE a.type = 'Mining'
					AND a.completed = true
					AND a.data->>'oreID' IS NOT NULL
					AND u."collectionLogBank"->>'13321' IS NULL
					${ironSQL}
			GROUP BY u.id, ore_id
	`);

	const motherlodeRows = await prisma.$queryRaw<{ id: string; qty: number }[]>(Prisma.sql`
			SELECT u.id::text, SUM((a.data->>'quantity')::int) AS qty
			FROM activity a
			JOIN users u ON a.user_id::text = u.id
			WHERE a.type = 'MotherlodeMining'
					AND a.completed = true
					AND u."collectionLogBank"->>'13321' IS NULL
					${ironSQL}
			GROUP BY u.id
	`);

	const camdozaalRows = await prisma.$queryRaw<{ id: string; qty: number }[]>(Prisma.sql`
			SELECT u.id::text, SUM((a.data->>'quantity')::int) AS qty
			FROM activity a
			JOIN users u ON a.user_id::text = u.id
			WHERE a.type = 'CamdozaalMining'
					AND a.completed = true
					AND u."collectionLogBank"->>'13321' IS NULL
					${ironSQL}
			GROUP BY u.id
	`);

	const starRows = await prisma.$queryRaw<{ id: string; size: number; qty: number }[]>(Prisma.sql`
			SELECT u.id::text, (a.data->>'size')::int AS size, COUNT(*)::int AS qty
			FROM activity a
			JOIN users u ON a.user_id::text = u.id
			WHERE a.type = 'ShootingStars'
					AND a.completed = true
					AND u."collectionLogBank"->>'13321' IS NULL
					${ironSQL}
			GROUP BY u.id, size
	`);

	const userData: Record<string, { total: number; expected: number; sources: [string, number, number][] }> = {};

	function addData(id: string, xp: number, name: string, qty: number, base: number) {
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: [] };
		const chance = computeChance(base, xp);
		const expected = qty / chance;
		userData[id].total += qty;
		userData[id].expected += expected;
		userData[id].sources.push([name, qty, expected]);
	}
	for (const row of miningRows) {
		const ore = ores.find(o => o.id === row.ore_id);
		if (!ore || !ore.petChance) continue;
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(ore.level);
		addData(row.id, xp, ore.name, row.qty, ore.petChance);
	}

	for (const row of motherlodeRows) {
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(MotherlodeMine.level);
		addData(row.id, xp, MotherlodeMine.name, row.qty, MotherlodeMine.petChance!);
	}

	for (const row of camdozaalRows) {
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(CamdozaalMine.level);
		addData(row.id, xp, CamdozaalMine.name, row.qty, CamdozaalMine.petChance!);
	}

	for (const row of starRows) {
		const star = starSizes.find(s => s.size === row.size);
		if (!star || !star.petChance) continue;
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(star.level);
		addData(row.id, xp, `Star ${row.size}`, row.qty, star.petChance);
	}

	const sorted = Object.entries(userData)
		.map(([id, data]) => {
			const top = data.sources.sort((a, b) => b[1] - a[1])[0];
			return {
				id,
				total: data.total,
				expected: data.expected,
				top
			};
		})
		.sort((a, b) => b.expected - a.expected)
		.slice(0, 10);

	return sorted.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`
	}));
}

export async function heronDry(ironman: boolean): Promise<{ id: string; val: string }[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion"."ironman" = true` : Prisma.sql``;

	const users: Record<string, { total: number; expected: number; fish: [string, number, number][] }> = {};

	const allFish = [...Fishing.Fishes, ...Fishing.camdozaalFishes].filter(f => f.petChance !== undefined);

	const fishingKeys = allFish.map(f => f.name.toLowerCase());

	const lootTrackRes = await prisma.lootTrack.findMany({
		where: {
			type: 'Skilling',
			key: { in: fishingKeys }
		}
	});

	const fishingUsers = await prisma.$queryRaw<{ id: string; fishing: number }[]>(Prisma.sql`
		SELECT u.id::text, u."skills.fishing" AS fishing
		 FROM users u
		 WHERE u."collectionLogBank"->>'13320' IS NULL
		 ${ironSQL}
 `);

	const levelMap = new Map(fishingUsers.map(u => [u.id, Number(u.fishing)]));

	for (const row of lootTrackRes) {
		if (!row.user_id || !row.loot || !row.key) continue;
		const id = row.user_id.toString();
		const xp = levelMap.get(id);
		if (xp === undefined) continue;

		const fish = allFish.find(f => f.name.toLowerCase() === row.key.toLowerCase());
		if (!fish || !fish.petChance) continue;

		const qty = new Bank(row.loot as ItemBank).amount(fish.id);
		if (qty === 0) continue;

		const expected = qty / computeChance(fish.petChance, xp);

		if (!users[id]) users[id] = { total: 0, expected: 0, fish: [] };
		users[id].total += qty;
		users[id].expected += expected;
		users[id].fish.push([fish.name, qty, expected]);
	}

	const aerialPetChance = 636_833;
	const aerialCreatures = [
		['Bluegill', 37],
		['Common tench', 38],
		['Mottled eel', 39],
		['Greater siren', 40]
	] as const;

	type AerialResult = Record<string, number> & { id: string };

	const aerialRes = await prisma.$queryRaw<AerialResult[]>(
		Prisma.sql`
			SELECT u.id::text,
				${Prisma.raw(
					aerialCreatures
						.map(([_, id]) => `COALESCE(("creature_scores"->>'${id}')::int, 0) AS creature_${id}`)
						.join(', ')
				)}
			FROM users u
			WHERE u."collectionLogBank"->>'13320' IS NULL
			${ironSQL}
		`
	);

	for (const row of aerialRes) {
		let total = 0;
		for (const [_, id] of aerialCreatures) {
			total += Number(row[`creature_${id}`] ?? 0);
		}
		if (total === 0) continue;

		if (!users[row.id]) {
			users[row.id] = { total: 0, expected: 0, fish: [] };
		}
		const xp = levelMap.get(row.id) ?? 0;
		const chance = computeChance(aerialPetChance, xp);
		const expected = total / chance;

		users[row.id].total += total;
		users[row.id].expected += expected;
		users[row.id].fish.push(['Aerial fishing', total, expected]);
	}

	const sorted = Object.entries(users)
		.map(([id, data]) => {
			const top = data.fish.sort((a, b) => b[1] - a[1])[0];
			return {
				id,
				total: data.total,
				expected: data.expected,
				top
			};
		})
		.sort((a, b) => b.expected - a.expected)
		.slice(0, 10);

	return sorted.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`
	}));
}
