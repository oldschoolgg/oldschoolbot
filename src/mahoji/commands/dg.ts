import { formatOrdinal } from '@oldschoolgg/toolkit';
import { reduceNumByPercent, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { setupParty } from '../../lib/party';
import {
	determineDgLevelForFloor,
	dungBuyables,
	isValidFloor,
	requiredSkills
} from '../../lib/skilling/skills/dung/dungData';
import {
	calcMaxFloorUserCanDo,
	calcUserGorajanShardChance,
	hasRequiredLevels,
	numberOfGorajanOutfitsEquipped
} from '../../lib/skilling/skills/dung/dungDbFunctions';
import { SkillsEnum } from '../../lib/skilling/types';
import { MakePartyOptions } from '../../lib/types';
import { DungeoneeringOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration, formatSkillRequirements, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { deferInteraction } from '../../lib/util/interactionReply';
import { OSBMahojiCommand } from '../lib/util';

// Max people in a party:
const maxTeamSize = 20;
// Limit party size boost to maxBoostSize * boostPerPlayer:
const maxBoostSize = 5;
const boostPerPlayer = 5;

async function startCommand(channelID: string, user: MUser, floor: string | undefined, solo: boolean | undefined) {
	const isSolo = Boolean(solo);

	let floorToDo = Boolean(floor) ? Number(floor) : calcMaxFloorUserCanDo(user);

	if (!isValidFloor(floorToDo)) {
		return "That's an invalid floor.";
	}

	if (determineDgLevelForFloor(floorToDo) > user.skillLevel(SkillsEnum.Dungeoneering)) {
		return `You need level ${determineDgLevelForFloor(floorToDo)} to do Floor ${floorToDo}.`;
	}

	const dungeonLength = Time.Minute * 5 * (floorToDo / 2);
	let quantity = Math.floor(calcMaxTripLength(user, 'Dungeoneering') / dungeonLength);
	let duration = quantity * dungeonLength;

	let message = `${user.usernameOrMention} has created a Dungeoneering party! Use the buttons below to join/leave.
**Floor:** ${floorToDo}
**Duration:** ${formatDuration(duration)}
**Min. Quantity:** ${quantity}
**Required Stats:** ${formatSkillRequirements(requiredSkills(floorToDo))}`;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 1,
		maxSize: maxTeamSize,
		ironmanAllowed: true,
		message,
		customDenier: async user => {
			if (!user.user.minion_hasBought) {
				return [true, "you don't have a minion."];
			}
			if (user.minionIsBusy) {
				return [true, 'your minion is busy.'];
			}

			const max = calcMaxFloorUserCanDo(user);
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

	const leaderCheck = await partyOptions.customDenier!(user);
	if (leaderCheck[0]) {
		return `You can't start a Dungeoneering party for Floor ${floorToDo} because ${leaderCheck[1]}`;
	}

	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'No channel found.';
	let users: MUser[] = [];
	if (!isSolo) {
		const usersWhoConfirmed = await setupParty(channel, user, partyOptions);
		users = usersWhoConfirmed.filter(u => !u.minionIsBusy);
	} else {
		users = [user];
	}

	const boosts = [];
	for (const user of users) {
		const check = await partyOptions.customDenier!(user);
		if (check[0]) {
			return `You can't start a Dungeoneering party because of ${user.usernameOrMention}: ${check[1]}`;
		}
		if (user.owns('Scroll of teleportation')) {
			let y = 15;
			if (user.hasEquippedOrInBank('Dungeoneering master cape')) {
				y += 10;
			} else if (
				user.hasEquippedOrInBank('Dungeoneering cape') ||
				user.hasEquippedOrInBank('Dungeoneering cape(t)')
			) {
				y += 5;
			}

			let x = y / users.length;

			duration = reduceNumByPercent(duration, x);
			boosts.push(`${x.toFixed(2)}% from ${user.usernameOrMention}`);
		}
		const numGora = numberOfGorajanOutfitsEquipped(user);
		if (numGora > 0) {
			let x = (numGora * 6) / users.length;
			duration = reduceNumByPercent(duration, x);
			boosts.push(`${x.toFixed(2)}% from ${user.usernameOrMention}'s Gorajan`);
		}
	}

	duration = reduceNumByPercent(duration, 20);

	if (users.length > 1) {
		const boostMultiplier = Math.min(users.length, maxBoostSize);
		duration = reduceNumByPercent(duration, boostMultiplier * boostPerPlayer);
		boosts.push(
			`${boostMultiplier * boostPerPlayer}% for having a team of ${
				users.length < maxBoostSize ? users.length : `${maxBoostSize}+`
			}`
		);
	}

	// Calculate new number of floors will be done now that it is about to start
	const perFloor = duration / quantity;
	quantity = Math.floor(calcMaxTripLength(user, 'Dungeoneering') / perFloor);
	duration = quantity * perFloor;

	let str = `${partyOptions.leader.usernameOrMention}'s dungeoneering party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to do ${quantity}x dungeons of the ${formatOrdinal(
		floorToDo
	)} floor. Each dungeon takes ${formatDuration(perFloor)} - the total trip will take ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	await addSubTaskToActivityTask<DungeoneeringOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Dungeoneering',
		leader: user.id,
		users: users.map(u => u.id),
		floor: floorToDo
	});

	return str;
}

async function buyCommand(user: MUser, name?: string, quantity?: number) {
	const buyable = dungBuyables.find(i => stringMatches(name, i.item.name));
	if (!buyable) {
		let msg = `${dungBuyables.map(i => `**${i.item.name}:** ${i.cost.toLocaleString()} tokens`).join('\n')}.`;
		if (name !== undefined) msg = `**That isn't a buyable item**. Here are the items you can buy:\n\n${msg}`;
		return msg;
	}

	if (!quantity) {
		quantity = 1;
	}

	const { item, cost } = buyable;
	const overallCost = cost * quantity;
	const balance = user.user.dungeoneering_tokens;
	if (balance < overallCost) {
		return `You don't have enough Dungeoneering tokens to buy the ${quantity}x ${
			item.name
		}. You need ${overallCost}, but you have only ${balance.toLocaleString()}.`;
	}

	await user.addItemsToBank({ items: { [item.id]: quantity }, collectionLog: true });
	await user.update({
		dungeoneering_tokens: {
			decrement: overallCost
		}
	});

	return `Successfully purchased ${quantity}x ${item.name} for ${overallCost} Dungeoneering tokens.`;
}

export const dgCommand: OSBMahojiCommand = {
	name: 'dg',
	description: 'The Dungeoneering skill.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Start a Dungeoneering trip.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'floor',
					description: 'The floor you want to do. (Optional, defaults to max)',
					autocomplete: async (_, user) => {
						const kUser = await mUserFetch(user.id);
						return [7, 6, 5, 4, 3, 2, 1]
							.filter(floor => hasRequiredLevels(kUser, floor))
							.map(i => ({ name: `Floor ${i}`, value: i.toString() }));
					},
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'solo',
					description: 'Do you want to solo? (Optional)',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'See your Dungeoneering stats.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Buy rewards with your Dungeoneering tokens.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to buy.',
					autocomplete: async value => {
						return dungBuyables
							.filter(i => (!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.item.name, value: i.item.name }));
					},
					required: false
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you wish to buy.',
					required: false,
					min_value: 1
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{
		start?: { floor?: string; solo?: boolean };
		buy?: { item?: string; quantity?: number };
		stats?: {};
	}>) => {
		if (interaction) await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		if (options.start) return startCommand(channelID, user, options.start.floor, options.start.solo);
		if (options.buy) return buyCommand(user, options.buy.item, options.buy.quantity);
		let str = `<:dungeoneeringToken:829004684685606912> **Dungeoneering Tokens:** ${user.user.dungeoneering_tokens.toLocaleString()}
**Max floor:** ${calcMaxFloorUserCanDo(user)}`;
		const { boosts } = calcUserGorajanShardChance(user);
		if (boosts.length > 0) {
			str += `\n**Gorajan shard boosts:** ${boosts.join(', ')}`;
		}
		return str;
	}
};
