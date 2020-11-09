import { CollectionLogType } from '../collectionLog';
import { ItemBank } from '../types';

export type LeaderboardType = 'cl';

export interface BaseProps {
	type: LeaderboardType;
}

// CL
export interface CLUser {
	id: string;
	collectionLogBank: ItemBank;
}

export interface CLProps extends BaseProps {
	type: 'cl';
	collectionLogInput: CollectionLogType;
	users: CLUser[];
}

function clCount(items: number[], collectionLog: ItemBank) {
	return Object.entries(collectionLog).filter(
		([itemID, qty]) => qty > 0 && items.includes(parseInt(itemID))
	).length;
}

async function clLeaderboard({ collectionLogInput, users }: CLProps): Promise<CLUser[]> {
	const items = Object.values(collectionLogInput.items).flat(100);
	const result = users.sort((a, b) => {
		return clCount(items, b.collectionLogBank) - clCount(items, a.collectionLogBank);
	});

	return parseResult(result);
}

function parseResult(data: any[]) {
	return data.slice(0, 500);
}

export default async function leaderboardWorker(data: CLProps): Promise<CLUser[]>;
export default async function leaderboardWorker(data: CLProps) {
	switch (data.type) {
		case 'cl':
			return clLeaderboard(data);
	}
}
