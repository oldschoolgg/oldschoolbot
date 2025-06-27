import { Prisma } from '@prisma/client';
import { convertLVLtoXP, convertXPtoLVL, getItem } from 'oldschooljs/dist/util';
import { starSizes } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { MAX_XP } from '../constants';
import { plunderRooms } from '../minions/data/plunder';
import { courses } from '../skilling/skills/agility';
import Farming from '../skilling/skills/farming';
import Fishing from '../skilling/skills/fishing';
import { CamdozaalMine, MotherlodeMine, ores } from '../skilling/skills/mining';
import { stealables } from '../skilling/skills/thieving/stealables';
import Woodcutting from '../skilling/skills/woodcutting/woodcutting';

export interface DryResult {
	id: string;
	val: string;
	expected: number;
}

export interface SourceInfo {
	qty: number;
	expected: number;
}

export function computeChance(base: number, xp: number): number {
	const level = convertXPtoLVL(xp);
	let chance = Math.max(base - level * 25, 1);
	if (xp >= MAX_XP) chance = Math.max(Math.floor(chance / 15), 1);
	return chance;
}

export async function babyChinchompaDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'13323' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

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
				JOIN user_stats s ON s.user_id::text = u.id::text
                WHERE 1=1
                ${clFilter}
                ${userFilter}
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

	const sorted = withExpected.sort((a, b) => b.dryPercent - a.dryPercent);

	const toMap = userID ? sorted.filter(i => i.id === userID) : sorted.slice(0, 10);

	return toMap.map(u => ({
		id: u.id,
		val: `${u.total.toLocaleString()} caught (${u.grey.toLocaleString()} grey, ${u.red.toLocaleString()} red, ${u.black.toLocaleString()} black) - ${u.expected.toFixed(2)}x expected`,
		expected: u.expected
	}));
}

