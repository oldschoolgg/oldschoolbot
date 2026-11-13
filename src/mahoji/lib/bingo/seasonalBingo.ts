import type { APIAttachment } from '@oldschoolgg/discord';
import { Time, UserError } from '@oldschoolgg/toolkit';
import { z } from 'zod';

import { Prisma } from '@/prisma/main.js';
import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { processPendingBingoEvents, setBingoChallengeCompletion } from '@/lib/bingo/bingoSeason.js';
import { type BingoTheme, bingoBoardSchema, bingoThemes } from '@/lib/bingo/bingoTypes.js';
import type { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';

export const seasonalCreateOptions = [
	{
		type: 'String',
		name: 'theme',
		description: 'Optional seasonal board artwork.',
		required: false,
		choices: bingoThemes.map(value => ({ name: value, value }))
	},
	{
		type: 'Attachment',
		name: 'configuration',
		description: 'JSON file containing 28 challenges for the seasonal board.',
		required: false
	}
] as const satisfies readonly CommandOption[];

export const seasonalManageOptions = [
	...seasonalCreateOptions,
	{
		type: 'Boolean',
		name: 'template',
		description: "Download this board's challenge JSON, or a starter template.",
		required: false
	},
	{
		type: 'Integer',
		name: 'team',
		description: 'Team ID for a manual correction or inspection; listed in /bingo leaderboard.',
		min_value: 1,
		required: false
	},
	{
		type: 'String',
		name: 'complete_tile',
		description: 'Challenge ID to complete for the selected team.',
		required: false
	},
	{
		type: 'String',
		name: 'reverse_tile',
		description: 'Challenge ID to reset for the selected team.',
		required: false
	},
	{
		type: 'String',
		name: 'inspect_tile',
		description: 'Challenge ID to inspect for the selected team.',
		required: false
	},
	{ type: 'String', name: 'reason', description: 'Audit reason for a manual correction.', required: false }
] as const satisfies readonly CommandOption[];

export async function seasonalBingoSettings(theme: BingoTheme, startDate: Date, configuration?: APIAttachment) {
	let challenges: unknown = defaultBingoChallenges();
	if (configuration) {
		if (configuration.size > 100_000) throw new UserError('The configuration must be smaller than 100 KB.');
		const response = await fetch(configuration.url, { signal: AbortSignal.timeout(10_000) });
		if (!response.ok) throw new UserError('Unable to download the configuration.');
		try {
			challenges = await response.json();
		} catch {
			throw new UserError('The configuration must be a valid JSON array.');
		}
	}
	const parsed = bingoBoardSchema.safeParse(challenges);
	if (!parsed.success) {
		throw new UserError(
			`Invalid bingo configuration: ${parsed.error.issues
				.slice(0, 3)
				.map(i => `${i.path.join('.')}: ${i.message}`)
				.join('; ')}`
		);
	}
	return { theme, year: startDate.getUTCFullYear(), challenges: parsed.data };
}

type ManageOptions = {
	theme?: BingoTheme;
	configuration?: APIAttachment;
	template?: boolean;
	team?: number;
	complete_tile?: string;
	reverse_tile?: string;
	inspect_tile?: string;
	reason?: string;
};

export async function manageSeasonalBingo(
	bingo: BingoManager,
	user: MUser,
	interaction: MInteraction,
	options: ManageOptions
): Promise<SendableMessage | null> {
	if (options.template) {
		const challenges = bingo.season ? bingoBoardSchema.parse(bingo.season.challenges) : defaultBingoChallenges();
		return {
			files: [
				{
					name: 'bingo-challenges.json',
					buffer: Buffer.from(JSON.stringify(challenges, null, 2))
				}
			]
		};
	}
	if (options.configuration || options.theme) {
		if (bingo.wasFinalized || new Date() >= bingo.startDate)
			return 'Seasonal boards can only be configured before the bingo starts.';
		const theme = options.theme ?? bingo.season?.theme;
		const parsedTheme = z.enum(bingoThemes).safeParse(theme);
		if (!parsedTheme.success) return 'Choose a seasonal theme with the configuration.';
		const settings =
			options.configuration || !bingo.season
				? await seasonalBingoSettings(parsedTheme.data, bingo.startDate, options.configuration)
				: {
						theme: parsedTheme.data,
						year: bingo.season.year,
						challenges: bingoBoardSchema.parse(bingo.season.challenges)
					};
		await interaction.confirmation(
			`Use this ${settings.theme} board with 28 challenges for **${bingo.title}**? All teams will use these challenges and keep separate progress.`
		);
		await prisma.$transaction(async tx => {
			// Lock the existing bingo, then its seasonal settings, matching team-registration order.
			await tx.$queryRaw`SELECT id FROM bingo WHERE id = ${bingo.id} FOR UPDATE`;
			const current = await tx.bingo.findUniqueOrThrow({ where: { id: bingo.id } });
			if (current.was_finalized || new Date() >= current.start_date)
				throw new UserError('This bingo has already started or ended.');
			await tx.bingoSeason.upsert({
				where: { bingo_id: bingo.id },
				create: {
					...settings,
					bingo_id: bingo.id,
					name: current.title,
					start_date: current.start_date,
					end_date: new Date(current.start_date.getTime() + current.duration_days * Time.Day)
				},
				update: { ...settings, progress_version: { increment: 1 } }
			});
		});
		return 'Updated the seasonal board. Players join using /bingo make_team and view their board using /bingo view.';
	}
	const challengeID = options.complete_tile ?? options.reverse_tile ?? options.inspect_tile;
	if (!challengeID) return null;
	if (!bingo.season) return 'This bingo does not have a seasonal board.';
	if (!options.team) return 'Choose a team ID from /bingo leaderboard.';
	const team = await prisma.bingoTeam.findFirst({ where: { id: options.team, bingo_id: bingo.id } });
	if (!team) return 'That team is not in this bingo.';
	const challenge = bingoBoardSchema.parse(bingo.season.challenges).find(c => c.id === challengeID);
	if (!challenge) return 'Unknown challenge ID. Download the configuration using /bingo manage_bingo template:true.';
	await processPendingBingoEvents(bingo.season.id);
	if (options.inspect_tile) {
		const progress = await prisma.seasonalBingoProgress.findUnique({
			where: {
				season_id_team_id_challenge_id: {
					season_id: bingo.season.id,
					team_id: team.id,
					challenge_id: challenge.id
				}
			}
		});
		const events = await prisma.seasonalBingoEvent.findMany({
			where: {
				season_id: bingo.season.id,
				team_id: team.id,
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
					name: `${challenge.id}-team-${team.id}.json`,
					buffer: Buffer.from(JSON.stringify({ challenge, progress, recentEvents: events }, null, 2))
				}
			]
		};
	}
	if (options.complete_tile && options.reverse_tile) return 'Choose either complete_tile or reverse_tile.';
	if (!options.reason?.trim()) return 'Provide a reason for the audit log.';
	await setBingoChallengeCompletion({
		seasonID: bingo.season.id,
		teamID: team.id,
		challengeID: challenge.id,
		adminID: user.id,
		completed: Boolean(options.complete_tile),
		reason: options.reason.trim()
	});
	return `${options.complete_tile ? 'Completed' : 'Reset'} **${challenge.name}** for team ${team.id}. The correction has been recorded.`;
}
