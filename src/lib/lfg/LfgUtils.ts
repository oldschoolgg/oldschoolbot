import { KlasaClient, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { Emoji } from '../constants';
import { effectiveMonsters, NightmareMonster } from '../minions/data/killableMonsters';
import { KillableMonster } from '../minions/types';
import { channelIsSendable, noOp } from '../util';
import BarbarianAssault from './activities/BarbarianAssault';
import ChambersOfXeric from './activities/ChambersOfXeric';
import Default from './activities/Default';
import Nightmare from './activities/Nightmare';
import SoulWars from './activities/SoulWars';
import { LfgQueueProperties } from './LfgInterface';

export const LFG_MIN_USERS = 2;
export const LFG_MAX_USERS = 50;

export const availableQueues: LfgQueueProperties[] = [
	{
		uniqueID: 1,
		name: Monsters.KrilTsutsaroth.name,
		aliases: Monsters.KrilTsutsaroth.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/2/2f/K%27ril_Tsutsaroth.png',
		monster: getMonster(Monsters.KrilTsutsaroth.id),
		minQueueSize: LFG_MIN_USERS,
		maxQueueSize: LFG_MAX_USERS,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 2,
		name: Monsters.GeneralGraardor.name,
		aliases: Monsters.GeneralGraardor.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/b/b8/General_Graardor.png',
		monster: getMonster(Monsters.GeneralGraardor.id),
		minQueueSize: LFG_MIN_USERS,
		maxQueueSize: LFG_MAX_USERS,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 3,
		name: Monsters.Kreearra.name,
		aliases: Monsters.Kreearra.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/f/fd/Kree%27arra.png',
		monster: getMonster(Monsters.Kreearra.id),
		minQueueSize: LFG_MIN_USERS,
		maxQueueSize: LFG_MAX_USERS,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 4,
		name: Monsters.CommanderZilyana.name,
		aliases: Monsters.CommanderZilyana.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/f/fb/Commander_Zilyana.png',
		monster: getMonster(Monsters.CommanderZilyana.id),
		minQueueSize: LFG_MIN_USERS,
		maxQueueSize: LFG_MAX_USERS,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 5,
		name: Monsters.CorporealBeast.name,
		aliases: Monsters.CorporealBeast.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/5/5c/Corporeal_Beast.png',
		monster: getMonster(Monsters.CorporealBeast.id),
		minQueueSize: LFG_MIN_USERS,
		maxQueueSize: LFG_MAX_USERS,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 6,
		name: NightmareMonster.name,
		aliases: NightmareMonster.aliases,
		lfgClass: new Nightmare(),
		thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
		monster: getMonster(NightmareMonster.id),
		minQueueSize: 2,
		maxQueueSize: 10,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 7,
		name: `${NightmareMonster.name} (Small)`,
		aliases: ['nightmare small'],
		lfgClass: new Nightmare(),
		thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
		monster: getMonster(NightmareMonster.id),
		minQueueSize: 2,
		maxQueueSize: 5,
		allowSolo: false,
		allowPrivate: false
	},
	{
		uniqueID: 8,
		name: 'The Chambers of Xeric',
		aliases: ['raids', 'chambers of xeric', 'the chambers of xeric', 'raid1', 'cox'],
		lfgClass: new ChambersOfXeric(),
		extraParams: { isChallengeMode: false },
		thumbnail: 'https://oldschool.runescape.wiki/images/0/04/Chambers_of_Xeric_logo.png?34a98',
		minQueueSize: 2,
		maxQueueSize: 15,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 9,
		name: 'The Chambers of Xeric (CM)',
		aliases: ['raids cm', 'chambers of xeric cm', 'the chambers of xeric cm', 'raid1 cm', 'cox cm'],
		lfgClass: new ChambersOfXeric(),
		extraParams: { isChallengeMode: true },
		thumbnail: 'https://imgur.com/Y3HroYR.png',
		minQueueSize: 2,
		maxQueueSize: 15,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 10,
		name: 'Soul Wars',
		aliases: ['sw'],
		lfgClass: new SoulWars(),
		thumbnail: 'https://imgur.com/zVtat82.png',
		minQueueSize: 2,
		maxQueueSize: 99,
		allowSolo: true,
		allowPrivate: true
	},
	{
		uniqueID: 11,
		name: 'Barbarian Assault',
		aliases: ['ba'],
		lfgClass: new BarbarianAssault(),
		thumbnail: 'https://imgur.com/QavlMiI.png',
		minQueueSize: 2,
		maxQueueSize: 4,
		allowSolo: true,
		allowPrivate: true
	}
];

export function prepareLFGMessage(
	activityName: string,
	qty: number,
	channels: Record<string, string[]> | false | undefined
) {
	const toReturn: Record<string, string> = {};
	if (!channels) return toReturn;
	for (const channel of Object.keys(channels)) {
		toReturn[channel] = `LFG activity of ${
			qty > 1 ? `${qty}x ` : ''
		}**${activityName}** has returned! Here are the spoils:\n\n`;
	}
	return toReturn;
}

export function addLFGLoot(
	lootString: Record<string, string>,
	emoji: Emoji | false,
	user: KlasaUser,
	readableList: string,
	spoiler: boolean,
	channels: Record<string, string[]> | false | undefined
) {
	const spoilerTags = spoiler ? '||' : '';
	if (!channels) return lootString;
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += `${emoji ? emoji : ''} **${
			channel[1].includes(user.id) ? user : user.username
		} received:** ${spoilerTags}${readableList}${spoilerTags}\n`;
	}
	return lootString;
}

export function addLFGText(
	lootString: Record<string, string>,
	text: string | string[],
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	if (Array.isArray(text)) {
		text = text.join('\n');
	}
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += `\n${text}`;
	}
	return lootString;
}

export async function addLFGNoDrops(
	lootString: Record<string, string>,
	client: KlasaClient,
	users: string[],
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	const klasaUsers: KlasaUser[] = [];
	for (const u of users) {
		const _u = await client.users.fetch(u).catch(noOp);
		if (_u) klasaUsers.push(_u);
	}
	for (const channel of Object.entries(channels)) {
		const users = klasaUsers.map(user => (channel[1].includes(user.id) ? `<@${user.id}>` : user.username));
		if (users.length > 0) {
			lootString[channel[0]] += `${users.join(', ')} - Got no loot, sad!`;
		}
	}
	return lootString;
}

export async function sendLFGMessages(
	lootString: Record<string, string>,
	client: KlasaClient,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return false;
	for (const _channel of Object.keys(channels)) {
		const channel = client.channels.cache.get(_channel);
		if (channelIsSendable(channel)) {
			await channel.send(lootString[_channel]);
		}
	}
	return lootString;
}

export async function sendLFGErrorMessage(
	message: string,
	client: KlasaClient,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return false;
	for (const _channel of Object.keys(channels)) {
		const channel = client.channels.cache.get(_channel);
		if (channelIsSendable(channel)) {
			await channel.send(message);
		}
	}
}

export function getMonster(monsterId: number): KillableMonster {
	return <KillableMonster>effectiveMonsters.find(m => m.id === monsterId);
}
