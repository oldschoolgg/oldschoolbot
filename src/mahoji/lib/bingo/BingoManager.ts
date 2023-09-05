import { type Bingo, Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonStyle, userMention } from 'discord.js';
import { chunk, noOp, Time } from 'e';
import { groupBy } from 'lodash';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { prisma } from '../../../lib/settings/prisma';
import { ItemBank } from '../../../lib/types';
import { addBanks } from '../../../lib/util/smallUtils';
import { sendToChannelID } from '../../../lib/util/webhook';
import { generateTileName, rowsForSquare, StoredBingoTile, UniversalBingoTile } from './bingoUtil';
import { globalBingoTiles } from './globalTiles';

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
	private rawBingoTiles: StoredBingoTile[];
	public bingoTiles: UniversalBingoTile[];
	public creatorID: string;
	wasFinalized: boolean;

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
		this.rawBingoTiles = options.bingo_tiles as StoredBingoTile[];
		this.creatorID = options.creator_id;
		this.wasFinalized = options.was_finalized;

		this.bingoTiles = this.rawBingoTiles.map(tile => {
			if (typeof tile === 'number') {
				return globalBingoTiles.find(t => t.id === tile)!;
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
			bingoTableStr: chunk(bingoTable, rowsForSquare(this.bingoTiles.length))
				.map(row => `${row.join(' ')}`)
				.join('\n'),
			tilesCompleted,
			tilesNotCompleted
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
			teams: teams
				.map(([id, participants]) => ({
					team_id: Number(id),
					...this.determineProgressOfBank(addBanks(participants.map(i => i.cl) as ItemBank[])),
					participants
				}))
				.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount)
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
		const before = this.determineProgressOfBank(bingoParticipant.cl);
		const newCL = addBanks([bingoParticipant.cl as ItemBank, itemsAdded.bank]);
		await prisma.bingoParticipant.update({
			where: {
				user_id_bingo_id: {
					user_id: userID,
					bingo_id: this.id
				}
			},
			data: {
				cl: newCL.bank
			}
		});
		const after = this.determineProgressOfBank(newCL);

		for (const tile of before.tilesNotCompleted) {
			const wasCompleted = before.tilesCompleted.some(t => t.name === tile.name);
			if (!wasCompleted) continue;
			sendToChannelID(this.notificationsChannelID, {
				content: `${userMention(userID)} just finished the '${tile.name}' tile in the ${
					this.title
				} Bingo! This is their ${after.tilesCompletedCount}/${this.bingoTiles.length} finished tile.`
			}).catch(noOp);
		}
	}
}
