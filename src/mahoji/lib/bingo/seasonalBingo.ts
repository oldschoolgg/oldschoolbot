import { dateFm } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { z } from 'zod';

import { Prisma } from '@/prisma/main.js';
import type { ExtractOptions } from '@/discord/commands/commandOptions.js';
import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { cachedBingoBoard } from '@/lib/bingo/bingoRenderer.js';
import {
	bingoContributorLeaderboard,
	createBingoSeason,
	endBingoSeason,
	fetchBingoSeason,
	setBingoChallengeCompletion
} from '@/lib/bingo/bingoSeason.js';
import { bingoBoardSchema, bingoThemes, challengeTarget } from '@/lib/bingo/bingoTypes.js';
import { globalConfig } from '@/lib/constants.js';

const seasonOption = {
	type: 'String',
	name: 'season',
	description: 'A season ID; defaults to the active season.',
	required: false,
	autocomplete: async ({ value }: StringAutoComplete) => {
		const seasons = await prisma.bingoSeason.findMany({
			where: value ? { name: { contains: value, mode: 'insensitive' } } : {},
			orderBy: { start_date: 'desc' },
			take: 25
		});
		return seasons.map(s => ({ name: `${s.name} (${s.status})`, value: s.id }));
	}
} as const;

export const seasonalBingoOptions = [
	{
		type: 'Subcommand',
		name: 'board',
		description: 'View the community seasonal bingo board.',
		options: [seasonOption]
	},
	{
		type: 'Subcommand',
		name: 'progress',
		description: 'View community seasonal bingo progress.',
		options: [seasonOption]
	},
	{
		type: 'Subcommand',
		name: 'history',
		description: 'View completed bingo seasons and their boards.',
		options: [seasonOption]
	},
	{
		type: 'Subcommand',
		name: 'seasonal_admin',
		description: 'Administer community seasonal bingo (bot administrators only).',
		options: [
			{
				type: 'String',
				name: 'action',
				description: 'The administrative action.',
				required: true,
				choices: ['create', 'end', 'complete', 'reverse', 'inspect', 'template'].map(value => ({
					name: value,
					value
				}))
			},
			seasonOption,
			{
				type: 'String',
				name: 'challenge',
				description: 'The challenge ID, shown by /bingo progress.',
				required: false
			},
			{
				type: 'String',
				name: 'reason',
				description: 'The reason for a manual completion or reversal.',
				required: false
			},
			{ type: 'String', name: 'name', description: 'New season name (up to 100 characters).', required: false },
			{
				type: 'String',
				name: 'theme',
				description: 'The seasonal artwork.',
				required: false,
				choices: bingoThemes.map(value => ({ name: value, value }))
			},
			{
				type: 'Integer',
				name: 'year',
				description: 'The year on the board.',
				min_value: 2026,
				max_value: 2100,
				required: false
			},
			{
				type: 'String',
				name: 'start',
				description: 'UTC ISO start time, e.g. 2026-12-01T00:00:00Z; defaults to now.',
				required: false
			},
			{
				type: 'String',
				name: 'end',
				description: 'UTC ISO end time; defaults to 30 days after the start.',
				required: false
			},
			{
				type: 'Attachment',
				name: 'configuration',
				description: 'Optional JSON array of exactly 28 challenges.',
				required: false
			}
		]
	}
] as const satisfies readonly CommandOption[];

type SeasonalOptions = ExtractOptions<typeof seasonalBingoOptions>;

