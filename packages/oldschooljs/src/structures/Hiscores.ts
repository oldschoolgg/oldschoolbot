import fetch from 'node-fetch';

import { ACCOUNT_TYPES, Errors, hiscoreURLs } from '../constants';
import type { SkillsScore } from '../meta/types';
import { convertXPtoLVL, isValidUsername, resolvePlayerFromHiscores } from '../util/util';
import OSError from './OldSchoolJSError';
import Player from './Player';

export interface GetOptions {
	type?: keyof typeof hiscoreURLs;
	virtualLevels?: boolean;
}

const defaultGetOptions: GetOptions = {
	type: 'normal',
	virtualLevels: false
};

class Hiscores {
	public async fetch(
		username: string,
		options: GetOptions = { type: 'normal', virtualLevels: false }
	): Promise<Player> {
		const mergedOptions = { ...defaultGetOptions, ...options };
		const accountType = mergedOptions.type ?? 'normal';
		if (!isValidUsername(username)) throw new OSError(Errors.INVALID_USERNAME);
		if (!ACCOUNT_TYPES.includes(accountType)) {
			throw new OSError(Errors.INVALID_ACCOUNT_TYPE);
		}

		const data: Player = await fetch(hiscoreURLs[accountType] + username)
			.then(async (res): Promise<string> => {
				if (res.status === 404) throw new OSError(Errors.ACCOUNT_NOT_FOUND);
				if (!res.ok) throw new OSError(Errors.FAILED_REQUEST);
				const text = await res.text();
				// If the text response is HTML, it means the hiscores are down.
				if (text.trim().startsWith('<')) throw new OSError(Errors.FAILED_REQUEST);
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
}

export default new Hiscores();
