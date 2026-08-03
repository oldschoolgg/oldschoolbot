import { SpecialResponse } from '@oldschoolgg/discord';
import { calcPerHour, formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank, Monsters } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { YamaActivityTaskOptions, YamaTeamMember } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

const yamaMonster = killableMonsters.find(monster => monster.id === Monsters.Yama.id)!;

function yamaProficiency(kc: number) {
	return Math.min(1, 1 - Math.exp(-kc / 31));
}

function yamaCombatAverage(user: MUser) {
	const skills = user.skillsAsLevels;
	const combatSkills = [
		skills.attack,
		skills.strength,
		skills.defence,
		skills.ranged,
		skills.magic,
		skills.hitpoints,
		skills.prayer
	];
	return combatSkills.reduce((sum, level) => sum + Math.min(99, level), 0) / combatSkills.length;
}

async function checkYamaUser(user: MUser): Promise<string | null> {
	if (!user.hasMinion) return `${user.usernameOrMention} doesn't have a minion.`;
	if (await user.minionIsBusy()) return `${user.usernameOrMention}'s minion is busy.`;
	const [hasReqs, reason] = user.hasMonsterRequirements(yamaMonster);
	if (!hasReqs) return `${user.usernameOrMention} doesn't have the requirements for Yama: ${reason}`;
	return null;
}

async function yamaTeamMember(user: MUser, solo: boolean, teamSize: number): Promise<YamaTeamMember> {
	const kc = await user.getKC(Monsters.Yama.id);
	const proficiency = yamaProficiency(kc);
	const statAverage = yamaCombatAverage(user);
	const lowStatPenalty = Math.max(0, 99 - statAverage) / 2;
	const noExperiencePenalty = (1 - proficiency) * (solo ? 28 : 18);
	const baseDeathChance = solo ? 18 : 12;

	return {
		id: user.id,
		contribution: 100 / teamSize,
		deathChance: Math.max(1, baseDeathChance + lowStatPenalty + noExperiencePenalty),
		kc,
		attackStyles: user.getAttackStyles() as AttackStyles[]
	};
}

async function calcYamaTrip(users: MUser[], quantity: number | undefined, solo: boolean) {
	const teamMembers = await Promise.all(users.map(user => yamaTeamMember(user, solo, users.length)));
	const avgKC = teamMembers.reduce((sum, member) => sum + member.kc, 0) / teamMembers.length;
	const avgStats = users.reduce((sum, user) => sum + yamaCombatAverage(user), 0) / users.length;
	const boosts: string[] = [];
	let perKillTime = yamaMonster.timeToFinish;

	const statBoost = Math.max(0, Math.min(10, avgStats / 9.9));
	perKillTime = reduceNumByPercent(perKillTime, statBoost);
	boosts.push(`${statBoost.toFixed(2)}% for team combat stats`);

	const proficiencyBoost = yamaProficiency(avgKC) * 20;
	if (proficiencyBoost >= 1) {
		perKillTime = reduceNumByPercent(perKillTime, proficiencyBoost);
		boosts.push(`${proficiencyBoost.toFixed(2)}% for team Yama KC`);
	}

	const minAgility = Math.min(...users.map(user => user.skillsAsLevels.agility));
	if (minAgility >= 83) {
		perKillTime = reduceNumByPercent(perKillTime, 12);
		boosts.push('12% for 83 Agility Chasm shortcut');
	} else if (minAgility >= 73) {
		perKillTime = reduceNumByPercent(perKillTime, 7);
		boosts.push('7% for 73 Agility Chasm shortcut');
	}

	if (!solo) {
		perKillTime = reduceNumByPercent(perKillTime, 20);
		boosts.push('20% for duo kill speed');
	}

	const maxTripLength = await users[0].calcMaxTripLength('Yama');
	const maxQuantity = Math.max(1, Math.floor(maxTripLength / perKillTime));
	quantity = quantity ?? maxQuantity;
	if (quantity < 1) return 'Quantity must be at least 1.';
	if (quantity > maxQuantity)
		return `The max amount of Yama this ${solo ? 'solo' : 'duo'} can kill per trip is ${maxQuantity}.`;

	return {
		quantity,
		duration: quantity * perKillTime,
		perKillTime,
		boosts,
		teamMembers
	};
}

