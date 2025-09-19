import fetch from 'node-fetch';

import { convertXPtoLVL } from '../util/util.js';
import { Player, type SkillsScore } from './Player.js';
import { BASE_API_URL, CLUES, Errors, SKILLS } from './constants.js';
import { ACCOUNT_TYPES, type AccountType, MINIGAMES, mappedBossNames } from './constants.js';

function resolvePlayerFromHiscores(csvData: string, accountType: AccountType): Player {
	const data: string[][] = csvData
		.trim()
		.split('\n')
		.map((str): string[] => str.split(','));

	const resolvedPlayer: any = {
		skills: {},
		minigames: {},
		clues: {},
		bossRecords: {}
	};

	let accumulativeIndex = 0;

	for (let i = 0; i < SKILLS.length; i++) {
		resolvedPlayer.skills[SKILLS[i]] = {
			rank: Number(data[i][0]),
			level: Number(data[i][1]),
			xp: Number(data[i][2])
		};
	}

	if (accountType === 'seasonal') {
		resolvedPlayer.leaguePoints = {
			rank: Number(data[accumulativeIndex + SKILLS.length][0]),
			points: Number(data[accumulativeIndex + SKILLS.length][1])
		};
	}

	accumulativeIndex += SKILLS.length + 2;

	for (let i = 0; i < 4; i++) {
		resolvedPlayer.minigames[MINIGAMES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += 4;

	for (let i = 0; i < CLUES.length; i++) {
		resolvedPlayer.clues[CLUES[i]] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	accumulativeIndex += CLUES.length;

	for (let i = 0; i < 5; i++) {
		const minigameKey = MINIGAMES[i + 4];
		const minigameData = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
		resolvedPlayer.minigames[minigameKey] = minigameData;
	}

	accumulativeIndex += 5;

	for (let i = 0; i < mappedBossNames.length; i++) {
		if (!data[i + accumulativeIndex]) continue;
		const bossName = mappedBossNames[i][0];
		resolvedPlayer.bossRecords[bossName] = {
			rank: Number(data[i + accumulativeIndex][0]),
			score: Number(data[i + accumulativeIndex][1])
		};
	}

	return resolvedPlayer;
}

export interface GetOptions {
	type?: keyof typeof hiscoreURLs;
	virtualLevels?: boolean;
}

function hiscoreURL(type: string): string {
	return `${BASE_API_URL}/m=${type}/index_lite.ws?player=`;
}

export const hiscoreURLs: Record<AccountType, string> = {
	normal: hiscoreURL('hiscore_oldschool'),
	ironman: hiscoreURL('hiscore_oldschool_ironman'),
	ultimate: hiscoreURL('hiscore_oldschool_ultimate'),
	hardcore: hiscoreURL('hiscore_oldschool_hardcore_ironman'),
	deadman: hiscoreURL('hiscore_oldschool_deadman'),
	seasonal: hiscoreURL('hiscore_oldschool_seasonal'),
	tournament: hiscoreURL('hiscore_oldschool_tournament'),
	skiller: hiscoreURL('hiscore_oldschool_skiller'),
	skiller_defence: hiscoreURL('hiscore_oldschool_skiller_defence')
} as const;

const defaultGetOptions: GetOptions = {
	type: 'normal',
	virtualLevels: false
};

/**
 * Determines whether a string is a valid RuneScape username.
 * @param username The username to check.
 */
function isValidUsername(username: string): boolean {
	return Boolean(username.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$'));
}

export const Hiscores = {
	async fetch(username: string, options: GetOptions = { type: 'normal', virtualLevels: false }): Promise<Player> {
		const mergedOptions = { ...defaultGetOptions, ...options };
		const accountType = mergedOptions.type ?? 'normal';
		if (!isValidUsername(username)) throw new Error(Errors.INVALID_USERNAME);
		if (!ACCOUNT_TYPES.includes(accountType)) {
			throw new Error(Errors.INVALID_ACCOUNT_TYPE);
		}

		const data: Player = await fetch(hiscoreURLs[accountType] + username)
			.then(async (res): Promise<string> => {
				if (res.status === 404) throw new Error(Errors.ACCOUNT_NOT_FOUND);
				if (!res.ok) throw new Error(Errors.FAILED_REQUEST);
				const text = await res.text();
				// If the text response is HTML, it means the hiscores are down.
				if (text.trim().startsWith('<')) throw new Error(Errors.FAILED_REQUEST);
				return text;
			})
			.then(p => resolvePlayerFromHiscores(p, accountType))
			.catch((err): never => {
				throw err;
			});

		if (mergedOptions.virtualLevels) {
			let overall = 0;
			for (const skill in data.skills) {
				if (skill === 'overall') continue;
				const lvl = convertXPtoLVL(data.skills[skill as keyof SkillsScore].xp, 126);
				overall += lvl;
				data.skills[skill as keyof SkillsScore].level = lvl;
			}
			data.skills.overall.level = overall;
		}

		return new Player({
			username,
			type: options.type ?? 'normal',
			skills: data.skills,
			minigames: data.minigames,
			clues: data.clues,
			bossRecords: data.bossRecords,
			leaguePoints: data.leaguePoints
		});
	}
};
