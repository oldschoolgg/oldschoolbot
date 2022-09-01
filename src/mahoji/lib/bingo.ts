import { userMention } from '@discordjs/builders';
import { Prisma, User } from '@prisma/client';
import { chunk, Time } from 'e';
import { APIButtonComponentWithCustomId, ButtonStyle, ComponentType } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { usernameCache } from '../../lib/constants';
import { championScrolls, skillingPetsCL } from '../../lib/data/CollectionsExport';
import { prisma } from '../../lib/settings/prisma';
import { logError } from '../../lib/util/logError';
import resolveItems from '../../lib/util/resolveItems';
import { sendToChannelID } from '../../lib/util/webhook';

const BINGO_NOTIFICATION_CHANNEL_ID = production ? '1008531589485043764' : '1008794250974089266';

export const bingoStart = 1_662_127_200 * 1000;
export const bingoEnd = bingoStart + Time.Day * 7;
export const BINGO_TICKET_PRICE = 150_000_000;

export function bingoIsActive() {
	return false; // Date.now() >= bingoStart && Date.now() < bingoEnd;
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
		name: 'Receive any boss pet',
		oneOf: resolveItems([
			'Ikkle hydra',
			'Callisto cub',
			'Hellpuppy',
			'Pet chaos elemental',
			'Pet zilyana',
			'Pet dark core',
			'Pet dagannoth prime',
			'Pet dagannoth supreme',
			'Pet dagannoth rex',
			'Pet general graardor',
			'Baby mole',
			'Noon',
			'Kalphite princess',
			'Prince black dragon',
			'Pet kraken',
			"Pet kree'arra",
			"Pet k'ril tsutsaroth",
			"Scorpia's offspring",
			'Pet smoke devil',
			'Venenatis spiderling',
			"Vet'ion jr.",
			'Vorki',
			'Pet snakeling',
			'Olmlet',
			"Lil' zik",
			'Sraracha',
			'Nexling'
		])
	},
	{
		id: 2,
		name: 'Receive any skilling pet',
		oneOf: skillingPetsCL
	},
	{
		id: 3,
		name: 'Receive any Torva Armour Piece from Nex',
		oneOf: resolveItems(['Torva full helm', 'Torva platebody', 'Torva platelegs'])
	},
	{
		id: 4,
		name: 'Receive a Dragon warhammer',
		allOf: resolveItems(['Dragon warhammer'])
	},
	{
		id: 5,
		name: 'Receive a Ring of endurance (uncharged)',
		allOf: resolveItems(['Ring of endurance (uncharged)'])
	},
	{
		id: 6,
		name: 'Receive any Sigil from Corp',
		oneOf: resolveItems(['Arcane sigil', 'Elysian sigil', 'Spectral sigil'])
	},
	// Row 2
	{
		id: 7,
		name: 'Receive all 3 Wilderness Rings',
		allOf: resolveItems(['Tyrannical ring', 'Treasonous ring', 'Ring of the gods'])
	},
	{
		id: 8,
		name: 'Receive a Tanzanite fang or Magic fang from Zulrah',
		oneOf: resolveItems(['Tanzanite fang', 'Magic fang'])
	},
	{
		id: 9,
		name: 'Receive any unique seed from Gauntlet',
		oneOf: resolveItems(['Crystal weapon seed', 'Crystal armour seed', 'Enhanced crystal weapon seed'])
	},
	{
		id: 10,
		name: 'Create an Odium ward or Malediction ward from scratch',
		customReq: cl => {
			return (
				['Odium shard 1', 'Odium shard 2', 'Odium shard 3', 'Odium ward'].every(item => cl.has(item)) ||
				['Malediction shard 1', 'Malediction shard 2', 'Malediction shard 3', 'Malediction ward'].every(item =>
					cl.has(item)
				)
			);
		}
	},
	{
		id: 11,
		name: 'Receive all 3 Cerberus crystals',
		allOf: resolveItems(['Primordial crystal', 'Pegasian crystal', 'Eternal crystal'])
	},
	{
		id: 12,
		name: 'Receive/mine 12,000 Silver ore',
		customReq(cl) {
			return cl.amount('Silver ore') >= 12_000;
		}
	},
	// Row 3
	{
		id: 13,
		name: 'Receive/hunt 5000 Red chinchompas',
		customReq(cl) {
			return cl.amount('Red chinchompa') >= 5000;
		}
	},
	{
		id: 14,
		name: 'Obtain one of: Phoenix, Tiny tempor, Youngllef, Smolcano',
		oneOf: resolveItems(['Phoenix', 'Tiny tempor', 'Youngllef', 'Smolcano'])
	},
	{
		id: 15,
		name: 'Receive 2 unique godsword hilts',
		customReq(cl) {
			return (
				resolveItems(['Ancient hilt', 'Armadyl hilt', 'Bandos hilt', 'Saradomin hilt', 'Zamorak hilt']).filter(
					i => cl.has(i)
				).length >= 2
			);
		}
	},
	{
		id: 16,
		name: 'Receive a black tourmaline core',
		allOf: resolveItems(['Black tourmaline core'])
	},
	{
		id: 17,
		name: 'Receive a Tome of water or Tome of fire',
		oneOf: resolveItems(['Tome of fire', 'Tome of water (empty)'])
	},
	{
		id: 18,
		name: 'Receive any Champion scroll',
		oneOf: resolveItems(championScrolls)
	},
	// Row 4
	{
		id: 19,
		name: 'Receive/chop 5000 mahogany logs',
		customReq(cl) {
			return cl.amount('Mahogany logs') >= 5000;
		}
	},
	{
		id: 20,
		name: 'Receive a Draconic visage',
		allOf: resolveItems(['Draconic visage'])
	},
	{
		id: 21,
		name: 'Receive a Dragon pickaxe',
		allOf: resolveItems(['Dragon pickaxe'])
	},
	{
		id: 22,
		name: 'Receive a Basilisk jaw',
		allOf: resolveItems(['Basilisk jaw'])
	},
	{
		id: 23,
		name: 'Receive a Staff of the dead',
		allOf: resolveItems(['Staff of the dead'])
	},
	{
		id: 24,
		name: 'Receive any orb or armor piece from the Nightmare',
		oneOf: resolveItems([
			"Inquisitor's great helm",
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Volatile orb',
			'Harmonised orb',
			'Eldritch orb'
		])
	},
	// Row 4
	{
		id: 25,
		name: 'Receive any Boss jar',
		allOf: resolveItems([
			'Jar of chemicals',
			'Jar of darkness',
			'Jar of decay',
			'Jar of dirt',
			'Jar of dreams',
			'Jar of eyes',
			'Jar of sand',
			'Jar of smoke',
			'Jar of souls',
			'Jar of spirits',
			'Jar of stone',
			'Jar of swamp'
		])
	},
	{
		id: 26,
		name: 'Receive a hydra eye, fang and heart.',
		allOf: resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"])
	},
	{
		id: 27,
		name: 'Receive a curved bone',
		allOf: resolveItems(['Curved bone'])
	},
	{
		id: 28,
		name: 'Receive a Black mask (10)',
		allOf: resolveItems(['Black mask (10)'])
	},
	{
		id: 29,
		name: 'Receive Bandos tassets or Bandos chestplate',
		oneOf: resolveItems(['Bandos tassets', 'Bandos chestplate'])
	},
	{
		id: 30,
		name: 'Receive any armor drop from Kree Arra',
		oneOf: resolveItems(['Armadyl helmet', 'Armadyl chestplate', 'Armadyl chainskirt'])
	},
	// Row 6
	{
		id: 31,
		name: 'Receive an Armadyl crossbow',
		allOf: resolveItems(['Armadyl crossbow'])
	},
	{
		id: 32,
		name: 'Receive a Kq head',
		allOf: resolveItems(['Kq head'])
	},
	{
		id: 33,
		name: 'Receive a Strange old lockpick',
		allOf: resolveItems(['Strange old lockpick'])
	},
	{
		id: 34,
		name: 'Receive a Golden tench',
		allOf: resolveItems(['Golden tench'])
	},
	{
		id: 35,
		name: 'Receive a Sarachnis cudgel',
		allOf: resolveItems(['Sarachnis cudgel'])
	},
	{
		id: 36,
		name: 'Receive a fedora',
		allOf: resolveItems(['Fedora'])
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
		content: `${usernameCache.get(user.id) ?? userMention(user.id)} just finished the '${
			tile.name
		}' tile! This is their ${after.tilesCompletedCount}/${bingoTiles.length} finished tile.`
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