export async function squirrelDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'20659' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

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
                WHERE 1=1
                ${clFilter}
                ${userFilter}
                ${ironSQL}
        `);

	const results = res.map(row => {
		const xp = Number(row.skills_agility);
		const divisor = xp >= MAX_XP ? 15 : 1;
		let totalLaps = 0;
		let expectedPets = 0;

		const courseExpected: [string, number, number][] = [];

		for (const id of ids) {
			const laps = Number(row[`lap_${id}`] ?? 0);
			if (laps === 0) continue;
			totalLaps += laps;
			const rate = courseMap.get(id)! / divisor;
			const expected = laps / rate;
			const courseName = courses.find(c => c.id === id)?.name ?? `Course ${id}`;
			courseExpected.push([courseName, laps, expected]);
			expectedPets += expected;
		}

		// Sort to find top course by expected pet rolls
		const topCourse = courseExpected.sort((a, b) => b[2] - a[2])[0];

		return {
			id: row.id,
			totalLaps,
			expected: expectedPets,
			topCourse
		};
	});

	const sorted = results.filter(r => r.topCourse).sort((a, b) => b.expected - a.expected);

	const toMap = userID ? sorted.filter(r => r.id === userID) : sorted.slice(0, 10);

	return toMap.map(r => {
		const [courseName, laps, expectedFromCourse] = r.topCourse!;
		return {
			id: r.id,
			val: `${laps.toLocaleString()} laps at ${courseName} (${expectedFromCourse.toFixed(2)}x from ${courseName}) – ${r.totalLaps.toLocaleString()} total laps – ${r.expected.toFixed(2)}x expected`,
			expected: r.expected
		};
	});
}

export async function tanglerootDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'20661' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const rows = await prisma.$queryRaw<{ id: string; item_id: number; qty: number; xp: bigint }[]>(Prisma.sql`
                SELECT fc.user_id::text AS id, fc.item_id, SUM(fc.quantity_planted) AS qty, u."skills.farming" AS xp
                FROM farmed_crop fc
                JOIN users u ON u.id::text = fc.user_id::text
                WHERE 1=1
                ${clFilter}
                ${userFilter}
                ${ironSQL}
                GROUP BY fc.user_id, fc.item_id, u."skills.farming"
        `);

	const plantMap = new Map(Farming.Plants.map(p => [p.id, p]));
	const users: Record<string, { total: number; expected: number; plants: [string, number, number][] }> = {};

	for (const row of rows) {
		const plant = plantMap.get(row.item_id);
		if (!plant || !plant.petChance) continue;
		const xp = Number(row.xp);
		const qty = Number(row.qty);
		const chance = computeChance(plant.petChance, xp);
		const expected = qty / chance;
		if (!users[row.id]) users[row.id] = { total: 0, expected: 0, plants: [] };
		users[row.id].total += qty;
		users[row.id].expected += expected;
		users[row.id].plants.push([plant.name, qty, expected]);
	}

	const sorted = Object.entries(users).sort((a, b) => b[1].expected - a[1].expected);
	const toMap = userID ? sorted.filter(([id]) => id === userID) : sorted.slice(0, 10);

	return toMap.map(([id, data]) => {
		const top = data.plants.sort((a, b) => b[2] - a[2])[0];
		const topStr = top ? `${top[1].toLocaleString()} ${top[0]} (${top[2].toFixed(2)}x)` : 'No data';
		return {
			id,
			val: `${topStr} (${data.total.toLocaleString()} total – ${data.expected.toFixed(2)}x expected)`,
			expected: data.expected
		};
	});
}

export async function beaverDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'13322' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const rows = await prisma.$queryRaw<
		{ id: string; log_id: number; qty: number; woodcutting_xp: bigint }[]
	>(Prisma.sql`
                SELECT u.id::text, (a.data->>'logID')::int AS log_id, SUM((a.data->>'quantity')::int) AS qty, u."skills.woodcutting" AS woodcutting_xp
                FROM activity a
                JOIN users u ON u.id::text = a.user_id::text
                WHERE a.type = 'Woodcutting'
                                AND a.completed = true
                                AND a.data->>'logID' IS NOT NULL
                                ${clFilter}
                                ${userFilter}
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

		const qty = Number(row.qty);
		const expected = qty / chance;
		users[row.id].total += qty;
		users[row.id].expected += expected;
		users[row.id].logs.push([logInfo.name, qty, expected]);
	}

	const sorted = Object.entries(users).sort((a, b) => b[1].expected - a[1].expected);

	const toMap = userID ? sorted.filter(([id]) => id === userID) : sorted.slice(0, 10);

	return toMap.map(([id, data]) => {
		const topLog = data.logs.sort((a, b) => b[2] - a[2])[0];
		const topLogStr = topLog ? `${topLog[1].toLocaleString()} ${topLog[0]} (${topLog[2].toFixed(2)}x)` : 'No data';

		return {
			id,
			val: `${topLogStr} (${data.total.toLocaleString()} total logs – ${data.expected.toFixed(2)}x expected)`,
			expected: data.expected
		};
	});
}

