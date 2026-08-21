import { BurningDominionTemplate } from '@/lib/bso/monsters/VerdantIsland.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import type { PlayerBoostInfo } from '@/lib/minions/functions/reducedTimeForGroup.js';
import reducedTimeForGroup from '@/lib/minions/functions/reducedTimeForGroup.js';
import findMonster from '@/lib/util/findMonster.js';
import { calculateSimpleMonsterDeathChance } from '@/lib/util/smallUtils.js';

function calcUserAffordableKills(u: MUser): number {
	const bank = u.bank;
	const brimstoneKills = Math.floor(bank.amount('Brimstone elixir') / 1.5);
	const brewKills = Math.floor((bank.amount('Enhanced saradomin brew') + bank.amount('Saradomin brew(4)')) / 3);
	const restoreKills = Math.floor(bank.amount('Enhanced super restore') + bank.amount('Super restore(4)'));
	const combatKills = Math.floor(bank.amount('Super combat potion(4)'));
	const stamKills = Math.floor(bank.amount('Enhanced stamina potion'));
	return Math.min(brimstoneKills, brewKills, restoreKills, combatKills, stamKills);
}

function buildUserCost(u: MUser, qty: number): Bank {
	const elixirAmount = Math.max(1, Math.ceil(qty * 1.5));
	const cost = new Bank()
		.add('Brimstone elixir', elixirAmount)
		.add('Super combat potion(4)', 1 * qty)
		.add('Enhanced stamina potion', 1 * qty);

	const bank = u.bank;

	let brewsNeeded = 3 * qty;
	const enhancedBrews = Math.min(bank.amount('Enhanced saradomin brew'), brewsNeeded);
	if (enhancedBrews > 0) {
		cost.add('Enhanced saradomin brew', enhancedBrews);
		brewsNeeded -= enhancedBrews;
	}
	if (brewsNeeded > 0) {
		cost.add('Saradomin brew(4)', brewsNeeded);
	}

	let restoresNeeded = 1 * qty;
	const enhancedRestores = Math.min(bank.amount('Enhanced super restore'), restoresNeeded);
	if (enhancedRestores > 0) {
		cost.add('Enhanced super restore', enhancedRestores);
		restoresNeeded -= enhancedRestores;
	}
	if (restoresNeeded > 0) {
		cost.add('Super restore(4)', restoresNeeded);
	}

	return cost;
}

async function checkBurningDominionUserReqs(u: MUser): Promise<[boolean, string?]> {
	if (!u.hasMinion) {
		return [false, "you don't have a minion."];
	}
	if (await u.minionIsBusy()) {
		return [false, 'your minion is busy.'];
	}
	if (u.QP < 2500) {
		return [false, 'you need at least 2,500 Quest Points.'];
	}
	const skills = u.skillsAsLevels;
	const skillReqs: Record<string, number> = {
		hitpoints: 120,
		attack: 115,
		strength: 115,
		defence: 115,
		magic: 115,
		ranged: 115,
		slayer: 115
	};
	for (const [skill, lvl] of Object.entries(skillReqs)) {
		if ((skills[skill as keyof typeof skills] ?? 1) < lvl) {
			return [false, `you need level ${lvl} in ${skill}.`];
		}
	}
	const tames = await u.fetchTames();
	const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
	if (!hasMaxedIgne) {
		return [false, 'you need to have a maxed Igne Tame (best gear, all fed items).'];
	}
	if (!u.gear.melee.hasEquipped('Dragonbane glaive')) {
		return [false, 'you need to have a Dragonbane glaive equipped in your melee setup.'];
	}
	if (!u.gear.melee.hasEquipped('Dragonbane aegis')) {
		return [false, 'you need to have a Dragonbane aegis equipped in your melee setup.'];
	}
	if (!u.hasEquippedOrInBank("Combatant's cape")) {
		return [false, "you need to have a Combatant's cape."];
	}

	const minSupplies = new Bank()
		.add('Brimstone elixir', 2)
		.add('Super combat potion(4)', 1)
		.add('Enhanced stamina potion', 1);

	const hasBrews =
		u.owns(new Bank().add('Enhanced saradomin brew', 3)) || u.owns(new Bank().add('Saradomin brew(4)', 3));
	const hasRestores =
		u.owns(new Bank().add('Enhanced super restore', 1)) || u.owns(new Bank().add('Super restore(4)', 1));

	if (!u.owns(minSupplies) || !hasBrews || !hasRestores) {
		return [
			false,
			'you need at least 2x Brimstone elixir, 3x Enhanced saradomin brew (or Saradomin brew(4)), 1x Enhanced super restore (or Super restore(4)), 1x Super combat potion(4), and 1x Enhanced stamina potion.'
		];
	}

	return [true];
}

function buildBoostEmbedFields(playerBoostInfos: PlayerBoostInfo[]) {
	return playerBoostInfos.map(player => {
		const header = `**+${player.totalPersonalPercent.toFixed(0)}% personal** (${player.teamMultiplier.toFixed(2)}x team)`;
		const boostLines =
			player.personalBoosts.length === 0
				? 'No personal boosts'
				: player.personalBoosts.map(b => `${b.name} (+${b.percent.toFixed(0)}%)`).join(', ');

		return {
			name: player.username,
			value: `${header}\n${boostLines}`,
			inline: true
		};
	});
}

