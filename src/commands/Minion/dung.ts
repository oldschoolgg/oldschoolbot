import { increaseNumByPercent, reduceNumByPercent } from 'e';
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
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';
import itemID from '../../lib/util/itemID';
import { numberOfGorajanOutfitsEquipped } from '../../tasks/minions/dungeoneeringActivity';

export type Floor = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isValidFloor(floor: number): floor is Floor {
	return [1, 2, 3, 4, 5, 6, 7].includes(floor);
}

export interface DungeoneeringOptions extends ActivityTaskOptions {
	leader: string;
	users: string[];
	quantity: number;
	floor: number;
}

const dungBuyables = [
	{
		item: getOSItem('Chaotic rapier'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic longsword'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic maul'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic staff'),
		cost: 200_000
	},
	{
		item: getOSItem('Chaotic crossbow'),
		cost: 200_000
	},
	{
		item: getOSItem('Offhand Chaotic rapier'),
		cost: 100_000
	},
	{
		item: getOSItem('Offhand Chaotic longsword'),
		cost: 100_000
	},
	{
		item: getOSItem('Offhand Chaotic crossbow'),
		cost: 100_000
	},
	{
		item: getOSItem('Farseer kiteshield'),
		cost: 200_000
	},
	{
		item: getOSItem('Scroll of life'),
		cost: 400_000
	},
	{
		item: getOSItem('Herbicide'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of efficiency'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of cleansing'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of dexterity'),
		cost: 400_000
	},
	{
		item: getOSItem('Scroll of teleportation'),
		cost: 400_000
	},
	{
		item: getOSItem('Amulet of zealots'),
		cost: 400_000
	},
	{
		item: getOSItem('Frosty'),
		cost: 2_000_000
	},
	{
		item: getOSItem('Chaotic remnant'),
		cost: 500_000
	}
];

function determineDgLevelForFloor(floor: number) {
	return Math.floor(floor * 20 - 20);
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
		crafting: nonCmbLvl,
		dungeoneering: determineDgLevelForFloor(floor)
	};
}

function hasRequiredLevels(user: KlasaUser, floor: number) {
	return skillsMeetRequirements(user.rawSkills, requiredSkills(floor));
}

export function maxFloorUserCanDo(user: KlasaUser) {
	return [7, 6, 5, 4, 3, 2, 1].find(floor => hasRequiredLevels(user, floor)) || 1;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			subcommands: true,
			usage: '[start|buy] [floor:number{1,7}|name:...string]',
			usageDelim: ' ',
			aliases: ['dg']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		return msg.send(
			`<:dungeoneeringToken:829004684685606912> **Dungeoneering Tokens:** ${msg.author.settings
				.get(UserSettings.DungeoneeringTokens)
				.toLocaleString()}
**Max floor:** ${maxFloorUserCanDo(msg.author)}`
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		if (typeof input === 'number') input = '';
		const buyable = dungBuyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.send(
				`That isn't a buyable item. Here are the items you can buy: \n\n${dungBuyables
					.map(i => `**${i.item.name}:** ${i.cost.toLocaleString()} tokens`)
					.join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.DungeoneeringTokens);
		if (balance < cost) {
			return msg.send(
				`You don't have enough Dungeoneering tokens to buy the ${
					item.name
				}. You need ${cost.toLocaleString()}, but you have only ${balance.toLocaleString()}.`
			);
		}

		await msg.author.settings.update(UserSettings.DungeoneeringTokens, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.send(
			`Successfully purchased 1x ${
				item.name
			} for ${cost.toLocaleString()} Dungeoneering tokens.`
		);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage, [floor]: [number | undefined]) {
		const floorToDo = floor || maxFloorUserCanDo(msg.author);

		if (!isValidFloor(floorToDo)) {
			return msg.channel.send(`That's an invalid floor.`);
		}

		if (determineDgLevelForFloor(floorToDo) > msg.author.skillLevel(SkillsEnum.Dungeoneering)) {
			return msg.channel.send(
				`You need level ${determineDgLevelForFloor(floorToDo)} to do Floor ${floorToDo}.`
			);
		}

		const dungeonLength = Time.Minute * 5 * (floorToDo / 2) * 1;
		const quantity = Math.floor(
			msg.author.maxTripLength(Activity.Dungeoneering) / dungeonLength
		);
		let duration = quantity * dungeonLength;

		let message = `${
			msg.author.username
		} has created a Dungeoneering party! Anyone can click the ${
			Emoji.Join
		} reaction to join, click it again to leave.

**Floor:** ${floorToDo}
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

				const max = maxFloorUserCanDo(user);
				if (max < floorToDo) {
					return [
						true,
						`this party is doing Floor ${floorToDo}, you can't do this floor because you need level ${determineDgLevelForFloor(
							floorToDo
						)} Dungeoneering.`
					];
				}

				if (!hasRequiredLevels(user, floorToDo)) {
					return [
						true,
						`you don't have the required stats for this floor, you need: ${formatSkillRequirements(
							requiredSkills(floorToDo)
						)}.`
					];
				}

				return [false];
			}
		};

		const leaderCheck = partyOptions.customDenier!(msg.author);
		if (leaderCheck[0]) {
			return msg.channel.send(
				`You can't start a Dungeoneering party for Floor ${floorToDo} because ${leaderCheck[1]}`
			);
		}

		const users = await msg.makePartyAwaiter(partyOptions);
		const boosts = [];
		for (const user of users) {
			const check = partyOptions.customDenier!(user);
			if (check[0]) {
				return msg.channel.send(
					`You can't start a Dungeoneering party because of ${user.username}: ${check[1]}`
				);
			}
			if (await user.hasItem(itemID('Scroll of teleportation'))) {
				let y = 15;
				if (user.hasItemEquippedOrInBank('Dungeoneering master cape')) {
					y += 10;
				} else if (
					user.hasItemEquippedOrInBank('Dungeoneering cape') ||
					user.hasItemEquippedOrInBank('Dungeoneering cape(t)')
				) {
					y += 5;
				}

				let x = y / users.length;

				duration = reduceNumByPercent(duration, x);
				boosts.push(`${x.toFixed(2)}% from ${user.username}`);
			}
			const numGora = numberOfGorajanOutfitsEquipped(user);
			if (numGora > 0) {
				let x = (numGora * 6) / users.length;
				duration = reduceNumByPercent(duration, x);
				boosts.push(`${x.toFixed(2)}% from ${user.username}'s Gorajan`);
			}
		}

		duration = reduceNumByPercent(duration, 20);
		boosts.push(`20% release boost`);

		if (users.length === 1) {
			duration = increaseNumByPercent(duration, 40);
			boosts.push(`-40% for not having a team`);
		} else if (users.length === 2) {
			duration = increaseNumByPercent(duration, 15);
			boosts.push(`-15% for having a small team`);
		}

		let str = `${partyOptions.leader.username}'s dungeoneering party (${users
			.map(u => u.username)
			.join(', ')}) is now off to do ${quantity}x dungeons of the ${formatOrdinal(
			floorToDo
		)} floor. Each dungeon takes ${formatDuration(
			dungeonLength
		)} - the total trip will take ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		await addSubTaskToActivityTask<DungeoneeringOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Dungeoneering,
			leader: msg.author.id,
			users: users.map(u => u.id),
			floor: floorToDo
		});

		return msg.channel.send(str, {
			split: true
		});
	}
}
