import type { Bingo, Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonStyle, userMention } from 'discord.js';
import { Time, chunk, noOp } from 'e';
import groupBy from 'lodash/groupBy';
import { Bank, addBanks } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';
import * as ss from 'simple-statistics';

import { Emoji } from '../../../lib/constants';
import type { ItemBank } from '../../../lib/types';
import getOSItem from '../../../lib/util/getOSItem';
import { sendToChannelID } from '../../../lib/util/webhook';
import type { StoredBingoTile, UniversalBingoTile } from './bingoUtil';
import { generateTileName, isGlobalTile, rowsForSquare } from './bingoUtil';
import { globalBingoTiles } from './globalTiles';

export const BingoTrophies = [
	{
		item: getOSItem('Comp. dragon trophy'),
		percentile: 5,
		guaranteedAt: 25,
		emoji: Emoji.DragonTrophy
	},
	{
		item: getOSItem('Comp. rune trophy'),
		percentile: 10,
		guaranteedAt: 21,
		emoji: Emoji.RuneTrophy
	},
	{
		item: getOSItem('Comp. adamant trophy'),
		percentile: 20,
		guaranteedAt: 16,
		emoji: Emoji.AdamantTrophy
	},
	{
		item: getOSItem('Comp. mithril trophy'),
		percentile: 40,
		guaranteedAt: 12,
		emoji: Emoji.MithrilTrophy
	},
	{
		item: getOSItem('Comp. steel trophy'),
		percentile: 50,
		guaranteedAt: 8,
		emoji: Emoji.SteelTrophy
	},
	{
		item: getOSItem('Comp. iron trophy'),
		percentile: 75,
		guaranteedAt: 5,
		emoji: Emoji.IronTrophy
	},
	{
		item: getOSItem('Comp. bronze trophy'),
		percentile: 90,
		guaranteedAt: 1,
		emoji: Emoji.BronzeTrophy
	}
] as const;

export class BingoManager {
	public id: number;
	public organizers: string[];
	public startDate: Date;
	public endDate: Date;
	public durationInDays: number;
	public teamSize: number;
	public title: string;
	public notificationsChannelID: string;
	public ticketPrice: number;
	public rawBingoTiles: StoredBingoTile[];
	public bingoTiles: UniversalBingoTile[];
	public creatorID: string;
	wasFinalized: boolean;
	extraGP: number;
	isGlobal: boolean;
	trophiesApply: boolean;

	constructor(options: Bingo) {
		this.ticketPrice = Number(options.ticket_price);
		this.id = options.id;
		this.startDate = options.start_date;
		this.endDate = new Date(this.startDate.getTime() + options.duration_days * Time.Day);
		this.teamSize = options.team_size;
		this.organizers = options.organizers;
		this.title = options.title;
		this.notificationsChannelID = options.notifications_channel_id;
		this.durationInDays = options.duration_days;
		this.rawBingoTiles = options.bingo_tiles as unknown as StoredBingoTile[];
		this.creatorID = options.creator_id;
		this.wasFinalized = options.was_finalized;
		this.extraGP = Number(options.extra_gp);
		this.isGlobal = options.is_global;

		this.trophiesApply = options.trophies_apply;

		this.bingoTiles = this.rawBingoTiles.map(tile => {
			if (isGlobalTile(tile)) {
				return globalBingoTiles.find(t => t.id === tile.global)!;
			}
			return {
				name: generateTileName(tile),
				...tile
			};
		});
	}

	public isActive() {
		return (
			!this.wasFinalized &&
			this.bingoTiles.length > 0 &&
			this.startDate.getTime() < Date.now() &&
			this.endDate.getTime() > Date.now()
		);
	}

	getButton() {
		return new ButtonBuilder()
			.setCustomId(`BUY_BINGO_TICKET_${this.id}`)
			.setLabel(`Buy Bingo Ticket (${toKMB(this.ticketPrice)})`)
			.setEmoji('739459924693614653')
			.setStyle(ButtonStyle.Secondary);
	}

	async determineProgressOfUser(userID: string) {
		const bingoParticipant = await prisma.bingoParticipant.findFirst({
			where: {
				user_id: userID,
				bingo_id: this.id
			}
		});
		if (!bingoParticipant) return null;
		return this.determineProgressOfBank(bingoParticipant.cl as ItemBank);
	}

	async determineProgressOfTeam(teamID: number) {
		const bingoParticipant = await prisma.bingoTeam.findFirst({
			where: {
				id: teamID,
				bingo_id: this.id
			},
			include: {
				users: true
			}
		});
		if (!bingoParticipant) return null;
		const cl = addBanks(bingoParticipant.users.map(u => u.cl as ItemBank));
		return { ...this.determineProgressOfBank(cl), cl };
	}

	determineProgressOfBank(_cl: ItemBank | Prisma.JsonValue | Bank) {
		const cl: Bank = _cl instanceof Bank ? _cl : new Bank(_cl as ItemBank);
		let tilesCompletedCount = 0;
		const tilesCompleted: UniversalBingoTile[] = [];
		const tilesNotCompleted: UniversalBingoTile[] = [];

		const bingoTable = this.bingoTiles.map(() => '');

		for (let i = 0; i < this.bingoTiles.length; i++) {
			const tile = this.bingoTiles[i];

			let completed = false;
			if ('oneOf' in tile) {
				completed = tile.oneOf.some(id => cl.has([id]));
			} else if ('allOf' in tile) {
				completed = tile.allOf.every(id => cl.has(id));
			} else if ('bank' in tile) {
				completed = cl.has(tile.bank);
			} else {
				completed = tile.customReq(cl);
			}

			if (completed) {
				tilesCompletedCount++;
				tilesCompleted.push(tile);
			} else {
				tilesNotCompleted.push(tile);
			}
			bingoTable[i] = completed ? '✅' : '🛑';
		}

		return {
			tilesCompletedCount,
			bingoTable,
			bingoTableStr:
				this.bingoTiles.length === 0
					? 'No tiles.'
					: chunk(bingoTable, rowsForSquare(this.bingoTiles.length))
							.map(row => `${row.join(' ')}`)
							.join('\n'),
			tilesCompleted,
			tilesNotCompleted,
			tilesCompletedMap: new Set(tilesCompleted.map(t => t.name))
		};
	}

