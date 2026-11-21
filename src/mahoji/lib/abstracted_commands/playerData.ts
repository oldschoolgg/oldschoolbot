import { formatDuration, UserError } from '@oldschoolgg/toolkit';

import { activity_type_enum, command_name_enum } from '@/prisma/clients/main/enums.js';
import { Channel } from '@/lib/constants.js';

const utc = (date: Date) => `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
const relative = (date: Date) => `<t:${Math.floor(date.getTime() / 1000)}:R>`;
const owner = (id: bigint) => ({ OR: [{ user_id: id }, { all_user_ids: { has: id } }] });
const json = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);

export function historyAutocomplete(values: string[], value: string) {
	return values
		.filter(v => v.toLowerCase().includes((value ?? '').toLowerCase()))
		.slice(0, 25)
		.map(v => ({ name: v.toLowerCase(), value: v.toLowerCase() }));
}

async function auditMismatch(admin: MUser, userId: string, kind: string, id: number) {
	await globalClient.sendMessage(Channel.BotLogs, {
		content: `${admin.logName} requested ${kind} ${id} for <@${userId}>, but it belongs to another user.`
	});
	throw new UserError(`That ${kind} does not belong to the selected user.`);
}

function detailResponse(content: string, data: unknown, filename: string) {
	const detail = json(data);
	const full = `${content}\n**Data:**\n\`\`\`json\n${detail}\n\`\`\``;
	if (content.length > 1900) {
		return {
			content: 'Details attached.',
			files: [{ buffer: Buffer.from(`${content}\n\nData:\n${detail}`), name: 'details.txt' }]
		};
	}
	return full.length <= 2000
		? { content: full }
		: { content: `${content}\nData attached.`, files: [{ buffer: Buffer.from(detail), name: filename }] };
}

export async function recentActivities(userId: string, quantity: number, typeInput?: string) {
	const type = typeInput
		? Object.values(activity_type_enum).find(v => v.toLowerCase() === typeInput.toLowerCase())
		: undefined;
	if (typeInput && !type) throw new UserError('Invalid activity type.');
	const user = BigInt(userId);
	const now = Date.now();
	const where = { ...owner(user), ...(type ? { type } : {}) };
	const [trips, durationSums, outstanding] = await Promise.all([
		prisma.activity.findMany({ where, orderBy: [{ start_date: 'desc' }, { id: 'desc' }], take: quantity }),
		prisma.$queryRaw<{ days: number; total: bigint }[]>`
			SELECT windows.days,
				COALESCE(SUM(GREATEST(0, EXTRACT(EPOCH FROM (
					LEAST(activity.finish_date, ${new Date(now)}::timestamptz AT TIME ZONE 'UTC') -
					GREATEST(activity.start_date, windows.window_start)
				)) * 1000)) FILTER (WHERE activity.id IS NOT NULL), 0)::bigint AS total
			FROM (VALUES
				(1, ${new Date(now - 86400000)}::timestamptz AT TIME ZONE 'UTC'),
				(2, ${new Date(now - 2 * 86400000)}::timestamptz AT TIME ZONE 'UTC'),
				(7, ${new Date(now - 7 * 86400000)}::timestamptz AT TIME ZONE 'UTC'),
				(30, ${new Date(now - 30 * 86400000)}::timestamptz AT TIME ZONE 'UTC')
			) AS windows(days, window_start)
			LEFT JOIN activity ON
				(activity.user_id = ${user} OR ${user} = ANY(activity.all_user_ids))
				AND (${type ?? null}::text IS NULL OR activity.type::text = ${type ?? null}::text)
				AND activity.finish_date > windows.window_start
				AND activity.start_date < ${new Date(now)}::timestamptz AT TIME ZONE 'UTC'
			GROUP BY windows.days
			ORDER BY windows.days
		`,
		prisma.activity.findFirst({ where: { ...owner(user), completed: false }, orderBy: { start_date: 'desc' } })
	]);
	const totals = durationSums.map(({ days, total }) => {
		return `**${days === 1 ? '24 hours' : days === 2 ? '48 hours' : `${days} days`}:** ${formatDuration(Number(total), true)}`;
	});
	const active = outstanding
		? [
				`**Outstanding:** ${outstanding.type} (#${outstanding.id}) ends ${utc(outstanding.finish_date)} ${relative(outstanding.finish_date)}`
			]
		: [];
	const lines = [
		'Status\tStart date (UTC)\tDuration\tType\tChannel ID\tTrip ID',
		...trips.map(t =>
			[
				t.completed ? '[x]' : '[ ]',
				utc(t.start_date).slice(0, 19),
				formatDuration(t.duration, true),
				t.type,
				t.channel_id?.toString() ?? '-',
				t.id
			].join('\t')
		)
	];
	return {
		content: [`Activity for <@${userId}>${type ? ` (${type})` : ''}`, ...totals, ...active].join('\n'),
		files: [{ buffer: Buffer.from(lines.join('\n')), name: 'activities.txt' }]
	};
}

