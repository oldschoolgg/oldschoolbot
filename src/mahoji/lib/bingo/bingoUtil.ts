import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../../../lib/settings/prisma';
import { getItem } from '../../../lib/util/getOSItem';
import { logError } from '../../../lib/util/logError';
import { sendToChannelID } from '../../../lib/util/webhook';

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

export async function onFinishTile(
	user: User,
	before: ReturnType<typeof determineBingoProgress>,
	after: ReturnType<typeof determineBingoProgress>
) {
	const finishedTile = after.tilesCompleted.find(id => !before.tilesCompleted.includes(id));
	if (!finishedTile) {
		logError('No finished tile?', { user_id: user.id });
		return;
	}
	if (!user.bingo_tickets_bought) return;
	const tile = bingoTiles.find(i => i.id === finishedTile)!;
	sendToChannelID(BINGO_NOTIFICATION_CHANNEL_ID, {
		content: `${userMention(user.id)} just finished the '${tile.name}' tile! This is their ${
			after.tilesCompletedCount
		}/${bingoTiles.length} finished tile.`
	});
}

async function getAllBingoPlayers() {
	const users = await prisma.user.findMany({
		where: {
			bingo_tickets_bought: {
				gt: 0
			}
		},
		select: {
			id: true,
			temp_cl: true
		}
	});
	return users
		.map(i => ({ id: i.id, ...determineBingoProgress(i.temp_cl) }))
		.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount);
}

export async function csvDumpBingoPlayers() {
	const users = await getAllBingoPlayers();
	return users.map(i => `${i.id}\t${i.tilesCompletedCount}\t${i.tilesCompleted.join(',')}`).join('\n');
}

export async function bingoLeaderboard() {
	const mapped = (await getAllBingoPlayers()).slice(0, 10);
	return `Bingo Leaderboard
${mapped.map((i, index) => `${++index}. <@${i.id}> - ${i.tilesCompletedCount} tiles`).join('\n')}`;
}

interface ParsedBingoTeam {
	id: number;
	users: [string, string, string];
}
async function fetchAndParseAllBingoTeams(): Promise<ParsedBingoTeam[]> {
	const teams = await prisma.bingoTeam.findMany();
	return teams.map(i => ({
		id: i.id,
		users: [i.first_user, i.second_user, i.third_user]
	}));
}

export async function calculateBingoTeamDetails(oneTeamMember: string | string[]) {
	const bingoTeams = await fetchAndParseAllBingoTeams();
	const team = Array.isArray(oneTeamMember)
		? oneTeamMember
		: bingoTeams.find(_team => _team.users.includes(oneTeamMember))?.users;
	if (!team) return null;

	const collectionLogs = (
		await prisma.user.findMany({
			where: {
				id: {
					in: team
				}
			},
			select: {
				temp_cl: true
			}
		})
	).map(i => i.temp_cl) as ItemBank[];

	const totalCL = new Bank();
	for (const cl of collectionLogs) totalCL.add(cl);

	return {
		progress: determineBingoProgress(totalCL),
		team
	};
}

export interface BingoConfig {
	id: string;
	startDate: number;
	endDate: number;
	teamSize: number;
	organizerUserID: string;
	title: string;
	notificationsChannelID: string;
	ticketPrice: number;
}

export function generateTileName(tile: OneOf | AllOf) {
	if ('oneOf' in tile) {
		return `Receive one of: ${tile.oneOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	if ('allOf' in tile) {
		return `Receive all of: ${tile.allOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	throw new Error(`Invalid tile: ${tile}`);
}