export async function riftGuardianDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'20667' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; xp: bigint }[]>(Prisma.sql`
		SELECT u.id::text, u."skills.runecraft" AS xp
		FROM users u
		WHERE 1=1
		${clFilter}
		${userFilter}
		${ironSQL}
	`);

	const activities = await prisma.activity.findMany({
		where: {
			completed: true,
			type: { in: ['Runecraft', 'OuraniaAltar', 'DarkAltar'] },
			user_id: { in: users.map(u => BigInt(u.id)) }
		},
		select: { user_id: true, type: true, data: true }
	});

	const xpMap = new Map(users.map(u => [u.id, Number(u.xp)]));
	const userData: Record<string, { total: number; expected: number; sources: Record<string, SourceInfo> }> = {};

	function addData(id: string, xp: number, name: string, qty: number, base: number) {
		const chance = computeChance(base, xp);
		const expected = qty / chance;
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: {} };
		userData[id].total += qty;
		userData[id].expected += expected;
		if (!userData[id].sources[name]) {
			userData[id].sources[name] = { qty: 0, expected: 0 };
		}
		userData[id].sources[name].qty += qty;
		userData[id].sources[name].expected += expected;
	}

	for (const act of activities) {
		const id = act.user_id.toString();
		const xp = xpMap.get(id);
		if (!xp) continue;
		const data = (act.data as Record<string, any>) ?? {};

		if (act.type === 'Runecraft') {
			const qty = Number(data.essenceQuantity ?? 0);
			if (qty > 0) {
				let runeName = 'Runecraft';

				if (data.runes && typeof data.runes === 'object' && !Array.isArray(data.runes)) {
					const entries = Object.entries(data.runes).filter(
						([, val]) => typeof val === 'number' && val > 0
					) as [string, number][];
					if (entries.length > 0) {
						entries.sort((a, b) => b[1] - a[1]);
						runeName = `${entries[0][0][0].toUpperCase()}${entries[0][0].slice(1)}`;
					}
				} else if (typeof data.runeID === 'number') {
					const rune = getItem(data.runeID);
					if (rune) runeName = rune.name;
				}

				addData(id, xp, runeName, qty, 1_795_758);
			}
		} else if (act.type === 'OuraniaAltar') {
			const qty = Number(data.quantity ?? 0);
			if (qty > 0) addData(id, xp, 'Ourania Altar', qty, 1_487_213);
		} else if (act.type === 'DarkAltar') {
			const qty = Number(data.quantity ?? 0);
			let rune = (data.rune as string | undefined) ?? null;

			// Try to derive rune name from ID if not provided
			if (!rune && typeof data.runeID === 'number') {
				const item = getItem(data.runeID);
				if (item?.name?.toLowerCase().includes('soul')) rune = 'soul';
				else if (item?.name?.toLowerCase().includes('blood')) rune = 'blood';
			}

			// Default to blood if unknown
			rune = rune ?? 'blood';

			const base = rune === 'soul' ? 782_999 : 804_984;
			if (qty > 0) {
				const runeName = `${rune[0].toUpperCase()}${rune.slice(1)} rune`;
				addData(id, xp, runeName, qty, base);
			}
		}
	}

	const results = Object.entries(userData)
		.map(([id, data]) => {
			const topEntry = Object.entries(data.sources).sort((a, b) => b[1].expected - a[1].expected)[0];
			return { id, expected: data.expected, total: data.total, top: [topEntry[0], topEntry[1].qty] };
		})
		.sort((a, b) => b.expected - a.expected);

	const toMap = userID ? results.filter(r => r.id === userID) : results.slice(0, 10);

	return toMap.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`,
		expected: r.expected
	}));
}

export async function rockyDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'20663' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; xp: bigint }[]>(Prisma.sql`
                SELECT u.id::text, u."skills.thieving" AS xp
                FROM users u
                WHERE 1=1
                ${clFilter}
                ${userFilter}
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
	const userData: Record<string, { total: number; expected: number; sources: Record<string, SourceInfo> }> = {};

	function addData(id: string, xp: number, name: string, qty: number, base: number) {
		const chance = computeChance(base, xp);
		const expected = qty / chance;
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: {} };
		userData[id].total += qty;
		userData[id].expected += expected;
		if (!userData[id].sources[name]) {
			userData[id].sources[name] = { qty: 0, expected: 0 };
		}
		userData[id].sources[name].qty += qty;
		userData[id].sources[name].expected += expected;
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
			const topEntry = Object.entries(data.sources).sort((a, b) => b[1].expected - a[1].expected)[0];
			return { id, expected: data.expected, total: data.total, top: [topEntry[0], topEntry[1].qty] };
		})
		.sort((a, b) => b.expected - a.expected);

	const toMap = userID ? results.filter(r => r.id === userID) : results.slice(0, 10);

	return toMap.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`,
		expected: r.expected
	}));
}

export async function rockGolemDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'13321' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; mining: number }[]>(Prisma.sql`
                        SELECT u.id::text, u."skills.mining" AS mining
                        FROM users u
                        WHERE 1=1
                        ${clFilter}
                        ${userFilter}
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
                                        ${clFilter}
                                        ${userFilter}
                                        ${ironSQL}
                        GROUP BY u.id, ore_id
        `);

	const volcanicMineRows = await prisma.$queryRaw<{ id: string; qty: number }[]>(Prisma.sql`
        SELECT u.id::text, SUM((a.data->>'quantity')::int) AS qty
        FROM activity a
        JOIN users u ON a.user_id::text = u.id
        WHERE a.type = 'VolcanicMine'
                AND a.completed = true
                AND a.data->>'quantity' IS NOT NULL
                ${clFilter}
                ${userFilter}
                ${ironSQL}
        GROUP BY u.id
