import { userMention } from '@discordjs/builders';
import { Prisma, User } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { chunk, Time } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { TanglerootTable } from '../../lib/minions/data/killableMonsters/custom/Treebeard';
import { prisma } from '../../lib/settings/prisma';
import { assert, logError } from '../../lib/util/logError';
import resolveItems from '../../lib/util/resolveItems';
import { sendToChannelID } from '../../lib/util/webhook';

const start = 1_683_295_200;

export const BINGO_CONFIG = {
	startDate: start * 1000,
	endDate: start * 1000 + Time.Day * 7,
	startUnixDate: start,
	endUnixDate: start + Time.Day * 7,
	ticketPrice: 1_000_000_000,
	teamSize: 1,
	notificationsChannelID: production ? '1094693702536007750' : '1042760447830536212',
	title: '#2 - BSO Bingo'
};

export function bingoIsActive() {
	return production ? Date.now() >= BINGO_CONFIG.startDate && Date.now() < BINGO_CONFIG.endDate : true;
}
type BingoTile = (
	| {
			oneOf: (number | string)[] | (number | string)[][];
	  }
	| {
			allOf: (number | string)[];
	  }
	| {
			receiveBank: Bank;
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
		name: 'Receive any custom pet',
		oneOf: [
			'Doug',
			'Zippy',
			'Shelldon',
			'Remy',
			'Lil Lamb',
			'Harry',
			'Klik',
			'Wintertoad',
			'Scruffy',
			'Zak',
			'Skipper',
			'Ori',
			'Takon',
			'Obis',
			'Peky',
			'Plopper',
			'Brock',
			'Wilvus',
			'Sandy',
			'Baby kalphite king',
			'Steve',
			'Voidling',
			'Jal-MejJak',
			'Queen black dragonling',
			'Phoenix eggling',
			'Cogsworth',
			'Mini moktang',
			'Balloon cat',
			'Baby yaga house'
		]
	},
	{
		id: 2,
		name: 'Receive any skilling pet',
		oneOf: ['Heron', 'Rock golem', 'Beaver', 'Baby chinchompa', 'Giant squirrel', 'Rocky', 'Rift guardian']
	},
	{
		id: 3,
		name: 'Receive any Main/off-hand drygore set',
		oneOf: [
			['Drygore longsword', 'Offhand drygore longsword'],
			['Drygore mace', 'Offhand drygore mace'],
			['Drygore rapier', 'Offhand drygore rapier']
		]
	},
	{
		id: 4,
		name: 'Receive a Moktang pet, dye or frame',
		oneOf: resolveItems(['Mini moktang', 'Volcanic dye', 'Igne gear frame'])
	},
	{
		id: 5,
		name: 'Receive a Vasa Magus pet, jar or robes',
		oneOf: resolveItems(['Jar of magic', 'Tattered robes of Vasa', 'Voidling'])
	},
	{
		id: 6,
		name: 'Create any spirit shield from scratch',
		oneOf: [
			['Holy elixir', 'Spirit shield', 'Spectral sigil', 'Spectral spirit shield'],
			['Holy elixir', 'Spirit shield', 'Arcane sigil', 'Arcane spirit shield'],
			['Holy elixir', 'Spirit shield', 'Elysian sigil', 'Elysian spirit shield'],
			['Holy elixir', 'Spirit shield', 'Divine sigil', 'Divine spirit shield']
		]
	},
	// Row 2
	{
		id: 7,
		name: 'Receive any weapon from revs',
		oneOf: resolveItems([
			'Amulet of avarice',
			"Craw's bow (u)",
			"Thammaron's sceptre (u)",
			"Viggora's chainmace (u)"
		])
	},
	{
		id: 8,
		name: 'Receive any TOB unique',
		oneOf: [
			'Scythe of vitur (uncharged)',
			'Ghrazi rapier',
			'Sanguinesti staff (uncharged)',
			'Justiciar faceguard',
			'Justiciar chestguard',
			'Justiciar legguards',
			'Avernic defender hilt'
		]
	},
	{
		id: 9,
		name: 'Receive any COX unique (excluding scrolls)',
		oneOf: resolveItems([
			'Takon',
			'Steve',
			'Olmlet',
			'Twisted bow',
			'Elder maul',
			'Kodai insignia',
			'Dragon claws',
			'Ancestral hat',
			'Ancestral robe top',
			'Ancestral robe bottom',
			"Dinh's bulwark",
			'Dragon hunter crossbow',
			'Twisted buckler'
		])
	},
	{
		id: 10,
		name: 'Receive any Ignecarus unique',
		oneOf: ['Ignis ring', 'Ignecarus dragonclaw', 'Dragon egg']
	},
	{
		id: 11,
		name: 'Receive any Malygos unique',
		oneOf: ['Abyssal cape', 'Abyssal thread', 'Ori']
	},
	{
		id: 12,
		name: 'Receive 75 Athelas seeds',
		receiveBank: new Bank().add('Athelas seed', 75)
	},
	// Row 3
	{
		id: 13,
		name: 'Receive all Polypore dungeon uniques',
		allOf: [
			'Mycelium visor web',
			'Morchella mushroom spore',
			'Mycelium leggings web',
			'Ganodermic gloves',
			'Ganodermic boots',
			'Tombshroom spore',
			'Mycelium poncho web',
			'Grifolic gloves',
			'Grifolic orb'
		]
	},
	{
		id: 14,
		name: 'Receive all GWD uniques (excluding pets)',
		allOf: [
			'Godsword shard 1',
			'Godsword shard 2',
			'Godsword shard 3',

			'Armadyl crossbow',
			'Saradomin hilt',
			'Saradomin sword',
			"Saradomin's light",

			'Bandos chestplate',
			'Bandos tassets',
			'Bandos boots',
			'Bandos hilt',

			'Armadyl helmet',
			'Armadyl chestplate',
			'Armadyl chainskirt',
			'Armadyl hilt',

			'Staff of the dead',
			'Zamorakian spear',
			'Steam battlestaff',
			'Zamorak hilt'
		]
	},
	{
		id: 15,
		name: 'Receive any Naxxus unique',
		oneOf: ['Dark crystal', 'Abyssal gem', 'Tattered tome', 'Spellbound ring']
	},
	{
		id: 16,
		name: 'Receive all 3 Dagannoth Kings pets',
		allOf: ['Pet dagannoth prime', 'Pet dagannoth supreme', 'Pet dagannoth rex']
	},
	{
		id: 17,
		name: 'Receive 3 unique nex armor pieces for a certain armor slot',
		oneOf: [
			['Torva full helm (broken)', 'Pernix cowl (broken)', 'Virtus mask (broken)'],
			['Torva platebody (broken)', 'Pernix body (broken)', 'Virtus robe top (broken)'],
			['Torva platelegs (broken)', 'Pernix chaps (broken)', 'Virtus robe legs (broken)'],
			['Torva boots (broken)', 'Pernix boots (broken)', 'Virtus boots (broken)'],
			['Torva gloves (broken)', 'Pernix gloves (broken)', 'Virtus gloves (broken)']
		]
	},
	{
		id: 18,
		name: 'Receive any Nihiliz unique',
		oneOf: ['Nihil horn', 'Zaryte vambraces', 'Nexling']
	},
	// Row 4
	{
		id: 19,
		name: 'Receive all Tangleroot variants from Treebeard',
		oneOf: TanglerootTable.allItems
	},
	{
		id: 20,
		name: 'Receive 5 Gorajan shards',
		receiveBank: new Bank().add('Gorajan shards', 5)
	},
	{
		id: 21,
		name: 'Receive a unique from Baxtorian Bathhouses',
		oneOf: ['Phoenix eggling', 'Inferno adze', 'Flame gloves', 'Ring of fire']
	},
	{
		id: 22,
		name: 'Receive a statue, egg or banana from Monkey Rumble',
		oneOf: resolveItems(['Marimbo statue', 'Monkey egg', 'Big banana'])
	},
	{
		id: 23,
		name: 'Receive 50x Korulsi seeds',
		receiveBank: new Bank().add('Korulsi seed', 50)
	},
	{
		id: 24,
		name: 'Receive a Royal dragon kiteshield from QBD',
		allOf: ['Royal dragon kiteshield']
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
		 '', '', '', '', '', ''];
	assert(bingoTable.length === bingoTiles.length);

	for (let i = 0; i < bingoTiles.length; i++) {
		const tile = bingoTiles[i];

		let completed = false;
		if ('oneOf' in tile) {
			completed = tile.oneOf.some(id => cl.has(id));
		} else if ('allOf' in tile) {
			completed = tile.allOf.every(id => cl.has(id));
		} else if ('receiveBank' in tile) {
			completed = cl.has(tile.receiveBank);
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
	sendToChannelID(BINGO_CONFIG.notificationsChannelID, {
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

interface ParsedBingoTeam {
	id: number;
	users: string[];
}
async function fetchAndParseAllBingoTeams(): Promise<ParsedBingoTeam[]> {
	const teams = await prisma.bingoTeam.findMany();
	return teams.map(i => ({
		id: i.id,
		users: i.users
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

export const buyBingoTicketButton = new ButtonBuilder()
	.setCustomId('BUY_BINGO_TICKET')
	.setLabel(`Buy Bingo Ticket (${toKMB(BINGO_CONFIG.ticketPrice)})`)
	.setEmoji('739459924693614653')
	.setStyle(ButtonStyle.Secondary);

export async function countTotalGPInPrizePool() {
	const sum = await prisma.user.aggregate({
		_sum: {
			bingo_gp_contributed: true
		}
	});
	return Number(sum._sum.bingo_gp_contributed);
}