async function administerSeason(
	user: MUser,
	options: NonNullable<SeasonalOptions['seasonal_admin']>,
	guildID: string | null
): CommandResponse {
	if (!user.isAdmin() || (globalConfig.isProduction && guildID !== globalConfig.supportServerID)) {
		return 'Only bot administrators in the support server can administer seasonal bingo.';
	}
	if (options.action === 'template') {
		return {
			files: [
				{
					name: 'bingo-challenges.json',
					buffer: Buffer.from(JSON.stringify(defaultBingoChallenges(), null, 2))
				}
			]
		};
	}
	if (options.action === 'create') {
		if (!options.theme) return 'Choose a seasonal theme.';
		const start = options.start ? new Date(z.iso.datetime().parse(options.start)) : new Date();
		const end = options.end
			? new Date(z.iso.datetime().parse(options.end))
			: new Date(start.getTime() + 30 * Time.Day);
		let challenges: unknown = defaultBingoChallenges();
		if (options.configuration) {
			if (options.configuration.size > 100_000) return 'The configuration must be smaller than 100 KB.';
			const response = await fetch(options.configuration.url, { signal: AbortSignal.timeout(10_000) });
			if (!response.ok) return 'Unable to download the configuration.';
			challenges = await response.json();
		}
		const year = options.year ?? start.getUTCFullYear();
		const name = z
			.string()
			.trim()
			.min(1)
			.max(100)
			.parse(options.name ?? `${options.theme} OSB Bingo ${year}`);
		const season = await createBingoSeason({
			name,
			theme: options.theme,
			year,
			start_date: start,
			end_date: end,
			challenges
		});
		return `Created **${season.name}** (\`${season.id}\`). Starts ${dateFm(season.start_date)}, ends ${dateFm(season.end_date)}. All eligible players contribute automatically.`;
	}
	if (options.season && !z.uuid().safeParse(options.season).success) return 'Invalid season ID.';
	const season = await fetchBingoSeason(options.season);
	if (!season) return 'No matching season. Select a season ID.';
	if (options.action === 'end') {
		await endBingoSeason(season.id);
		return `Ended **${season.name}**. Its historical board remains available.`;
	}
	if (!options.challenge) return 'Provide a challenge ID from /bingo progress.';
	const challenge = bingoBoardSchema.parse(season.challenges).find(c => c.id === options.challenge);
	if (!challenge) return 'Unknown challenge ID.';
	if (options.action === 'inspect') {
		const progress = season.progress.find(p => p.challenge_id === challenge.id);
		const events = await prisma.seasonalBingoEvent.findMany({
			where: {
				season_id: season.id,
				OR: [
					{ credits: { path: [challenge.id], not: Prisma.JsonNull } },
					{ metadata: { path: ['challengeID'], equals: challenge.id } }
				]
			},
			orderBy: { occurred_at: 'desc' },
			take: 20
		});
		return {
			files: [
				{
					name: `${challenge.id}.json`,
					buffer: Buffer.from(JSON.stringify({ challenge, progress, recentEvents: events }, null, 2))
				}
			]
		};
	}
	if (options.action === 'complete' || options.action === 'reverse') {
		if (!options.reason?.trim()) return 'Provide a reason for the audit log.';
		await setBingoChallengeCompletion({
			seasonID: season.id,
			challengeID: challenge.id,
			adminID: user.id,
			completed: options.action === 'complete',
			reason: options.reason.trim()
		});
		return `${options.action === 'complete' ? 'Completed' : 'Reset'} **${challenge.name}**. The action has been recorded.`;
	}
	return 'Unknown administrative action.';
}

export async function seasonalBingoCommand(
	user: MUser,
	options: SeasonalOptions,
	guildID: string | null
): CommandResponse {
	if (options.seasonal_admin) {
		try {
			return await administerSeason(user, options.seasonal_admin, guildID);
		} catch (err) {
			if (err instanceof z.ZodError)
				return `Invalid season configuration: ${err.issues
					.slice(0, 3)
					.map(i => `${i.path.join('.')}: ${i.message}`)
					.join('; ')}`;
			throw err;
		}
	}
	const id = options.board?.season ?? options.progress?.season ?? options.history?.season;
	if (id && !z.uuid().safeParse(id).success) return 'Invalid season ID.';
	if (options.history && !id) {
		const seasons = await prisma.bingoSeason.findMany({
			where: { OR: [{ status: 'completed' }, { end_date: { lte: new Date() } }] },
			orderBy: { start_date: 'desc' },
			take: 10
		});
		return seasons.length
			? `**Completed seasonal bingos**\n${seasons.map(s => `**${s.name}** — \`${s.id}\``).join('\n')}\nUse /bingo history season to view a board.`
			: 'There are no completed seasons yet.';
	}
	const season = await fetchBingoSeason(id);
	if (!season) return 'There is no active seasonal bingo. Use /bingo history to view past seasons.';
	const challenges = bingoBoardSchema.parse(season.challenges);
	const completed = season.progress.filter(p => p.completed_at).length;
	const summary = `**${season.name}** — ${completed}/${challenges.length} completed (${Math.round((completed / challenges.length) * 100)}%)\n${dateFm(season.start_date)} – ${dateFm(season.end_date)}. Community board; everyone contributes.`;
	if (options.progress) {
		const quantities = challenges
			.filter(c => 'requiredQuantity' in c)
			.slice(0, 8)
			.map(c => {
				const p = season.progress.find(p => p.challenge_id === c.id);
				return `${c.name}: ${(p?.quantity ?? 0).toLocaleString()}/${challengeTarget(c).toLocaleString()}`;
			});
		return {
			content: [summary, ...quantities].join('\n'),
			files: [
				{
					name: 'bingo-progress.txt',
					buffer: Buffer.from(
						challenges
							.map((c, index) => {
								const p = season.progress.find(p => p.challenge_id === c.id);
								return `${index + 1}. [${p?.completed_at ? 'x' : ' '}] ${c.name} (${c.id}): ${Number((p?.quantity ?? 0).toFixed(3)).toLocaleString()}/${challengeTarget(c).toLocaleString()}\n   ${c.description}`;
							})
							.join('\n')
					)
				}
			]
		};
	}
	return {
		content: summary,
		files: [{ name: `bingo-${season.theme}-${season.year}.png`, buffer: await cachedBingoBoard(season) }]
	};
}

export async function seasonalBingoLeaderboard(): CommandResponse {
	const season = await fetchBingoSeason();
	if (!season) return 'There is no active seasonal bingo.';
	const leaders = await bingoContributorLeaderboard(season.id);
	return `**${season.name}: contributors**\nEach challenge is worth 1 point, shared proportionally for quantities and component sets. Completed tiles earn no further points. Manual completions earn no points.\n${leaders.length ? leaders.map((u, i) => `${i + 1}. <@${u.user_id}> — ${u.score.toFixed(3)} points`).join('\n') : 'No contributions yet.'}`;
}
