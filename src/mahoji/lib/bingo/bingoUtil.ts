import { Bank } from 'oldschooljs';

import { getItem } from '../../../lib/util/getOSItem';

interface CustomReq {
	customReq: (cl: Bank) => boolean;
}
interface OneOf {
	oneOf: number[];
}

interface AllOf {
	allOf: number[];
}

export type UniversalBingoTile = {
	name: string;
} & (OneOf | AllOf | CustomReq);

type GlobalTileID = number;
export type StoredBingoTile = OneOf | AllOf | GlobalTileID;

export type GlobalBingoTile = (OneOf | AllOf | CustomReq) & {
	id: number;
	name: string;
};

// export async function onFinishTile(
// 	user: User,
// 	before: ReturnType<typeof determineBingoProgress>,
// 	after: ReturnType<typeof determineBingoProgress>
// ) {
// 	const finishedTile = after.tilesCompleted.find(id => !before.tilesCompleted.includes(id));
// 	if (!finishedTile) {
// 		logError('No finished tile?', { user_id: user.id });
// 		return;
// 	}
// 	if (!user.bingo_tickets_bought) return;
// 	const tile = bingoTiles.find(i => i.id === finishedTile)!;
// 	sendToChannelID(BINGO_NOTIFICATION_CHANNEL_ID, {
// 		content: `${userMention(user.id)} just finished the '${tile.name}' tile! This is their ${
// 			after.tilesCompletedCount
// 		}/${bingoTiles.length} finished tile.`
// 	});
// }

// export async function csvDumpBingoPlayers() {
// 	const users = await getAllBingoPlayers();
// 	return users.map(i => `${i.id}\t${i.tilesCompletedCount}\t${i.tilesCompleted.join(',')}`).join('\n');
// }

export function generateTileName(tile: OneOf | AllOf) {
	if ('oneOf' in tile) {
		return `Receive one of: ${tile.oneOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	if ('allOf' in tile) {
		return `Receive all of: ${tile.allOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	throw new Error(`Invalid tile: ${tile}`);
}
