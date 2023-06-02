import { activity_type_enum } from '@prisma/client';
import { objectEntries, partition } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { getPOH } from '../mahoji/lib/abstracted_commands/pohCommand';
import { MIMIC_MONSTER_ID, NEX_ID, ZALCANO_ID } from './constants';
import { championScrolls } from './data/CollectionsExport';
import { RandomEvents } from './randomEvents';
import { MinigameName, Minigames } from './settings/minigames';
import { getUsersActivityCounts, prisma } from './settings/prisma';
import { RequirementFailure, Requirements } from './structures/Requirements';
import { ItemBank } from './types';
import { itemNameFromID } from './util';
import resolveItems from './util/resolveItems';

export const musicCapeRequirements = new Requirements()
	.add({
		name: 'Do 20 slayer tasks',
		has: async ({ user }) => {
			const count = await prisma.slayerTask.count({
				where: {
					user_id: user.id
				}
			});
			if (count >= 20) {
				return [];
			}
			return [
				{
					reason: 'You need to complete 20 slayer tasks'
				}
			];
		}
	})
	.add({
		name: 'Required Stats',
		skillRequirements: {
			slayer: 75,
			hitpoints: 70,
			agility: 70,
			farming: 65,
			thieving: 65,
			mining: 50,
			firemaking: 50,
			fishing: 35,
			magic: 33
		}
	})
	.add({
		clRequirement: new Bank()
			.add('Dark totem')
			.add('Mossy key')
			.add('Hespori seed')
			.add('Fire cape')
			.add('Raw monkfish')
			.add('Brittle key')
	})
	// .add({
	// 	name: '750 Barronite shards to unlock Race Against the Clock inside the Camdozaal Vault',
	// 	clRequirement: new Bank().add('Barronite shards', 750)
	// })
	.add({
		kcRequirement: {
			[MIMIC_MONSTER_ID]: 1,
			[Monsters.Hespori.id]: 1,
			[Monsters.Bryophyta.id]: 1,
			[Monsters.TzTokJad.id]: 1,
			[Monsters.Skotizo.id]: 1,
			[Monsters.GeneralGraardor.id]: 1,
			[Monsters.CommanderZilyana.id]: 1,
			[Monsters.Kreearra.id]: 1,
			[Monsters.KrilTsutsaroth.id]: 1,
			[NEX_ID]: 1,
			[Monsters.Cerberus.id]: 1,
			[Monsters.GiantMole.id]: 1,
			[Monsters.Jogre.id]: 1,
			[Monsters.AbyssalSire.id]: 1,
			[Monsters.AlchemicalHydra.id]: 1,
			[Monsters.KingBlackDragon.id]: 1,
			[Monsters.CorporealBeast.id]: 1,
			[Monsters.Vorkath.id]: 1,
			[Monsters.Scorpia.id]: 1,
			[ZALCANO_ID]: 1,
			[Monsters.Kraken.id]: 1,
			[Monsters.DagannothPrime.id]: 1,
			[Monsters.BlackDemon.id]: 1,
			[Monsters.Hellhound.id]: 1,
			[Monsters.BlueDragon.id]: 1,
			[Monsters.Barrows.id]: 1
		}
	})
	.add({
		qpRequirement: 200
	})
	.add({
		sacrificedItemsRequirement: new Bank().add('Fire cape')
	})
	.add({
		name: 'Mage Arena',
		clRequirement: new Bank().add('Saradomin cape')
	})
	.add({
		lapsRequirement: {
			14: 1,
			8: 1
		}
	})
	.add({
		name: 'Runecraft all runes atleast once',
		has: async ({ user }) => {
			const counts = await prisma.$queryRaw<{ rune_id: string }[]>`SELECT DISTINCT(data->>'runeID') AS rune_id
FROM activity
WHERE user_id = ${BigInt(user.id)}
AND type = 'Runecraft'
AND data->>'runeID' IS NOT NULL;`;

			const runesToCheck = resolveItems([
				'Mind rune',
				'Air rune',
				'Water Rune',
				'Fire rune',
				'Earth rune',
				'Nature rune',
				'Death rune',
				'Body rune',
				'Cosmic rune',
				'Chaos rune',
				'Astral rune',
				'Wrath rune'
			]);
			const notDoneRunes = runesToCheck
				.filter(i => !counts.some(c => c.rune_id === i.toString()))
				.map(i => itemNameFromID(i)!)
				.map(s => s.split(' ')[0]);
			if (notDoneRunes.length > 0) {
				return [
					{
						reason: `You need to Runecraft these runes at least once: ${notDoneRunes.join(', ')}.`
					}
				];
			}

			return [];
		}
	})
	.add({
		name: 'One of Every Activity',
		has: async ({ user }) => {
			const typesNotRequiredForMusicCape: activity_type_enum[] = [
				activity_type_enum.Easter,
				activity_type_enum.HalloweenEvent,
				activity_type_enum.GroupMonsterKilling,
				activity_type_enum.BirthdayEvent,
				activity_type_enum.Questing,
				activity_type_enum.BlastFurnace, // During the slash command migration this moved to under the smelting activity
				activity_type_enum.ChampionsChallenge
			];
			const activityCounts = await getUsersActivityCounts(user);

			const notDoneActivities = Object.values(activity_type_enum).filter(
				type => !typesNotRequiredForMusicCape.includes(type) && activityCounts[type] < 1
			);

			const [firstLot, secondLot] = partition(notDoneActivities, i => notDoneActivities.indexOf(i) < 5);

			if (notDoneActivities.length > 0) {
				return [
					{
						reason: `You need to do one of EVERY activity, you haven't done... ${firstLot.join(
							', '
						)}, and ${secondLot.length} others.`
					}
				];
			}

			return [];
		}
	})
	.add({
		name: 'One of Every Minigame',
		has: async ({ user }) => {
			const results: RequirementFailure[] = [];
			const typesNotRequiredForMusicCape: MinigameName[] = [
				'corrupted_gauntlet',
				'raids_challenge_mode',
				'tob_hard',
				'tithe_farm'
			];

			const minigameScores = await user.fetchMinigames();
			const minigamesNotDone = Minigames.filter(
				i => !typesNotRequiredForMusicCape.includes(i.column) && minigameScores[i.column] < 1
			).map(i => i.name);

			if (minigamesNotDone.length > 0) {
				results.push({
					reason: `You need to do these minigames at least once: ${minigamesNotDone.join(', ')}.`
				});
			}

			return results;
		}
	})
	.add({
		name: 'One of Every Random Event',
		has: async ({ userStats, user }) => {
			const results: RequirementFailure[] = [];
			const eventBank = userStats.random_event_completions_bank as ItemBank;

			const notDoneRandomEvents = RandomEvents.filter(i => {
				if (i.outfit && i.outfit.every(id => user.cl.has(id))) return false;
				return !eventBank[i.id];
			}).map(i => i.name);

			if (notDoneRandomEvents.length > 0) {
				results.push({
					reason: `You need to do these random events at least once: ${notDoneRandomEvents.join(', ')}.`
				});
			}
			return results;
		}
	})
	.add({
		name: 'Must Build Something in PoH',
		has: async ({ user }) => {
			const poh = await getPOH(user.id);
			for (const [key, value] of objectEntries(poh)) {
				if (['user_id', 'background_id'].includes(key)) continue;
				if (value !== null) {
					return [];
				}
			}
			return [{ reason: 'You need to build something in your POH' }];
		}
	})
	.add({
		name: 'Must have atleast 25% in each house favour',
		has: async ({ user }) => {
			const results: RequirementFailure[] = [];
			const favour = user.kourendFavour;

			const notDoneFavours = Object.entries(favour).filter(([_, value]) => value < 25);

			if (notDoneFavours.length > 0) {
				results.push({ reason: `You need atleast 25% favour in ${notDoneFavours.map(i => i[0]).join(', ')}.` });
			}
			return results;
		}
	})
	.add({
		name: 'Champions Challenge',
		has: async ({ user }) => {
			for (const scroll of championScrolls) {
				if (user.cl.has(scroll)) return [];
			}
			return [{ reason: 'You need to have a Champion Scroll in your CL' }];
		}
	});
