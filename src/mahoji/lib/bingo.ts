import { Prisma, User } from '@prisma/client';
import { chunk, Time } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { production } from '../../config';
import { prisma } from '../../lib/settings/prisma';
import { logError } from '../../lib/util/logError';
import resolveItems from '../../lib/util/resolveItems';
import { sendToChannelID } from '../../lib/util/webhook';

const BINGO_NOTIFICATION_CHANNEL_ID = production ? '1008531589485043764' : '1008794250974089266';

export const bingoStart = 1_660_586_078_890;
export const bingoEnd = bingoStart + Time.Day * 7;

export function bingoIsActive() {
	return Date.now() >= bingoStart && Date.now() < bingoEnd;
}
type BingoTile = (
	| {
			oneOf: number[];
	  }
	| {
			allOf: number[];
	  }
	| {
			customReq: (cl: Bank) => boolean;
	  }
) & {
	id: number;
	name: string;
};

export const bingoTiles: BingoTile[] = [
	{
		id: 2,
		name: '1 Main Hand Drygore Weapon AND 1 Offhand Drygore Weapon',
		customReq: cl => {
			return (
				resolveItems(['Drygore rapier', 'Drygore longsword', 'Drygore mace']).some(id => cl.has(id)) &&
				resolveItems(['Offhand drygore rapier', 'Offhand drygore longsword', 'Offhand drygore mace']).some(id =>
					cl.has(id)
				)
			);
		}
	},
	{
		id: 17,
		name: 'Any revs weapon OR amulet of avarice OR ancient crystal',
		oneOf: resolveItems([
			"Craw's bow (u)",
			"Thammaron's sceptre (u)",
			"Viggora's chainmace (u)",
			'Amulet of avarice',
			'Ancient crystal'
		])
	},
	{
		id: 25,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	}
];

export function determineBingoProgress(_cl: ItemBank | Prisma.JsonValue | Bank) {
	const cl = _cl instanceof Bank ? _cl : new Bank(_cl as ItemBank);
	let tilesCompletedCount = 0;
	const tilesCompleted: number[] = [];

	// prettier-ignore
	const bingoTable = 
		['', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '']

	for (let i = 0; i < bingoTiles.length; i++) {
		const tile = bingoTiles[i];

		let completed = false;
		if ('oneOf' in tile) {
			completed = tile.oneOf.some(id => cl.has([id]));
		} else if ('allOf' in tile) {
			completed = tile.allOf.every(id => cl.has(id));
		} else {
			completed = tile.customReq(cl);
		}

		if (completed) {
			tilesCompletedCount++;
			tilesCompleted.push(tile.id);
		}
		bingoTable[i] = completed ? '✅' : '🛑';
	}

	return {
		tilesCompletedCount,
		bingoTable,
		bingoTableStr: chunk(bingoTable, 5)
			.map(row => `${row.join(' ')}`)
			.join('\n'),
		tilesCompleted
	};
}

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
	if (!user.is_playing_bingo) return;
	const tile = bingoTiles.find(i => i.id === finishedTile)!;
	sendToChannelID(BINGO_NOTIFICATION_CHANNEL_ID, {
		content: `${user} just finished the '${tile.name}' tile! This is their ${after.tilesCompletedCount}/${bingoTiles.length} finished tile.`
	});
}

async function getAllBingoPlayers() {
	const users = await prisma.user.findMany({
		where: {
			is_playing_bingo: true
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
export async function bingoTeamLeaderboard() {
	const bingoTeams = await fetchAndParseAllBingoTeams();
	const allUsers = (
		await prisma.user.findMany({
			where: {
				id: {
					in: bingoTeams.map(i => i.users).flat(3)
				}
			},
			select: {
				id: true,
				temp_cl: true
			}
		})
	).map(i => ({ cl: i.temp_cl as ItemBank, id: i.id }));

	const result: {
		progress: ReturnType<typeof determineBingoProgress>;
		team: ParsedBingoTeam;
	}[] = [];
	for (const team of bingoTeams) {
		const data = allUsers.filter(i => team.users.includes(i.id))!;
		let totalCL = new Bank();
		for (const t of data) totalCL.add(t.cl);
		const progress = determineBingoProgress(totalCL);
		result.push({
			progress,
			team
		});
	}

	return result.sort((a, b) => b.progress.tilesCompletedCount - a.progress.tilesCompletedCount);
}
