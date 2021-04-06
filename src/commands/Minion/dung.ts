import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { ActivityTaskOptions } from '../../lib/types/minions';
import {
	formatDuration,
	formatSkillRequirements,
	skillsMeetRequirements,
	stringMatches,
	toTitleCase
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';

export type DungeonSize = 'small' | 'medium' | 'large';
export type Floor = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export function isDgSize(str: string): str is DungeonSize {
	return ['small', 'medium', 'large'].includes(str);
}
export function isValidFloor(floor: number): floor is Floor {
	return [1, 2, 3, 4, 5, 6, 7].includes(floor);
}

export interface DungeoneeringOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	quantity: number;
	floor: number;
	size: DungeonSize;
}

const BarbBuyables = [
	{
		item: getOSItem('Fighter hat'),
		cost: 275 * 4
	}
];

// 1-7 floors
function determineFloor(level: number) {
	return Math.floor((level + 20) / 20);
}

function requiredLevel(floor: number) {
	return floor * 14;
}

function requiredSkills(floor: number) {
	const lvl = requiredLevel(floor);
	const nonCmbLvl = Math.floor(lvl / 1.5);
	return {
		attack: lvl,
		strength: lvl,
		defence: lvl,
		hitpoints: lvl,
		magic: lvl,
		ranged: lvl,
		herblore: nonCmbLvl,
		runecraft: nonCmbLvl,
		prayer: nonCmbLvl,
		fletching: nonCmbLvl,
		fishing: nonCmbLvl,
		cooking: nonCmbLvl,
		construction: nonCmbLvl,
		crafting: nonCmbLvl
	};
}

function hasRequiredLevels(user: KlasaUser, floor: number) {
	return skillsMeetRequirements(user.rawSkills, requiredSkills(floor));
}

function maxFloorUserCanDo(user: KlasaUser) {
	return determineFloor(user.skillLevel(SkillsEnum.Dungeoneering));
}

function sizeTime(size: DungeonSize) {
	switch (size) {
		case 'small':
			return 1;
		case 'medium':
			return 1.3;
		case 'large':
			return 1.6;
	}
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			subcommands: true,
			usage: '[start|buy] [floor:number{1,7}] [size:string{}]',
			usageDelim: ' ',
			aliases: ['dg']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.send(
			`<:dungeoneeringToken:829004684685606912> **Dungeoneering Tokens:** ${msg.author.settings.get(
				UserSettings.DungeoneeringTokens
			)}
**Max floor:** ${maxFloorUserCanDo(msg.author)}`
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = BarbBuyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.send(
				`Here are the items you can buy: \n\n${BarbBuyables.map(
					i => `**${i.item.name}:** ${i.cost} points`
				).join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.HonourPoints);
		if (balance < cost) {
			return msg.send(
				`You don't have enough Honour Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		await msg.author.settings.update(UserSettings.HonourPoints, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.send(`Successfully purchased 1x ${item.name} for ${cost} Honour Points.`);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage, [floor, _size]: [number | undefined, string | undefined]) {
		const minDgLevel = msg.flagArgs.min || 1;
		const floorToDo = floor || maxFloorUserCanDo(msg.author);
		const size = _size || 'medium';

		if (!isDgSize(size) || !isValidFloor(floorToDo)) {
			return msg.channel.send(`That's an invalid dungeon size, or invalid floor.`);
		}

		const dungeonLength = Time.Minute * 5 * (floorToDo / 2) * sizeTime(size);
		const quantity = Math.floor(
			msg.author.maxTripLength(Activity.Dungeoneering) / dungeonLength
		);
		const duration = quantity * dungeonLength;

		let message = `${
			msg.author.username
		} has created a Dungeoneering party! Anyone can click the ${
			Emoji.Join
		} reaction to join, click it again to leave.

**Floor:** ${floorToDo}
**Size:** ${toTitleCase(size)}
**Duration:** ${formatDuration(duration)}
**Quantity:** ${quantity}
**Required Stats:** ${formatSkillRequirements(requiredSkills(floorToDo))}`;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 12,
			ironmanAllowed: true,
			message,
			customDenier: user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				if (user.skillLevel(SkillsEnum.Dungeoneering) < minDgLevel) {
					return [true, 'your Dungeoneering level is too low for this party.'];
				}

				const max = maxFloorUserCanDo(user);
				if (max < floorToDo) {
					return [
						true,
						`this party is doing Floor ${floorToDo}, and your level is unsufficient to do this floor.`
					];
				}

				if (!hasRequiredLevels(user, floorToDo)) {
					return [
						true,
						`you don't have the required stats for this floor, you need: ${formatSkillRequirements(
							requiredSkills(floorToDo)
						)}`
					];
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const boosts = [1];

		let str = `${partyOptions.leader.username}'s dungeoneering party (${users
			.map(u => u.username)
			.join(', ')}) is now off to do ${quantity}x dungeons of the ${formatOrdinal(
			floorToDo
		)} floor. Each dungeon takes ${formatDuration(
			dungeonLength
		)} - the total trip will take ${formatDuration(duration)}.`;

		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;

		await addSubTaskToActivityTask<DungeoneeringOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Dungeoneering,
			leader: msg.author.id,
			users: users.map(u => u.id),
			size,
			floor: floorToDo
		});

		return msg.channel.send(str, {
			split: true
		});
	}
}
