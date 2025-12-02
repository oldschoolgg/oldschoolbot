interface HolderCounts {
	[itemId: number]: number;
}

interface HolderSnapshotRaw {
	date: Date | string;
	holder_count: unknown;
}

interface HolderCountPayload {
	all?: Record<string, unknown>;
	ironman?: Record<string, unknown>;
}

function normaliseCounts(raw?: Record<string, unknown>): HolderCounts {
	if (!raw) return {};
	const entries = Object.entries(raw);
	const result: HolderCounts = {};
	for (const [key, value] of entries) {
		const itemId = Number(key);
		if (!Number.isInteger(itemId)) continue;
		const asNumber =
			typeof value === 'bigint' ? Number(value) : typeof value === 'string' ? Number(value) : Number(value);
		if (Number.isNaN(asNumber)) continue;
		result[itemId] = asNumber;
	}
	return result;
}

export interface HolderSnapshot {
	date: Date;
	all: HolderCounts;
	ironman: HolderCounts;
}

export async function fetchLatestHolderSnapshot(): Promise<HolderSnapshot | null> {
	const [snapshot] = await prisma.$queryRaw<HolderSnapshotRaw[]>`
                SELECT date, holder_count
                FROM economy_item_banks
                ORDER BY date DESC
                LIMIT 1;
        `;

	if (!snapshot || !snapshot.holder_count || typeof snapshot.holder_count !== 'object') {
		return null;
	}

	const holderCount = snapshot.holder_count as HolderCountPayload | Record<string, unknown>;
	const date = snapshot.date instanceof Date ? snapshot.date : new Date(snapshot.date);

	const allCountsSource =
		'all' in holderCount && typeof (holderCount as HolderCountPayload).all === 'object'
			? (holderCount as HolderCountPayload).all
			: (holderCount as Record<string, unknown>);
	const ironmanCountsSource =
		'ironman' in holderCount && typeof (holderCount as HolderCountPayload).ironman === 'object'
			? (holderCount as HolderCountPayload).ironman
			: undefined;

	return {
		date,
		all: normaliseCounts(allCountsSource),
		ironman: normaliseCounts(ironmanCountsSource)
	};
}