export async function burningDominionCommand(
	interaction: MInteraction,
	user: MUser,
	channelId: string,
	_inputName: string,
	quantity: number | undefined
) {
	if (interaction) await interaction.defer();

	const [hasReqs, reason] = await checkBurningDominionUserReqs(user);
	if (!hasReqs) {
		return `You don't meet the requirements for Burning Dominion: ${reason}`;
	}

	const users: MUser[] = await globalClient.makeParty({
		interaction,
		leader: user,
		minSize: 2,
		maxSize: 10,
		ironmanAllowed: true,
		message: `${user.badgedUsername} is doing a Burning Dominion mass! Use the buttons below to join/leave.`,
		customDenier: async u => {
			const [pass, denyReason] = await checkBurningDominionUserReqs(u);
			if (!pass) {
				return [true, denyReason!];
			}
			return [false];
		}
	});

	const monster = findMonster('Burning Dominion') ?? (BurningDominionTemplate as any);
	const maxTripLength = await users[0].calcMaxTripLength('GroupMonsterKilling');
	const [perKillTime, _messages, playerBoostInfos] = await reducedTimeForGroup(users, monster);
	const maxTimeQty = Math.max(1, Math.floor(maxTripLength / perKillTime));
	const maxSuppliesQty = Math.min(...users.map(calcUserAffordableKills));

	const qty = quantity ?? Math.min(maxTimeQty, maxSuppliesQty);
	if (qty < 1) {
		const brokeUser = users.find(u => calcUserAffordableKills(u) < 1) ?? users[0];
		return `${brokeUser.usernameOrMention} doesn't have enough supplies for even 1 kill. Each player needs at least: 2x Brimstone elixir, 3x Enhanced saradomin brew (or Saradomin brew(4)), 1x Enhanced super restore (or Super restore(4)), 1x Super combat potion(4), and 1x Enhanced stamina potion.`;
	}

	if (quantity && quantity > maxSuppliesQty) {
		const brokeUser = users.find(u => calcUserAffordableKills(u) < quantity)!;
		return `${brokeUser.usernameOrMention} doesn't have enough supplies for ${quantity}x kills (they can only afford ${calcUserAffordableKills(brokeUser)}x kills).`;
	}

	if (quantity && quantity > maxTimeQty) {
		return `The max amount of ${monster.name} this party can kill in one trip is ${maxTimeQty}.`;
	}

	const duration = qty * perKillTime - monster.respawnTime!;

	const totalCost = new Bank();
	const bossUsers = await Promise.all(
		users.map(async u => {
			const currentKC = await u.getKC(BurningDominionTemplate.id);
			const deathChance = BurningDominionTemplate.deathProps
				? calculateSimpleMonsterDeathChance({
						...BurningDominionTemplate.deathProps,
						currentKC
					})
				: 0;

			const itemsToRemove = buildUserCost(u, qty);
			await u.removeItemsFromBank(itemsToRemove);
			totalCost.add(itemsToRemove);

			return {
				user: u.id,
				deathChance,
				itemsToRemove: itemsToRemove.toJSON()
			};
		})
	);

	if (totalCost.length > 0) {
		await trackLoot({
			changeType: 'cost',
			totalCost,
			id: BurningDominionTemplate.name,
			type: 'Monster',
			users: bossUsers.map(i => ({
				id: i.user,
				cost: new Bank(i.itemsToRemove)
			}))
		});
	}

	await ActivityManager.startTrip({
		mi: BurningDominionTemplate.id,
		userID: user.id,
		channelId,
		quantity: qty,
		duration,
		type: 'BurningDominion',
		users: users.map(u => u.id),
		bossUsers
	} as any);

	const killsPerHr = Math.round((qty / (duration / Time.Minute)) * 60).toLocaleString();
	const partyUsernames = users.map(u => u.usernameOrMention).join(', ');

	const elixirAmount = Math.max(1, Math.ceil(qty * 1.5));
	const perPlayerSupplies = new Bank()
		.add('Brimstone elixir', elixirAmount)
		.add('Enhanced saradomin brew', 3 * qty)
		.add('Enhanced super restore', 1 * qty)
		.add('Super combat potion(4)', 1 * qty)
		.add('Enhanced stamina potion', 1 * qty);

	const tripSummary =
		`${user.usernameOrMention}'s party (${partyUsernames}) ` +
		`is now off to kill **${qty}x ${BurningDominionTemplate.name}**. ` +
		`Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(BurningDominionTemplate.timeToFinish)} - ` +
		`total trip: **${formatDuration(duration)}** | **${killsPerHr} kills/hr**\n` +
		`**Supplies Used (per player):** ${perPlayerSupplies}`;

	const embed = new EmbedBuilder()
		.setTitle(`${BurningDominionTemplate.name} Mass - Boost Breakdown`)
		.setColor(0xf5a623)
		.addFields(buildBoostEmbedFields(playerBoostInfos));

	return {
		content: tripSummary,
		embeds: [embed]
	};
}
