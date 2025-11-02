import { EmbedBuilder } from '@oldschoolgg/discord';
import { chunk } from 'remeda';

import type { PaginatedPages } from '@/lib/discord/PaginatedMessage.js';

const LB_PAGE_SIZE = 10;

function getPos(page: number, record: number) {
	return `${page * LB_PAGE_SIZE + 1 + record}. `;
}

export type LeaderboardUser<M extends object = {}> = { id: string; score: number; customName?: string } & M;

export async function doMenuWrapper<M extends object = {}>({
	users,
	title,
	ironmanOnly,
	formatter,
	render,
	interaction
}: {
	ironmanOnly: boolean;
	users: LeaderboardUser<M>[];
	title: string;
	interaction: MInteraction;
	formatter?: (val: number) => string;
	render?: (user: LeaderboardUser<M>, username: string) => string;
}) {
	const chunked = chunk(users, LB_PAGE_SIZE);
	const pages: PaginatedPages = [];
	for (let c = 0; c < chunked.length; c++) {
		const makePage = async () => {
			const chnk = chunked[c];
			const linesPromises = chnk.map(async (user, i) => {
				const username: string = user.customName ?? (await Cache.getBadgedUsername(user.id));
				const body = render
					? render(user, username)
					: `**${username}:** ${formatter ? formatter(user.score) : user.score.toLocaleString()}`;
				return `${getPos(c, i)}${body}`;
			});
			const pageText = (await Promise.all(linesPromises)).join('\n');
			return {
				embeds: [
					new EmbedBuilder()
						.setTitle(`${title}${ironmanOnly ? ' (Ironmen Only)' : ''}`)
						.setDescription(pageText)
				]
			};
		};
		pages.push(makePage);
	}
	if (pages.length === 0) return 'There are no users on this leaderboard.';
	return interaction.makePaginatedMessage({ pages });
}
