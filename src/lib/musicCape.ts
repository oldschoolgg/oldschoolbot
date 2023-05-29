import { activity_type_enum } from '@prisma/client';
import { objectEntries } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { getPOH } from '../mahoji/lib/abstracted_commands/pohCommand';
import { MIMIC_MONSTER_ID, NEX_ID, ZALCANO_ID } from './constants';
import { RandomEvents } from './randomEvents';
import { MinigameName, Minigames } from './settings/minigames';
import { getUsersActivityCounts, prisma } from './settings/prisma';
import Runecraft from './skilling/skills/runecraft';
import { Requirements } from './structures/Requirements';
import { ItemBank } from './types';

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
				return { doesHave: true, reason: null };
			}
			return {
				doesHave: false,
				reason: 'You need to complete 20 slayer tasks'
			};
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
		name: 'Agility Pyramid',
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

			for (const rune of Runecraft.Runes) {
				if (!counts.some(c => c.rune_id === rune.id.toString())) {
					return { doesHave: false, reason: `You need to runecraft ${rune.name} at least once` };
				}
			}

			return { doesHave: true, reason: null };
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
				activity_type_enum.Questing
			];
			const activityCounts = await getUsersActivityCounts(user);

			for (const type of Object.values(activity_type_enum)) {
				if (typesNotRequiredForMusicCape.includes(type)) continue;
				const count = activityCounts[type];
				if (count < 1) {
					return { doesHave: false, reason: `You need to do ${type} at least once` };
				}
			}

			return { doesHave: true, reason: null };
		}
	})
	.add({
		name: 'One of Every Minigame',
		has: async ({ user }) => {
			const typesNotRequiredForMusicCape: MinigameName[] = [
				'corrupted_gauntlet',
				'raids_challenge_mode',
				'tob_hard',
				'tithe_farm'
			];

			const minigameScores = await user.fetchMinigames();

			for (const game of Minigames) {
				if (typesNotRequiredForMusicCape.includes(game.column)) continue;
				const score = minigameScores[game.column];
				if (score < 1) {
					return { doesHave: false, reason: `You need to do the '${game.name}' minigame at least once` };
				}
			}

			return { doesHave: true, reason: null };
		}
	})
	.add({
		name: 'One of Every Random Event',
		has: async ({ userStats }) => {
			const eventBank = userStats.random_event_completions_bank as ItemBank;
			for (const event of RandomEvents) {
				if (!eventBank[event.id]) {
					return {
						doesHave: false,
						reason: `You need to do the '${event.name}' random event at least once`
					};
				}
			}

			return { doesHave: true, reason: null };
		}
	})
	.add({
		name: 'Must Build Something in PoH',
		has: async ({ user }) => {
			const poh = await getPOH(user.id);
			for (const [key, value] of objectEntries(poh)) {
				if (['user_id', 'background_id'].includes(key)) continue;
				if (value !== null) {
					return { doesHave: true, reason: null };
				}
			}
			return { doesHave: false, reason: 'You need to build something in your POH' };
		}
	})
	.add({
		name: 'Must have atleast 25% in each house favour',
		has: async ({ user }) => {
			const favour = user.kourendFavour;
			for (const [key, value] of Object.entries(favour)) {
				if (value < 25) {
					return { doesHave: false, reason: `You need atleast 25% in ${key} favour` };
				}
			}
			return { doesHave: true, reason: null };
		}
	});