`);

	const motherlodeRows = await prisma.$queryRaw<{ id: string; qty: number }[]>(Prisma.sql`
                        SELECT u.id::text, SUM((a.data->>'quantity')::int) AS qty
                        FROM activity a
                        JOIN users u ON a.user_id::text = u.id
                        WHERE a.type = 'MotherlodeMining'
                                        AND a.completed = true
                                        ${clFilter}
                                        ${userFilter}
                                        ${ironSQL}
                        GROUP BY u.id
        `);

	const camdozaalRows = await prisma.$queryRaw<{ id: string; qty: number }[]>(Prisma.sql`
                        SELECT u.id::text, SUM((a.data->>'quantity')::int) AS qty
                        FROM activity a
                        JOIN users u ON a.user_id::text = u.id
                        WHERE a.type = 'CamdozaalMining'
                                        AND a.completed = true
                                        ${clFilter}
                                        ${userFilter}
                                        ${ironSQL}
                        GROUP BY u.id
        `);

	const starRows = await prisma.$queryRaw<{ id: string; size: number; qty: number }[]>(Prisma.sql`
                        SELECT u.id::text, (a.data->>'size')::int AS size, COUNT(*)::int AS qty
                        FROM activity a
                        JOIN users u ON a.user_id::text = u.id
                        WHERE a.type = 'ShootingStars'
                                        AND a.completed = true
                                        ${clFilter}
                                        ${userFilter}
                                        ${ironSQL}
                        GROUP BY u.id, size
        `);

	const userData: Record<string, { total: number; expected: number; sources: Record<string, number> }> = {};

	function addData(id: string, xp: number, qty: number | bigint, base: number, sourceType: string) {
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: {} };
		const safeQty = Number(qty);
		const chance = computeChance(base, xp);
		const expected = safeQty / chance;
		userData[id].total += safeQty;
		userData[id].expected += expected;
		userData[id].sources[sourceType] = (userData[id].sources[sourceType] ?? 0) + safeQty;
	}

	for (const row of miningRows) {
		const ore = ores.find(o => o.id === row.ore_id);
		if (!ore || !ore.petChance) continue;
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(ore.level);
		addData(row.id, xp, Number(row.qty), ore.petChance, 'Mining');
	}

	for (const row of volcanicMineRows) {
		const xp = levelMap.get(row.id) ?? 0;
		addData(row.id, xp, Number(row.qty), 60_000, 'Volcanic Mine');
	}

	for (const row of motherlodeRows) {
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(MotherlodeMine.level);
		addData(row.id, xp, Number(row.qty), MotherlodeMine.petChance!, 'Mining');
	}

	for (const row of camdozaalRows) {
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(CamdozaalMine.level);
		addData(row.id, xp, Number(row.qty), CamdozaalMine.petChance!, 'Mining');
	}

	for (const row of starRows) {
		const star = starSizes.find(s => s.size === row.size);
		if (!star || !star.petChance) continue;
		const xp = levelMap.get(row.id) ?? convertLVLtoXP(star.level);
		addData(row.id, xp, Number(row.qty), star.petChance, 'Shooting Stars');
	}

	const sorted = Object.entries(userData)
		.map(([id, data]) => {
			const topSources = Object.entries(data.sources)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([source, qty]) => {
					const unit = source === 'Volcanic Mine' ? 'game' : source === 'Shooting Stars' ? 'star' : 'ore';

					const label = qty === 1 ? unit : `${unit}s`;

					return source === 'Volcanic Mine' || source === 'Shooting Stars'
						? `${qty.toLocaleString()} ${label} of ${source}`
						: `${qty.toLocaleString()} ${label}`;
				})
				.join(', ');

			return {
				id,
				total: data.total,
				expected: data.expected,
				topSources
			};
		})
		.sort((a, b) => b.expected - a.expected);

	const toMap = userID ? sorted.filter(r => r.id === userID) : sorted.slice(0, 10);

	return toMap.map(r => ({
		id: r.id,
		val: `${r.topSources} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`,
		expected: r.expected
	}));
}

export async function heronDry(ironman: boolean, userID?: string, includeCL = false): Promise<DryResult[]> {
	const ironSQL = ironman ? Prisma.sql` AND "minion.ironman" = true` : Prisma.sql``;
	const clFilter = includeCL ? Prisma.sql`` : Prisma.sql` AND u."collectionLogBank"->>'13320' IS NULL`;
	const userFilter = userID ? Prisma.sql` AND u.id::text = ${userID}` : Prisma.sql``;

	const users = await prisma.$queryRaw<{ id: string; xp: bigint }[]>(Prisma.sql`
			SELECT u.id::text, u."skills.fishing" AS xp
			FROM users u
			WHERE 1=1
			${clFilter}
			${userFilter}
			${ironSQL}
	`);

	const activities = await prisma.activity.findMany({
		where: {
			completed: true,
			type: { in: ['Fishing', 'AerialFishing'] },
			user_id: { in: users.map(u => BigInt(u.id)) }
		},
		select: { user_id: true, type: true, data: true }
	});

	const fishMap = new Map<number, { name: string; petChance: number }>();
	for (const fish of Fishing.Fishes) {
		if (fish.petChance) fishMap.set(fish.id, { name: fish.name, petChance: fish.petChance });
	}

	const xpMap = new Map(users.map(u => [u.id, Number(u.xp)]));
	const userData: Record<string, { total: number; expected: number; sources: Record<string, SourceInfo> }> = {};

	function addData(id: string, xp: number, name: string, qty: number, base: number) {
		const chance = computeChance(base, xp);
		const expected = qty / chance;
		if (!userData[id]) userData[id] = { total: 0, expected: 0, sources: {} };
		userData[id].total += qty;
		userData[id].expected += expected;
		if (!userData[id].sources[name]) {
			userData[id].sources[name] = { qty: 0, expected: 0 };
		}
		userData[id].sources[name].qty += qty;
		userData[id].sources[name].expected += expected;
	}

	for (const act of activities) {
		const id = act.user_id.toString();
		const xp = xpMap.get(id);
		if (!xp) continue;
		const data = (act.data as Record<string, any>) ?? {};

		if (act.type === 'Fishing') {
			const fishID = Number(data.fishID ?? 0);
			const qty = Number(data.quantity ?? 0);
			const info = fishMap.get(fishID);
			if (info && qty > 0) addData(id, xp, info.name, qty, info.petChance);
		} else if (act.type === 'AerialFishing') {
			const qty = Number(data.quantity ?? 0);
			if (qty > 0) addData(id, xp, 'Aerial Fishing', qty, 636_833);
		}
	}

	const results = Object.entries(userData)
		.map(([id, data]) => {
			const topEntry = Object.entries(data.sources).sort((a, b) => b[1].expected - a[1].expected)[0];
			return { id, expected: data.expected, total: data.total, top: [topEntry[0], topEntry[1].qty] };
		})
		.sort((a, b) => b.expected - a.expected);

	const toMap = userID ? results.filter(r => r.id === userID) : results.slice(0, 10);

	return toMap.map(r => ({
		id: r.id,
		val: `${r.top[1].toLocaleString()} ${r.top[0]} (${r.total.toLocaleString()} total – ${r.expected.toFixed(2)}x expected)`,
		expected: r.expected
	}));
}
