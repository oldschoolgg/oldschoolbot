import type { APIAttachment } from '@oldschoolgg/discord';
import { UserError } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';
import { z } from 'zod';

import type { Prisma } from '@/prisma/main.js';
import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import {
	type BingoChallenge,
	type BingoTheme,
	bingoBoardSchema,
	bingoItemIDs,
	bingoThemes
} from '@/lib/bingo/bingoTypes.js';
import type { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import type { StoredBingoTile } from '@/mahoji/lib/bingo/bingoUtil.js';

export const seasonalCreateOptions = [
	{
		type: 'String',
		name: 'theme',
		description: 'Optional board artwork.',
		required: false,
		choices: bingoThemes.map(value => ({ name: value, value }))
	},
	{ type: 'Attachment', name: 'configuration', description: 'JSON file containing 28 bingo tiles.', required: false }
] as const satisfies readonly CommandOption[];

export const seasonalManageOptions = [
	...seasonalCreateOptions,
	{
		type: 'Boolean',
		name: 'template',
		description: "Download this board's tile JSON, or a starter template.",
		required: false
	}
] as const satisfies readonly CommandOption[];

const nativeTileSchema = z.intersection(
	z.object({
		key: z.string().max(64).optional(),
		name: z.string().min(1).max(80).optional(),
		description: z.string().max(300).optional(),
		iconItemID: z
			.number()
			.int()
			.positive()
			.refine(id => Items.has(id))
			.optional()
	}),
	z.union([
		z.object({ oneOf: bingoItemIDs }),
		z.object({ allOf: bingoItemIDs }),
		z.object({
			bank: z
				.record(z.string(), z.number().int().positive().max(1_000_000_000))
				.refine(bank => Object.keys(bank).length > 0 && Object.keys(bank).every(id => Items.has(Number(id))))
		}),
		z.object({
			custom: z.discriminatedUnion('type', [
				z.object({
					type: z.literal('item_quantity'),
					itemIDs: bingoItemIDs,
					quantity: z.number().int().positive().max(1_000_000_000)
				}),
				z.object({ type: z.literal('item_sets'), sets: z.array(z.array(bingoItemIDs).min(1)).min(1) })
			])
		})
	])
);

function challengeToTile(challenge: BingoChallenge): StoredBingoTile {
	const metadata = {
		key: challenge.id,
		name: challenge.name,
		description: challenge.description,
		iconItemID: challenge.iconItemID
	};
	if (challenge.type === 'item_drop') return { ...metadata, oneOf: [...new Set(challenge.targetItemIDs)] };
	if (challenge.type === 'item_quantity') {
		const itemIDs = [...new Set(challenge.targetItemIDs)];
		return itemIDs.length === 1
			? { ...metadata, bank: { [itemIDs[0]]: challenge.requiredQuantity } }
			: { ...metadata, custom: { type: 'item_quantity', itemIDs, quantity: challenge.requiredQuantity } };
	}
	if (challenge.itemSets.length === 1 && challenge.itemSets[0].every(group => group.length === 1)) {
		return { ...metadata, allOf: challenge.itemSets[0].flat() };
	}
	return { ...metadata, custom: { type: 'item_sets', sets: challenge.itemSets } };
}

export function parseBingoConfiguration(input: unknown): StoredBingoTile[] {
	const challenges = bingoBoardSchema.safeParse(input);
	if (challenges.success) return challenges.data.map(challengeToTile);
	const tiles = z.array(nativeTileSchema).length(28).safeParse(input);
	if (tiles.success) return tiles.data;
	throw new UserError(
		'Invalid bingo configuration. Supply exactly 28 valid item-drop, quantity or item-set tiles. Activity-completion tiles are not supported by the existing loot-based bingo system.'
	);
}

export async function importBingoConfiguration(configuration?: APIAttachment): Promise<StoredBingoTile[]> {
	if (!configuration) return parseBingoConfiguration(defaultBingoChallenges());
	if (configuration.size > 100_000) throw new UserError('The configuration must be smaller than 100 KB.');
	const response = await fetch(configuration.url, { signal: AbortSignal.timeout(10_000) });
	if (!response.ok) throw new UserError('Unable to download the configuration.');
	let input: unknown;
	try {
		input = await response.json();
	} catch {
		throw new UserError('The configuration must be a valid JSON array.');
	}
	return parseBingoConfiguration(input);
}

export async function manageSeasonalBingo(
	bingo: BingoManager,
	interaction: MInteraction,
	options: {
		theme?: BingoTheme;
		configuration?: APIAttachment;
		template?: boolean;
	}
): Promise<SendableMessage | null> {
	if (options.template)
		return {
			files: [
				{
					name: 'bingo-tiles.json',
					buffer: Buffer.from(
						JSON.stringify(
							bingo.rawBingoTiles.length === 28 ? bingo.rawBingoTiles : defaultBingoChallenges(),
							null,
							2
						)
					)
				}
			]
		};
	if (!options.theme && !options.configuration) return null;
	if (bingo.wasFinalized || new Date() >= bingo.startDate)
		return 'Board settings can only be changed before the bingo starts.';
	const theme = options.theme ?? bingo.theme;
	const tiles = options.configuration
		? await importBingoConfiguration(options.configuration)
		: bingo.rawBingoTiles.length > 0
			? bingo.rawBingoTiles
			: await importBingoConfiguration();
	if (theme && tiles.length !== 28)
		return 'A seasonal board requires exactly 28 tiles. Upload a configuration with 28 tiles.';
	await interaction.confirmation(
		`Use ${tiles.length} tiles${theme ? ` with the ${theme} artwork` : ''} for **${bingo.title}**? Existing team registration and scoring apply.`
	);
	const { count } = await prisma.bingo.updateMany({
		where: { id: bingo.id, was_finalized: false, start_date: { gt: new Date() } },
		data: { theme, bingo_tiles: tiles as unknown as Prisma.InputJsonObject[] }
	});
	if (count !== 1) throw new UserError('This bingo has already started or ended.');
	return 'Updated the board. Team progress continues to use the normal bingo item tracking.';
}
