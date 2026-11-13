import type { Prisma } from '@/prisma/main.js';
import type { BingoTheme } from '@/lib/bingo/bingoTypes.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import type { StoredBingoTile } from '@/mahoji/lib/bingo/bingoUtil.js';

export function bingoWithTiles(tiles: StoredBingoTile[], theme: BingoTheme | null = 'winter') {
	return new BingoManager({
		id: 1,
		theme,
		creator_id: '1111111111111111',
		organizers: [],
		is_global: false,
		start_date: new Date('2026-11-01T00:00:00Z'),
		duration_days: 30,
		team_size: 2,
		title: 'Winter OSB Bingo 2026',
		notifications_channel_id: '1111111111111111',
		ticket_price: 0n,
		bingo_tiles: tiles as unknown as Prisma.JsonValue[],
		was_finalized: false,
		guild_id: '1111111111111111',
		extra_gp: 0n,
		trophies_apply: false
	});
}
