import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../constants';
import { effectiveMonsters } from '../minions/data/killableMonsters';
import { KillableMonster } from '../minions/types';
import { channelIsSendable, noOp } from '../util';

export interface lfgReturnMessageInterface {
	user: KlasaUser;
	hasPurple: boolean;
	lootedItems: Bank;
}

export function prepareLFGMessage(
	activityName: string,
	qty: number,
	channels: Record<string, string[]> | false | undefined
) {
	const toReturn: Record<string, string> = {};
	if (!channels) return toReturn;
	for (const channel of Object.keys(channels)) {
		toReturn[channel] = `LFG mass of ${qty}x ${activityName} has returned! Here are the spoils:\n\n`;
	}
	return toReturn;
}

export function addLFGLoot(
	lootString: Record<string, string>,
	isPurple: boolean,
	user: KlasaUser,
	readableList: string,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += `${isPurple ? Emoji.Purple : ''} **${
			channel[1].includes(user.id) ? user : user.username
		} received:** ||${readableList}||\n`;
	}
	return lootString;
}

export function addLFGText(
	lootString: Record<string, string>,
	text: string,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += text;
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

export function getMonster(monsterId: number): KillableMonster {
	return <KillableMonster>effectiveMonsters.find(m => m.id === monsterId);
}
