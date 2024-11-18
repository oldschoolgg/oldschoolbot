import { toTitleCase } from '@oldschoolgg/toolkit/util';
import type { BaseMessageOptions } from 'discord.js';
import { escapeMarkdown, time } from 'discord.js';
import { Time } from 'e';
import { convertXPtoLVL } from 'oldschooljs/dist/util/util';
import { resolveItems } from 'oldschooljs/dist/util/util';

import { Emoji } from '../constants';
import type { SkillsEnum } from '../skilling/types';
import type { Peak } from './../tickers';

export function skillLevel(user: MUser, skill: SkillsEnum) {
	const xp = Number(user.user[`skills_${skill}`]);
	return convertXPtoLVL(xp);
}

export const bows = resolveItems([
	'Twisted bow',
	'Bow of faerdhinen (c)',
	'Bow of faerdhinen',
	'Crystal bow',
	'3rd age bow',
	'Dark bow',
	"Craw's bow",
	'Magic comp bow',
	'Magic longbow',
	'Magic shortbow (i)',
	'Magic shortbow',
	'Seercull',
	'Yew comp bow',
	'Yew longbow',
	'Yew shortbow',
	'Comp ogre bow',
	'Ogre bow',
	'Maple longbow',
	'Maple shortbow',
	'Willow comp bow',
	'Willow longbow',
	'Willow shortbow',
	'Oak longbow',
	'Oak shortbow'
]);

export const arrows = resolveItems([
	'Dragon arrow',
	'Amethyst arrow',
	'Rune arrow',
	'Adamant arrow',
	'Mithril arrow',
	'Steel arrow',
	'Iron arrow',
	'Bronze arrow'
]);

export const crossbows = resolveItems([
	'Bronze crossbow',
	'Iron crossbow',
	'Steel crossbow',
	'Mithril crossbow',
	'Adamant crossbow',
	'Rune crossbow',
	'Dragon crossbow',
	'Dragon hunter crossbow',
	'Armadyl crossbow',
	'Zaryte crossbow'
]);

export const bolts = resolveItems([
	'Ruby dragon bolts (e)',
	'Dragon bolts',
	'Runite bolts',
	'Adamant bolts',
	'Mithril bolts',
	'Steel bolts',
	'Iron bolts',
	'Bronze bolts'
]);

export function minionName(user: MUser) {
	let [name, isIronman, icon] = [user.user.minion_name, user.user.minion_ironman, user.user.minion_icon];

	const prefix = isIronman ? Emoji.Ironman : '';
	icon ??= Emoji.Minion;

	const strPrefix = prefix ? `${prefix} ` : '';

	return name ? `${strPrefix}${icon} **${escapeMarkdown(name)}**` : `${strPrefix}${icon} Your minion`;
}

export function checkPeakTimes(): BaseMessageOptions {
	const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
	let str = '';
	for (const peak of cachedPeakInterval) {
		str += `${Emoji.Stopwatch} **${toTitleCase(peak.peakTier)}** peak time: ${time(
			new Date(peak.startTime),
			'T'
		)} to ${time(new Date(peak.finishTime), 'T')} (**${Math.round(
			(peak.finishTime - peak.startTime) / Time.Hour
		)}** hour peak ${time(new Date(peak.startTime), 'R')})\n`;
	}

	return {
		content: str
	};
}