export async function specificActivity(admin: MUser, userId: string, id: number) {
	const trip = await prisma.activity.findUnique({ where: { id } });
	if (!trip) throw new UserError('Activity not found.');
	if (trip.user_id !== BigInt(userId) && !trip.all_user_ids.includes(BigInt(userId)))
		await auditMismatch(admin, userId, 'activity', id);
	const ids = [...new Set([trip.user_id.toString(), ...trip.all_user_ids.map(String)])];
	const users = trip.group_activity
		? (await Promise.all(ids.map(async uid => `${await Cache.getBadgedUsername(uid)} (<@${uid}>)`))).join(', ')
		: `<@${userId}>`;
	const content = `**Activity #${trip.id} — ${trip.type}**\n**Status:** ${trip.completed ? 'Completed' : 'Outstanding'}\n**Users:** ${users}\n**Channel:** ${trip.channel_id ? `<#${trip.channel_id}>` : 'Unknown'}\n**Start:** ${utc(trip.start_date)}\n**End:** ${utc(trip.finish_date)} ${relative(trip.finish_date)}\n**Duration:** ${formatDuration(trip.duration, true)}\n**Group activity:** ${trip.group_activity ? 'Yes' : 'No'}`;
	return detailResponse(content, trip.data, 'activity-data.json');
}

export async function recentCommands(userId: string, quantity: number, nameInput?: string) {
	const command = nameInput
		? Object.values(command_name_enum).find(v => v.toLowerCase() === nameInput.toLowerCase())
		: undefined;
	if (nameInput && !command) throw new UserError('Invalid command name.');
	const records = await prisma.commandUsage.findMany({
		where: { user_id: BigInt(userId), ...(command ? { command_name: command } : {}) },
		orderBy: [{ date: 'desc' }, { id: 'desc' }],
		take: quantity
	});
	const lines = [
		'Date (UTC)\tCommand\tChannel ID\tID',
		...records.map(r =>
			[utc(r.date).slice(0, 19), r.command_name, r.channel_id?.toString() ?? '-', r.id].join('\t')
		)
	];
	return {
		content: `Command history for <@${userId}>${command ? ` (${command})` : ''}`,
		files: [{ buffer: Buffer.from(lines.join('\n')), name: 'commands.txt' }]
	};
}

export async function specificCommand(admin: MUser, userId: string, id: number) {
	const record = await prisma.commandUsage.findUnique({ where: { id } });
	if (!record) throw new UserError('Command usage not found.');
	if (record.user_id !== BigInt(userId)) await auditMismatch(admin, userId, 'command usage', id);
	const content = `**Command usage #${record.id} — /${record.command_name}**\n**User:** <@${userId}>\n**Date:** ${utc(record.date)} ${relative(record.date)}\n**Channel:** ${record.channel_id ? `<#${record.channel_id}>` : 'Unknown'}\n**Guild ID:** ${record.guild_id ?? 'Unknown'}\n**Continue:** ${record.is_continue ? 'Yes' : 'No'}\n**Continue delay:** ${record.continue_delta_millis === null ? 'Unknown' : `${record.continue_delta_millis}ms`}\n**Inhibited:** ${record.inhibited === null ? 'Unknown' : record.inhibited ? 'Yes' : 'No'}\n**Mention command:** ${record.is_mention_command ? 'Yes' : 'No'}`;
	return detailResponse(content, record.args, 'command-args.json');
}
