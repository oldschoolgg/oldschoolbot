import { NexMonster } from '@/lib/bso/monsters/nex.js';

import { objectEntries, partition } from '@oldschoolgg/toolkit';
import { Bank, EMonster, ItemGroups, Items, Monsters, resolveItems } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import { DEPRECATED_ACTIVITY_TYPES } from '@/lib/constants.js';
import { RandomEvents } from '@/lib/randomEvents.js';
import { type MinigameName, Minigames } from '@/lib/settings/minigames.js';
import type { RequirementFailure } from '@/lib/structures/Requirements.js';
import { Requirements } from '@/lib/structures/Requirements.js';
import { formatList } from '@/lib/util/smallUtils.js';

export const musicCapeRequirements = new Requirements()
	.add({
		name: 'Reach level 50 Slayer',
		has: ({ user }) => {
			if (user.skillsAsLevels.slayer >= 50) {
				return [];
			}
			return [
				{
					reason: 'You need level 50 slayer.'
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
			.add('Revenant ether')
	})
	.add({
		name: '750 Barronite shards to access the Camdozaal Vault',
		clRequirement: new Bank().add('Barronite shards', 750)
	})
	.add({
		kcRequirement: {
			[EMonster.MIMIC]: 1,
			[Monsters.Hespori.id]: 1,
			[Monsters.Bryophyta.id]: 1,
			[EMonster.TZTOKJAD]: 1,
			[Monsters.Skotizo.id]: 1,
			[Monsters.GeneralGraardor.id]: 1,
			[Monsters.CommanderZilyana.id]: 1,
			[Monsters.Kreearra.id]: 1,
			[Monsters.KrilTsutsaroth.id]: 1,
			[NexMonster.id]: 1,
			[Monsters.Cerberus.id]: 1,
			[Monsters.GiantMole.id]: 1,
			[Monsters.Jogre.id]: 1,
			[Monsters.AbyssalSire.id]: 1,
			[Monsters.AlchemicalHydra.id]: 1,
			[Monsters.KingBlackDragon.id]: 1,
			[Monsters.CorporealBeast.id]: 1,
			[Monsters.Vorkath.id]: 1,
			[Monsters.Scorpia.id]: 1,
			[EMonster.ZALCANO]: 1,
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
		name: 'Runecraft all runes at least once',
		has: async ({ user }) => {
			const uniqueRunesCrafted = (
				await prisma.$queryRaw<{ rune_id: string }[]>`SELECT DISTINCT(data->>'runeID') AS rune_id
FROM activity
WHERE user_id = ${BigInt(user.id)}
AND type = 'Runecraft'
AND data->>'runeID' IS NOT NULL;`
			).map(i => Number(i.rune_id));
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
			const notDoneRunes = runesToCheck.filter(r => !uniqueRunesCrafted.includes(r));
			if (notDoneRunes.length > 0) {
				return [
					{
						reason: `You need to Runecraft these runes at least once: ${formatList(notDoneRunes.map(i => Items.itemNameFromId(i)))}.`
					}
				];
			}

			return [];
		}
	})
	.add({
		name: 'One of Every Activity',
		has: async ({ user }) => {
			const uniqueActivitiesDone: activity_type_enum[] = (
				await prisma.$queryRaw<{ type: activity_type_enum }[]>`SELECT DISTINCT(type)
FROM activity
WHERE user_id = ${BigInt(user.id)}
GROUP BY type;`
			).map(i => i.type);
			const typesNotRequiredForMusicCape: activity_type_enum[] = [
				...DEPRECATED_ACTIVITY_TYPES,
				activity_type_enum.GroupMonsterKilling,
				activity_type_enum.Questing,
				activity_type_enum.ChampionsChallenge,
				activity_type_enum.Nex
			];
			const notDoneActivities = Object.values(activity_type_enum).filter(
				type => !typesNotRequiredForMusicCape.includes(type) && !uniqueActivitiesDone.includes(type)
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
		has: ({ minigames }) => {
			const results: RequirementFailure[] = [];
			const typesNotRequiredForMusicCape: MinigameName[] = [
				'corrupted_gauntlet',
				'raids_challenge_mode',
				'tob_hard',
				'tithe_farm',
				'champions_challenge'
			];

			const minigamesNotDone = Minigames.filter(
				i => !typesNotRequiredForMusicCape.includes(i.column) && minigames[i.column] < 1
			).map(i => i.name);

			if (minigamesNotDone.length > 0) {
				results.push({
					reason: `You need to do these minigames at least once: ${formatList(minigamesNotDone.slice(0, 5))}.`
				});
			}

			return results;
		}
	})
	.add({
		name: 'One Random Event with a unique music track',
		has: ({ stats }) => {
			const results: RequirementFailure[] = [];
			const eventBank = stats.randomEventCompletionsBank();
			const uniqueTracks = RandomEvents.filter(i => i.uniqueMusic);

			if (!uniqueTracks.some(i => eventBank[i.id])) {
				const tracksNeeded = RandomEvents.filter(i => i.uniqueMusic).map(i => i.name);
				results.push({
					reason: `You need to do one of these random events: ${formatList(tracksNeeded, 'or')}.`
				});
			}
			return results;
		}
	})
	.add({
		name: 'Must Build Something in PoH',
		has: ({ poh }) => {
			for (const [key, value] of objectEntries(poh)) {
				if (['user_id', 'background_id'].includes(key)) continue;
				if (value !== null) {
					return [];
				}
			}
			return [{ reason: 'You need to build something in your POH.' }];
		}
	})
	.add({
		name: 'Champions Challenge',
		has: ({ user }) => {
			for (const scroll of ItemGroups.championScrolls) {
				if (user.cl.has(scroll)) return [];
			}
			return [{ reason: 'You need to have a Champion Scroll in your CL.' }];
		}
	});