async function maybeUseChasmTeleports(users: MUser[], quantity: number, perKillTime: number, boosts: string[]) {
	const scrollCost = new Bank().add('Chasm teleport scroll', quantity);
	const usersWithScrolls = users.filter(user => user.allItemsOwned.has(scrollCost));
	if (usersWithScrolls.length !== users.length) return { perKillTime, cost: new Bank() };

	const totalCost = new Bank();
	for (const user of users) {
		const cost = (await user.specialRemoveItems(scrollCost)).realCost;
		totalCost.add(cost);
	}
	boosts.push('25% for Chasm teleport scrolls');
	return {
		perKillTime: reduceNumByPercent(perKillTime, 25),
		cost: totalCost
	};
}

export async function yamaCommand(
	interaction: OSInteraction,
	user: MUser,
	channelId: string,
	quantity: number | undefined,
	solo: boolean | undefined,
	_rng: RNGProvider
) {
	const ownerCheck = await checkYamaUser(user);
	if (ownerCheck) return ownerCheck;

	let users: MUser[];
	if (solo) {
		await interaction.defer();
		users = [user];
	} else {
		const duo = await globalClient.makeDuo({
			interaction,
			autoStartAfter: Time.Minute,
			leader: user,
			ironmanAllowed: true,
			message: `${user.badgedUsername} is looking for one partner to duo Yama. Use the button below to request to join.`,
			confirmMessage: joiningUser =>
				`${user.badgedUsername}, do you want to duo Yama with ${joiningUser.badgedUsername}?`,
			customDenier: async joiningUser => {
				const denier = await checkYamaUser(joiningUser);
				return denier ? [true, denier] : [false];
			}
		});
		if (!duo) return SpecialResponse.RespondedManually;
		users = duo;
	}
	const effectiveSolo = users.length === 1;

	for (const member of users) {
		const check = await checkYamaUser(member);
		if (check) return check;
	}

	const trip = await calcYamaTrip(users, quantity, effectiveSolo);
	if (typeof trip === 'string') return trip;

	const teleportResult = await maybeUseChasmTeleports(users, trip.quantity, trip.perKillTime, trip.boosts);
	const duration = trip.quantity * teleportResult.perKillTime;
	if (teleportResult.cost.length > 0) {
		await trackLoot({
			totalCost: teleportResult.cost,
			id: Monsters.Yama.name,
			type: 'Monster',
			changeType: 'cost',
			users: users.map(member => ({
				id: member.id,
				cost: new Bank().add('Chasm teleport scroll', trip.quantity)
			}))
		});
	}

	await ActivityManager.startTrip<YamaActivityTaskOptions>({
		userID: user.id,
		channelId,
		quantity: trip.quantity,
		iQty: quantity,
		duration,
		type: 'Yama',
		leader: user.id,
		users: users.map(member => member.id),
		solo,
		perKillTime: teleportResult.perKillTime,
		teamMembers: trip.teamMembers
	});

	return `${user.usernameOrMention}'s ${effectiveSolo ? 'solo' : 'duo'} Yama trip is starting with ${users
		.map(member => member.usernameOrMention)
		.join(', ')}. They will attempt ${trip.quantity}x Yama (${calcPerHour(trip.quantity, duration).toFixed(
		1
	)}/hr), returning in about ${formatTripDuration(user, duration)} (${formatDuration(
		teleportResult.perKillTime
	)} per kill).

${trip.teamMembers
	.map(
		member =>
			`<@${member.id}>: ${member.contribution.toFixed(0)}% contribution, ${member.deathChance.toFixed(2)}% death chance`
	)
	.join('\n')}

**Boosts:** ${trip.boosts.join(', ')}.`;
}
