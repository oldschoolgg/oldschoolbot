import { Time } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import type { BSOPrismaClient, OSBPrismaClient } from '@/lib/prisma.js';

class ArrayTracker {
	private counts: Record<string, string[]> = {};

	add(id: string, item: string) {
		if (this.counts[id]) {
			this.counts[id].push(item);
		} else {
			this.counts[id] = [item];
		}
	}

	get(id: string) {
		return this.counts[id] ?? [];
	}

	entries(): [string, string[]][] {
		return Object.entries(this.counts);
	}
}

function approximateValue(bank: Bank) {
	let value = 0;
	for (const [id, qty] of Object.entries(bank)) {
		const item = Items.get(id);
		if (item?.price) {
			value += qty * item.price;
		}
	}
	return value;
}

export async function detectMischief(botType: 'osb' | 'bso') {
	const suspiciousUsers = new ArrayTracker();

	const body: string[] = [`${botType.toUpperCase()} Mischief Report (${new Date().toDateString()})`, '', ''];
	const messages: string[] = [];

	const blacklistedUsers = (
		await roboChimpClient.blacklistedEntity.findMany({
			where: {
				type: 'user'
			},
			select: {
				id: true
			}
		})
	).map(i => i.id.toString());
	const prismaClient: OSBPrismaClient | BSOPrismaClient = botType === 'osb' ? osbClient : bsoClient;

	/**
	 * Most Active
	 */
	const fetchTopActiveUsersAndAverageForDay = async (day: Date) => {
		const startOfDay = `${day.toISOString().substring(0, 10)}T00:00:00.000Z`;
		const endOfDay = `${day.toISOString().substring(0, 10)}T23:59:59.999Z`;

		const sql = `
SELECT
  user_id::text,
  ROUND((SUM(duration) / 3600000.0):: numeric, 2) AS total_duration_hours
FROM activity
WHERE start_date >= '${startOfDay}' AND start_date <= '${endOfDay}'
GROUP BY user_id`;

		const activities = (
			await prismaClient.$queryRawUnsafe<
				{
					user_id: string;
					total_duration_hours: number;
				}[]
			>(sql)
		).filter(i => !blacklistedUsers.includes(i.user_id));

		// Calculate average
		const average_duration_hours =
			activities.reduce((total, activity) => total + activity.total_duration_hours, 0) / activities.length;

		// Sort the activities by duration in descending order
		const sortedActivities = activities.sort((a, b) => b.total_duration_hours - a.total_duration_hours);

		return { sortedActivities, average_duration_hours };
	};

	async function mostActive() {
		let subBody = 'Most Active\n\n';

		const today = new Date();
		const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8);
		const dayBeforeToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

		for (let day = sevenDaysAgo; day <= dayBeforeToday; day.setDate(day.getDate() + 1)) {
			const { sortedActivities, average_duration_hours } = await fetchTopActiveUsersAndAverageForDay(
				new Date(day)
			);

			// Calculate median
			const durations = sortedActivities.map(a => a.total_duration_hours).sort((a, b) => a - b);
			const mid = Math.ceil(durations.length / 2);
			const median_duration_hours =
				durations.length % 2 === 0 ? (durations[mid] + durations[mid - 1]) / 2 : durations[mid - 1];

			subBody += `**${day.toDateString()}**\n`;
			for (const activity of sortedActivities) {
				if (activity.total_duration_hours <= 18) break;
				suspiciousUsers.add(activity.user_id, `${activity.total_duration_hours.toFixed(2)} hours active`);
			}

			for (const activity of sortedActivities.slice(0, 30)) {
				// Limiting to top 30 users
				if (blacklistedUsers.includes(activity.user_id)) continue;
				subBody += `${activity.user_id} - ${activity.total_duration_hours.toFixed(2)} hours\n`;
			}
			subBody += `Median Hours: ${median_duration_hours.toFixed(
				2
			)}\nAverage Hours: ${average_duration_hours.toFixed(2)}\n\n`;
		}

		body.push(subBody);
	}

	/**
	 * Trading
	 */
	async function tradeGivers() {
		const netValueSent: Record<string, number> = {};
		const transactions = await (prismaClient.economyTransaction as OSBPrismaClient['economyTransaction']).findMany({
			where: {
				date: {
					gte: new Date(Date.now() - Time.Day * 7 * 2)
				}
			},
			select: {
				sender: true,
				recipient: true,
				items_sent: true,
				items_received: true
			}
		});

		for (const transaction of transactions) {
			const sentValue = approximateValue(new Bank((transaction.items_sent as ItemBank) ?? {}));
			const receivedValue = approximateValue(new Bank((transaction.items_received as ItemBank) ?? {}));

			const pairKey = `${transaction.sender}-${transaction.recipient}`;

			if (!netValueSent[pairKey]) {
				netValueSent[pairKey] = 0;
			}

			netValueSent[pairKey] += sentValue - receivedValue;
		}

		const sortedPairs = Object.entries(netValueSent).sort((a, b) => b[1] - a[1]);

		for (const [pair] of sortedPairs.slice(0, 50)) {
			const [sender, recipient] = pair.split('-');
			suspiciousUsers.add(sender, `Sent to ${recipient} a net of ${netValueSent[pair].toLocaleString()}GP`);
			suspiciousUsers.add(recipient, `Received from ${sender} a net of ${netValueSent[pair].toLocaleString()}GP`);
		}

		let subBody = 'Trade Givers\n\n';
		for (const [pair, value] of sortedPairs.slice(0, 10)) {
			const [sender, recipient] = pair.split('-');
			subBody += `${sender} gave ${recipient} a net of ${value.toLocaleString()}GP\n`;
		}
		body.push(subBody);
	}

	/**
	 * Only uses commands in 1 server
	 */
	async function commandsInOnlyOneServer() {
		const result = await prismaClient.$queryRawUnsafe<
			{ user_id: string; guild_id: bigint; commands_used: number }[]
		>(`SELECT
  user_id::text,
   MAX(guild_id) AS guild_id,
   COUNT(id)::int as commands_used
FROM
  command_usage
WHERE
  date >= NOW() - INTERVAL '14 days'
GROUP BY
  user_id
HAVING
  COUNT(DISTINCT guild_id) = 1 AND
  COUNT(id) > 10
ORDER BY
  user_id DESC;
`);

		for (const activity of result) {
			suspiciousUsers.add(
				activity.user_id.toString(),
				`Used ${activity.commands_used} commands in 1 server (${activity.guild_id})`
			);
		}

		const sortedByCommands = [...result].sort((a, b) => b.commands_used - a.commands_used).slice(0, 25);
		const sortedByUserID = [...result].sort((a, b) => Number(b.user_id) - Number(a.user_id)).slice(0, 25);

		let subBody = 'Commands in Only 1 Server\n\n';
		subBody += '**Sorted by Commands Used**\n';
		for (const activity of sortedByCommands) {
			subBody += `${activity.user_id} - ${activity.commands_used}\n`;
		}
		subBody += '\n**Sorted by User ID**\n';
		for (const activity of sortedByUserID) {
			subBody += `${activity.user_id} - ${activity.commands_used}\n`;
		}
		body.push(subBody);
	}

	/**
	 * Ratio of continue commands to activities
	 */
	async function getContinueCommandToActivityRatio() {
		const sql = `
WITH continue_commands AS (
    SELECT
        user_id,
        COUNT(*) AS continue_count
    FROM
        command_usage
    WHERE
        date >= NOW() - INTERVAL '1 week'
        AND is_continue = TRUE
		AND command_name NOT IN ('bs', 'trade', 'open', 'bank', 'tames', 'farming', 'slayer', 'gear', 'daily', 'sellto', 'gamble', 'cl', 'collectionlog')
    GROUP BY
        user_id
),
total_activities AS (
    SELECT
        user_id,
        COUNT(*) AS activity_count
    FROM
        activity
    WHERE
        start_date >= NOW() - INTERVAL '1 week'
    GROUP BY
        user_id
)
SELECT
    cc.user_id::text,
    CAST(cc.continue_count AS FLOAT) / NULLIF(ta.activity_count, 0) AS continue_to_activity_ratio,
	cc.continue_count::int,
	ta.activity_count::int
FROM
    continue_commands cc
JOIN
    total_activities ta ON cc.user_id = ta.user_id
WHERE ta.activity_count > 20
ORDER BY
    continue_to_activity_ratio ASC
LIMIT 30;
    `;

		const results =
			await prismaClient.$queryRawUnsafe<
				{
					user_id: string;
					continue_to_activity_ratio: number;
				}[]
			>(sql);

		let subBody = 'Continue/Activity ratio\n\n';
		for (const row of results) {
			subBody += `${row.user_id} has a continue/activity ratio of ${row.continue_to_activity_ratio.toFixed(2)}\n`;
			suspiciousUsers.add(row.user_id, `Continue/Activity ratio of ${row.continue_to_activity_ratio.toFixed(2)}`);
		}

		body.push(subBody);
	}

	async function continueDelta() {
		const sql = `WITH AggregatedData AS (
    SELECT user_id,
           floor(continue_delta_millis / 1000) AS seconds,
           COUNT(*) AS frequency
    FROM command_usage
    WHERE is_continue = true
      AND continue_delta_millis IS NOT NULL
    GROUP BY user_id, seconds
),
RankedData AS (
    SELECT user_id,
           COUNT(*) AS unique_seconds,
           SUM(frequency) AS total_entries
    FROM AggregatedData
    GROUP BY user_id
),
SuspiciousData AS (
    SELECT user_id::text,
           unique_seconds,
           total_entries,
           (unique_seconds::float / total_entries::float) * 100 AS uniqueness_ratio
    FROM RankedData
)
SELECT *
FROM SuspiciousData
WHERE uniqueness_ratio < 20
ORDER BY uniqueness_ratio ASC;`;

		const results =
			await prismaClient.$queryRawUnsafe<
				{
					user_id: string;
					unique_seconds: bigint;
					total_entries: number;
				}[]
			>(sql);

		let subBody = 'Low Unique Continue Delta Seconds\n\n';
		for (const row of results) {
			const str = `${row.user_id} has  ${row.unique_seconds} unique seconds out of ${row.total_entries} trips`;
			subBody += `${str}\n`;
			suspiciousUsers.add(row.user_id, str);
		}

		body.push(subBody);
	}

	await Promise.all([
		mostActive(),
		tradeGivers(),
		commandsInOnlyOneServer(),
		getContinueCommandToActivityRatio(),
		continueDelta()
	]);

	const mostSus = suspiciousUsers
		.entries()
		.sort((a, b) => b[1].length - a[1].length)
		.filter(i => !blacklistedUsers.includes(i[0]))
		.slice(0, 20);

	body.push(`**Most Suspicious Users:**

${mostSus.map(i => `${i[0]} (${i[1].join(', ')})`).join('\n')}`);

	if (messages.length > 0) {
		body.push(`**Messages:** ${messages.join(', ')}`);
	}

	return body.join('\n');
}
