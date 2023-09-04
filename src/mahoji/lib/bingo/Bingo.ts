import { type Bingo, Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { chunk } from 'e';
import { groupBy } from 'lodash';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { prisma } from '../../../lib/settings/prisma';
import { ItemBank } from '../../../lib/types';
import { addBanks } from '../../../lib/util/smallUtils';
import { generateTileName, StoredBingoTile, UniversalBingoTile } from './bingoUtil';
import { globalBingoTiles } from './globalTiles';

class BingoManager {
	public id: number;
	public organizers: string[];
	public start_date: Date;
	public durationInDays: number;
	public teamSize: number;
	public title: string;
	public notificationsChannelID: string;
	public ticketPrice: number;
	private rawBingoTiles: StoredBingoTile[];
	public bingoTiles: UniversalBingoTile[];

	constructor(options: Bingo) {
		this.ticketPrice = Number(options.ticket_price);
		this.id = options.id;
		this.start_date = options.start_date;
		this.teamSize = options.teamSize;
		this.organizers = options.organizers;
		this.title = options.title;
		this.notificationsChannelID = options.notifications_channel_id;
		this.durationInDays = options.duration_days;
		this.rawBingoTiles = options.bingo_tiles as StoredBingoTile[];

		this.bingoTiles = this.rawBingoTiles.map(tile => {
			if (typeof tile === 'number') {
				return globalBingoTiles.find(t => t.id === tile)!;
			}
			return {
				name: generateTileName(tile),
				...tile
			};
		});
		this.bingoTiles[0].name;
	}

	getButton() {
		return new ButtonBuilder()
			.setCustomId(`BUY_BINGO_TICKET_${this.id}`)
			.setLabel(`Buy Bingo Ticket (${toKMB(this.ticketPrice)})`)
			.setEmoji('739459924693614653')
			.setStyle(ButtonStyle.Secondary);
	}

	determineProgressOfBank(_cl: ItemBank | Prisma.JsonValue | Bank) {
		const cl: Bank = _cl instanceof Bank ? _cl : new Bank(_cl as ItemBank);
		let tilesCompletedCount = 0;
		// const tilesCompleted: number[] = [];

		const bingoTable = this.bingoTiles.map(() => '');

		for (let i = 0; i < this.bingoTiles.length; i++) {
			const tile = this.bingoTiles[i];

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
				// tilesCompleted.push(tile.id);
			}
			bingoTable[i] = completed ? '✅' : '🛑';
		}

		return {
			tilesCompletedCount,
			bingoTable,
			bingoTableStr: chunk(bingoTable, 6)
				.map(row => `${row.join(' ')}`)
				.join('\n')
			// tilesCompleted
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
				}
			}
		});
		return Number(sum._sum.tickets_bought) * this.ticketPrice;
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

		const teams = Object.entries(groupBy(rawBingo.bingo_participant, i => i.bingo_team_id));

		return {
			users: rawBingo?.bingo_participant
				.map(participant => ({
					id: participant.user_id,
					...this.determineProgressOfBank(participant.cl as ItemBank)
				}))
				.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount),
			teams: teams.map(([id, participants]) => ({
				team_id: Number(id),
				...this.determineProgressOfBank(addBanks(participants.map(i => i.cl) as ItemBank[]))
			}))
		};
	}

	async fetchLeaderboard() {
		const participants = await this.fetchAllParticipants();
		return `Bingo Leaderboard
${participants
	.slice(0, 10)
	.map((i, index) => `${++index}. <@${i.id}> - ${i.tilesCompletedCount} tiles`)
	.join('\n')}`;
	}
}