	async countTotalGPInPrizePool() {
		const sum = await prisma.bingoParticipant.aggregate({
			_sum: {
				tickets_bought: true
			},
			where: {
				user: {
					minion_ironman: false
				},
				bingo_id: this.id
			}
		});
		let gpFromTickets = Number(sum._sum.tickets_bought) * this.ticketPrice;
		gpFromTickets += this.extraGP;
		return gpFromTickets;
	}

	async fetchAllParticipants() {
		const rawBingo = await prisma.bingo.findFirst({
			where: {
				id: this.id
			},
			include: {
				bingo_participant: {
					include: {
						user: {
							select: {
								id: true
							}
						}
					}
				}
			}
		});
		if (rawBingo === null) {
			throw new Error(`Couldn't find bingo with ID ${this.id}`);
		}

		const teams = Object.entries(groupBy(rawBingo.bingo_participant, i => i.bingo_team_id))
			.map(([id, participants]) => ({
				team_id: Number(id),
				...this.determineProgressOfBank(addBanks(participants.map(i => i.cl) as ItemBank[])),
				participants
			}))
			.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount);
		const tilesCompletedCounts = teams.map(t => t.tilesCompletedCount);

		return {
			users: rawBingo?.bingo_participant
				.map(participant => ({
					id: participant.user_id,
					...this.determineProgressOfBank(participant.cl as ItemBank)
				}))
				.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount),
			teams: teams.map((team, index) => ({
				...team,
				trophy: this.isGlobal
					? (BingoTrophies.filter(
							t =>
								index < 3 ||
								team.tilesCompletedCount >= t.guaranteedAt ||
								100 - t.percentile <=
									ss.quantileRank(tilesCompletedCounts, team.tilesCompletedCount) * 100
						)[0] ?? null)
					: null,
				rank: index + 1
			}))
		};
	}

	async fetchLeaderboard() {
		const { teams } = await this.fetchAllParticipants();
		return `${this.title} - Bingo Leaderboard
${teams
	.slice(0, 10)
	.map(
		(team, index) =>
			`${++index}. <@${team.participants.map(participant => userMention(participant.user_id))}> - ${
				team.tilesCompletedCount
			} tiles`
	)
	.join('\n')}`;
	}

	async findTeamWithUser(userID: string) {
		const { teams } = await this.fetchAllParticipants();
		const team = teams.find(t => t.participants.some(p => p.user_id === userID));
		return team;
	}

	async handleNewItems(userID: string, itemsAdded: Bank) {
		const bingoParticipant = await prisma.bingoParticipant.findFirst({
			where: {
				user_id: userID,
				bingo_id: this.id
			}
		});
		if (!bingoParticipant) return;
		const beforeTeamProgress = await this.determineProgressOfTeam(bingoParticipant.bingo_team_id);
		const beforeUserProgress = this.determineProgressOfBank(bingoParticipant.cl);
		const newCL = new Bank(bingoParticipant.cl as ItemBank).add(itemsAdded);
		await prisma.bingoParticipant.update({
			where: {
				user_id_bingo_id: {
					user_id: userID,
					bingo_id: this.id
				}
			},
			data: {
				cl: newCL.toJSON()
			}
		});
		const afterUserProgress = this.determineProgressOfBank(newCL);

		const newUserCompletedTiles = new Set(
			afterUserProgress.tilesCompleted
				.filter(t => !beforeUserProgress.tilesCompletedMap.has(t.name))
				.map(t => t.name)
		);

		if (newUserCompletedTiles.size === 0) return;

		const afterTeamProgress = await this.determineProgressOfTeam(bingoParticipant.bingo_team_id);

		if (!beforeTeamProgress || !afterTeamProgress) return;

		const newTeamCompletedTiles = new Set(
			afterTeamProgress.tilesCompleted
				.filter(t => !beforeTeamProgress.tilesCompletedMap.has(t.name))
				.map(t => t.name)
		);

		const finishedStr =
			newUserCompletedTiles.size === 1
				? `${Array.from(newUserCompletedTiles)[0]} tile`
				: `${Array.from(newUserCompletedTiles).join(', ')} tiles`;

		let str = '';
		if (newTeamCompletedTiles.size > 0) {
			str = `${userMention(userID)} just finished the ${finishedStr}, giving their team another tile finished!`;
			str += ` They have finished ${afterUserProgress.tilesCompletedCount}/${this.bingoTiles.length} tiles, their team has now finished ${afterTeamProgress.tilesCompletedCount}/${this.bingoTiles.length} tiles.`;
		} else {
			str = `${userMention(userID)} just finished the ${finishedStr}, but didn't get their team any new tiles!`;
			str += ` They have now finished ${afterUserProgress.tilesCompletedCount}/${this.bingoTiles.length} tiles.`;
		}

		sendToChannelID(this.notificationsChannelID, {
			content: str
		}).catch(noOp);
	}
}

export async function findBingosWithUserParticipating(userID: string) {
	const bingos = await prisma.bingo.findMany({
		where: {
			start_date: {
				lt: new Date()
			},
			bingo_participant: {
				some: {
					user_id: userID
				}
			}
		}
	});
	return bingos.map(i => new BingoManager(i));
}
