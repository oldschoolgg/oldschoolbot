import { sumArr } from 'e';

import {
	all3rdAgeItems,
	chambersOfXericCL,
	cluesEliteCL,
	cluesMasterCL,
	godWarsDungeonCL
} from '../data/CollectionsExport';
import { NexMonster } from '../nex';
import { calcCombatLevel, calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { TaskWithoutID } from './leagues';

export const masterTasks: TaskWithoutID[] = [
	{
		name: 'Build a Demonic Throne',
		has: async ({ poh }) => {
			return poh.throne === 13_671;
		}
	},
	{
		name: 'Defeat Nex 500 Times',
		has: async ({ monsterScores }) => {
			return (monsterScores[NexMonster.id] ?? 0) >= 500;
		}
	},
	{
		name: 'Receive atleast 1000 Agility Arena tickets',
		has: async ({ cl }) => {
			return cl.amount('Agility arena ticket') >= 1000;
		}
	},
	{
		name: 'Create every godsword',
		has: async ({ cl }) => {
			return resolveItems([
				'Armadyl godsword',
				'Bandos godsword',
				'Saradomin godsword',
				'Zamorak godsword',
				'Ancient godsword'
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Receive all Justiciar items',
		has: async ({ cl }) => {
			return resolveItems(['Justiciar faceguard', 'Justiciar chestguard', 'Justiciar legguards']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		name: 'Receive all Inquisitor armour pieces',
		has: async ({ cl }) => {
			return resolveItems(["Inquisitor's great helm", "Inquisitor's hauberk", "Inquisitor's plateskirt"]).every(
				gs => cl.has(gs)
			);
		}
	},
	{
		name: 'Receive all Chambers of Xeric Weapons',
		has: async ({ cl }) => {
			return resolveItems([
				'Elder maul',
				'Twisted bow',
				'Dragon claws',
				'Dragon hunter crossbow',
				'Kodai insignia'
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Receive all Chambers of Xeric Armor',
		has: async ({ cl }) => {
			return resolveItems([
				'Ancestral hat',
				'Ancestral robe top',
				'Ancestral robe bottom',
				"Dinh's bulwark"
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Receive all Chambers of Xeric items',
		has: async ({ cl }) => {
			return chambersOfXericCL.every(gs => cl.has(gs));
		}
	},
	{
		name: 'Create every god book',
		has: async ({ cl }) => {
			return resolveItems([
				'Book of balance',
				'Book of darkness',
				'Book of law',
				'Book of war',
				'Holy book',
				'Unholy book'
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Create every pair of Cerberus boots',
		has: async ({ cl }) => {
			return resolveItems(['Primordial boots', 'Pegasian boots', 'Eternal boots']).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Receive every Revenant weapon',
		has: async ({ cl }) => {
			return resolveItems(["Craw's bow (u)", "Thammaron's sceptre (u)", "Viggora's chainmace (u)"]).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		name: 'Receive base level 110',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 110);
		}
	},
	{
		name: 'Create every draconic shield',
		has: async ({ cl }) => {
			return resolveItems(['Dragonfire ward', 'Dragonfire shield', 'Ancient wyvern shield']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		name: 'Create every nightmare staff',
		has: async ({ cl }) => {
			return resolveItems([
				'Volatile nightmare staff',
				'Harmonised nightmare staff',
				'Eldritch nightmare staff'
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Achieve a TzKal cape',
		has: async ({ cl }) => {
			return cl.has('TzKal cape');
		}
	},
	{
		name: 'Create every piece of Zenyte jewellery',
		has: async ({ cl }) => {
			return resolveItems(['Zenyte ring', 'Zenyte necklace', 'Zenyte bracelet', 'Zenyte amulet']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		name: 'Create every piece of enchanted Zenyte jewellery',
		has: async ({ cl }) => {
			return resolveItems([
				'Ring of suffering',
				'Necklace of anguish',
				'Tormented bracelet',
				'Amulet of torture'
			]).every(gs => cl.has(gs));
		}
	},
	{
		name: 'Finish the god wars CL',
		has: async ({ cl }) => {
			return godWarsDungeonCL.every(gs => cl.has(gs));
		}
	},
	{
		name: 'Complete 500 Elite clue scrolls',
		has: async ({ clueScores }) => {
			return (clueScores[20_543] ?? 0) >= 500;
		}
	},
	{
		name: 'Complete 200 Grandmaster clue scrolls',
		has: async ({ clueScores }) => {
			return (clueScores[19_838] ?? 0) >= 500;
		}
	},
	{
		name: 'Complete the Inferno 30 Times',
		has: async ({ activityCounts }) => {
			return (activityCounts.Inferno ?? 0) >= 30;
		}
	},
	{
		name: 'Smith 100 Runite bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Runite ore') >= 100 && cl.amount('Runite bar') >= 100;
		}
	},
	{
		name: 'Build a Ancient rejuvenation pool in your PoH',
		has: async ({ poh }) => {
			return poh.pool === 99_950;
		}
	},
	{
		name: 'Complete 500 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 500;
		}
	},
	{
		name: 'Do 2000 laps at the Ardougne Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[11] ?? 0) >= 2000;
		}
	},
	{
		name: 'Do 1000 laps at the Prifddinas Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[13] ?? 0) >= 1000;
		}
	},
	{
		name: 'Do 1000 laps at the Daemonheim Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[30] ?? 0) >= 1000;
		}
	},
	{
		name: 'Obtain 5000 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 5000;
		}
	},
	{
		name: 'Reach combat level 126',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 126;
		}
	},
	{
		name: 'Reach total level 2300',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2300;
		}
	},
	{
		name: 'Complete 1000 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 1000;
		}
	},
	{
		name: 'Defeat Wintertodt 2500 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 2500;
		}
	},
	{
		name: 'Mix 1000 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 1000;
		}
	},
	{
		name: 'Mix 5000 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 5000;
		}
	},
	{
		name: 'Mix 5000 Super restores.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Super restore (3)', 'Super restore (4)']).map(i => cl.amount(i))) >= 5000;
		}
	},
	{
		name: 'Finish the elite clue CL',
		has: async ({ cl }) => {
			return cluesEliteCL.filter(i => cl.has(i)).length === cluesEliteCL.length;
		}
	},
	{
		name: 'Finish the master clue CL',
		has: async ({ cl }) => {
			return cluesMasterCL.filter(i => cl.has(i)).length === cluesMasterCL.length;
		}
	},
	{
		name: 'Obtain a First Age item',
		has: async ({ cl }) => {
			return [
				'First age tiara',
				'First age amulet',
				'First age cape',
				'First age bracelet',
				'First age ring'
			].some(i => cl.has(i));
		}
	},
	{
		name: 'Receive 10 3rd age items',
		has: async ({ cl }) => {
			return all3rdAgeItems.filter(i => cl.has(i)).length >= 10;
		}
	}
];
