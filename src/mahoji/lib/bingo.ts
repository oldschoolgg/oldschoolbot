import { Prisma, User } from '@prisma/client';
import { chunk, Time } from 'e';
import { APIButtonComponentWithCustomId, ButtonStyle, ComponentType } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { prisma } from '../../lib/settings/prisma';
import { logError } from '../../lib/util/logError';
import resolveItems from '../../lib/util/resolveItems';
import { sendToChannelID } from '../../lib/util/webhook';

const BINGO_NOTIFICATION_CHANNEL_ID = production ? '1008531589485043764' : '1008794250974089266';

export const bingoStart = 1_662_086_857_700;
export const bingoEnd = bingoStart + Time.Day * 7;
export const BINGO_TICKET_PRICE = 150_000_000;

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
		id: 1,
		name: '1 Main Hand Drygore Weapon AND 1 Offhand Drygore Weapon',
		customReq: cl => {
			return cl.has('Coal');
		}
	},
	{
		id: 2,
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
		id: 3,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 4,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 5,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 6,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 7,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 8,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 9,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 10,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 11,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 12,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 13,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 14,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 15,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 16,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 17,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 18,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 19,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 20,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 21,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 22,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 23,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 24,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 25,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 26,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 27,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 28,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 29,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 30,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 31,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 32,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 33,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 34,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 35,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	},
	{
		id: 36,
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
		['', '', '', '', '', '',
		 '', '', '', '', '', '',
		 '', '', '', '', '', '',
		 '', '', '', '', '', '',
		 '', '', '', '', '', ''];

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
		bingoTableStr: chunk(bingoTable, 6)
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
	if (!user.bingo_tickets_bought) return;
	const tile = bingoTiles.find(i => i.id === finishedTile)!;
	sendToChannelID(BINGO_NOTIFICATION_CHANNEL_ID, {
		content: `${user} just finished the '${tile.name}' tile! This is their ${after.tilesCompletedCount}/${bingoTiles.length} finished tile.`
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

export const buyBingoTicketButton: APIButtonComponentWithCustomId = {
	type: ComponentType.Button,
	custom_id: 'BUY_BINGO_TICKET',
	label: `Buy Bingo Ticket (${toKMB(BINGO_TICKET_PRICE)})`,
	style: ButtonStyle.Secondary
};

export async function countTotalGPInPrizePool() {
	const sum = await prisma.user.aggregate({
		_sum: {
			bingo_gp_contributed: true
		}
	});
	return Number(sum._sum.bingo_gp_contributed);
}
