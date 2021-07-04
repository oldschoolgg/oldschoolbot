import { calcWhatPercent, noOp, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { Activity, Emoji, Events } from '../../constants';
import { coxLog, metamorphPets } from '../../data/collectionLog';
import {
	calcCoxDuration,
	calcCoxInput,
	calculateUserGearPercents,
	createTeam,
	hasMinRaidsRequirements,
	minimumCoxSuppliesNeeded
} from '../../data/cox';
import { UserSettings } from '../../settings/types/UserSettings';
import { SkillsEnum } from '../../skilling/types';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions, RaidsTaskOptions } from '../../types/minions';
import { filterBankFromArrayOfItems, roll } from '../../util';
import { formatOrdinal } from '../../util/formatOrdinal';
import itemID from '../../util/itemID';
import resolveItems from '../../util/resolveItems';
import LfgInterface, {
	LfgCalculateDurationAndActivitiesPerTrip,
	LfgCalculateDurationAndActivitiesPerTripReturn,
	LfgCheckTeamRequirements,
	LfgCheckUserRequirements,
	LfgGetItemToRemoveFromBank,
	LfgHandleTripFinish,
	LfgHandleTripFinishReturn,
	lfgReturnMessageInterface
} from '../LfgInterface';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <RaidsTaskOptions>{ type: Activity.Raids };

	notPurple = resolveItems(['Torn prayer scroll', 'Dark relic']);
	greenItems = resolveItems(['Twisted ancestral colour kit']);
	blueItems = resolveItems(['Metamorphic dust']);
	purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);
	purpleItems = [...Object.values(coxLog), ...metamorphPets].flat(2).filter(i => !this.notPurple.includes(i));

	async HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn> {
		const { users, duration } = <GroupMonsterActivityTaskOptions>params.data;
		const { queue, client } = params;

		const challengeMode = queue.extraParams!.isChallengeMode ?? false;
		let extraMessage = [];

		const allUsers = await Promise.all(users.map(async u => client.users.fetch(u)));
		const team = await createTeam(allUsers, challengeMode);

		// Get loot for this raid
		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		const totalLoot = new Bank();

		// Get total points for this raid
		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		// Increment user kc count
		await Promise.all(
			allUsers.map(u => {
				if (challengeMode) {
					u.incrementMinigameScore('RaidsChallengeMode', 1);
				} else {
					u.incrementMinigameScore('Raids', 1);
				}
			})
		);

		let usersWithLoot: lfgReturnMessageInterface[] = [];

		for (let [userID, _userLoot] of Object.entries(loot)) {
			const user = await client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			const { personalPoints, deaths, deathChance } = team.find(u => u.id === user.id)!;

			user.settings.update(
				UserSettings.TotalCoxPoints,
				user.settings.get(UserSettings.TotalCoxPoints) + personalPoints
			);

			const userLoot = new Bank(_userLoot);
			if (
				challengeMode &&
				roll(50) &&
				user.settings.get(UserSettings.CollectionLogBank)[itemID('Metamorphic dust')]
			) {
				const { bank } = user.allItemsOwned();
				const unownedPet = shuffleArr(metamorphPets).find(pet => !bank[pet]);
				if (unownedPet) {
					userLoot.add(unownedPet);
				}
			}

			totalLoot.add(userLoot);

			// Check if anything rare dropped
			const items = userLoot.items();
			const isPurple = items.some(([item]) => this.purpleItems.includes(item.id));
			const isGreen = items.some(([item]) => this.greenItems.includes(item.id));
			const isBlue = items.some(([item]) => this.blueItems.includes(item.id));
			const emote = isBlue ? Emoji.Blue : isGreen ? Emoji.Green : isPurple ? Emoji.Purple : false;
			if (
				items.some(
					([item]) => this.purpleItems.includes(item.id) && !this.purpleButNotAnnounced.includes(item.id)
				)
			) {
				const itemsToAnnounce = filterBankFromArrayOfItems(this.purpleItems, userLoot.bank);
				client.emit(
					Events.ServerNotification,
					`${emote} ${user.username} just received **${new Bank(itemsToAnnounce)}** on their ${formatOrdinal(
						await user.getMinigameScore(challengeMode ? 'RaidsChallengeMode' : 'Raids')
					)} raid.`
				);
			}

			usersWithLoot.push({ user, emoji: emote, lootedItems: userLoot });

			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');
			extraMessage.push(
				`${deathStr} **${user.username}** (${personalPoints?.toLocaleString()} pts, ${
					Emoji.Skull
				}${deathChance.toFixed(0)}%)`
			);
			await user.addItemsToBank(userLoot, true);
		}

		extraMessage.push(`The total amount of points your team got is: ${totalPoints.toLocaleString()}`);

		return { usersWithLoot, extraMessage };
	}

	async calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn> {
		const { party, queue } = params;
		const { duration, totalReduction, reductions } = await calcCoxDuration(
			party,
			queue.extraParams!.isChallengeMode
		);
		const returnMessage: string[] = [];
		await party.map(async u => {
			const { total } = calculateUserGearPercents(u);
			returnMessage.push(
				`${u.username} (${Emoji.Gear}${total.toFixed(1)}% ${Emoji.CombatSword} ${calcWhatPercent(
					reductions[u.id],
					totalReduction
				).toFixed(1)}%)`
			);
		});
		return { activitiesThisTrip: 1, durationOfTrip: duration, extraMessages: returnMessage };
	}

	checkUserRequirements = async (params: LfgCheckUserRequirements): Promise<string[]> => {
		let returnMessage: string[] = [];
		const { user, party, solo, queue } = params;
		if (!user.hasMinion) {
			returnMessage.push('You need a minion to join a raid!');
		}
		if (user.minionIsBusy) {
			returnMessage.push("You are busy right now and can't join this raid!");
		}
		if (!hasMinRaidsRequirements(user)) {
			returnMessage.push("You don't meet the stat requirements to do the Chambers of Xeric");
		}

		if (!user.owns(minimumCoxSuppliesNeeded)) {
			returnMessage.push(
				`You don't have enough items, you need a minimum of this amount of items: ${minimumCoxSuppliesNeeded}.`
			);
		}

		const { total } = calculateUserGearPercents(user);
		if (total < 20) {
			returnMessage.push('Your gear is terrible! You do not stand a chance in the Chambers of Xeric');
		}

		if (
			queue!.extraParams!.isChallengeMode &&
			!user.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
			!user.hasItemEquippedOrInBank('Twisted bow') &&
			!solo
		) {
			returnMessage.push(
				'You need either a Dragon hunter crossbow or Twisted bow to attempt Challenge Mode Chambers of Xeric.'
			);
		}
		const kc = await user.getMinigameScore('Raids');

		if (queue!.extraParams!.isChallengeMode && kc < 200) {
			returnMessage.push(
				'You need atleast 200 Normal Chambers of Xeric KC before you can attempt Challenge Mode Chambers of Xeric.'
			);
		}

		if (solo && party.length === 1) {
			if (!queue!.extraParams!.isChallengeMode && kc < 50) {
				returnMessage.push(
					'You need atleast 50 Normal Chambers of Xeric KC before you can attempt a solo Chambers of Xeric.'
				);
			}
			if (!user.hasItemEquippedOrInBank('Twisted bow')) {
				returnMessage.push(
					"You don't own a Twisted bow, which is required for solo Challenge Mode Chambers of Xeric."
				);
			}
		}

		return returnMessage;
	};

	async getItemToRemoveFromBank(params: LfgGetItemToRemoveFromBank): Promise<Bank> {
		return calcCoxInput(params.user, params.solo);
	}

	checkTeamRequirements(params: LfgCheckTeamRequirements): string[] {
		const { party } = params;
		const returnMessage: string[] = [];

		const hasHerbalist = party!.some(u => u.skillLevel(SkillsEnum.Herblore) >= 78);
		if (!hasHerbalist) {
			returnMessage.push('Nobody with atleast level 78 Herblore');
		}
		const hasFarmer = party!.some(u => u.skillLevel(SkillsEnum.Farming) >= 55);
		if (!hasFarmer) {
			returnMessage.push('Nobody with atleast level 55 Farming');
		}

		return returnMessage;
	}
}
