import { sumArr } from 'e';

import { getFarmingContractOfUser } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import {
	all3rdAgeItems,
	chambersOfXericCL,
	cluesEliteCL,
	cluesMasterCL,
	cmbClothes,
	customPetsCL,
	fishingContestCL,
	godWarsDungeonCL,
	gorajanArcherOutfit,
	gorajanOccultOutfit,
	gorajanWarriorOutfit
} from '../data/CollectionsExport';
import { Inventions } from '../invention/inventions';
import { NexMonster } from '../nex';
import { dungBuyables } from '../skilling/skills/dung/dungData';
import Dwarven from '../skilling/skills/smithing/smithables/dwarven';
import { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
import { calcCombatLevel, calcTotalLevel, itemID } from '../util';
import resolveItems from '../util/resolveItems';
import { Task } from './leagues';

export const masterTasks: Task[] = [
	{
		id: 4000,
		name: 'Build a Demonic Throne',
		has: async ({ poh }) => {
			return poh.throne === 13_671;
		}
	},
	{
		id: 4001,
		name: 'Defeat Nex 500 Times',
		has: async ({ monsterScores }) => {
			return (monsterScores[NexMonster.id] ?? 0) >= 500;
		}
	},
	{
		id: 4002,
		name: 'Receive atleast 1000 Agility Arena tickets',
		has: async ({ cl }) => {
			return cl.amount('Agility arena ticket') >= 1000;
		}
	},
	{
		id: 4003,
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
		id: 4004,
		name: 'Receive all Justiciar items',
		has: async ({ cl }) => {
			return resolveItems(['Justiciar faceguard', 'Justiciar chestguard', 'Justiciar legguards']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		id: 4005,
		name: 'Receive all Inquisitor armour pieces',
		has: async ({ cl }) => {
			return resolveItems(["Inquisitor's great helm", "Inquisitor's hauberk", "Inquisitor's plateskirt"]).every(
				gs => cl.has(gs)
			);
		}
	},
	{
		id: 4006,
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
		id: 4007,
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
		id: 4008,
		name: 'Receive all Chambers of Xeric items',
		has: async ({ cl }) => {
			return chambersOfXericCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 4009,
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
		id: 4010,
		name: 'Create every pair of Cerberus boots',
		has: async ({ cl }) => {
			return resolveItems(['Primordial boots', 'Pegasian boots', 'Eternal boots']).every(gs => cl.has(gs));
		}
	},
	{
		id: 4011,
		name: 'Receive every Revenant weapon',
		has: async ({ cl }) => {
			return resolveItems(["Craw's bow (u)", "Thammaron's sceptre (u)", "Viggora's chainmace (u)"]).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		id: 4012,
		name: 'Achieve base level 110 stats',
		has: async ({ skillsLevels }) => {
			return Object.values(skillsLevels).every(i => i >= 110);
		}
	},
	{
		id: 4013,
		name: 'Create every draconic shield',
		has: async ({ cl }) => {
			return resolveItems(['Dragonfire ward', 'Dragonfire shield', 'Ancient wyvern shield']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		id: 4014,
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
		id: 4015,
		name: 'Achieve a TzKal cape',
		has: async ({ cl }) => {
			return cl.has('TzKal cape');
		}
	},
	{
		id: 4016,
		name: 'Create every piece of Zenyte jewellery',
		has: async ({ cl }) => {
			return resolveItems(['Zenyte ring', 'Zenyte necklace', 'Zenyte bracelet', 'Zenyte amulet']).every(gs =>
				cl.has(gs)
			);
		}
	},
	{
		id: 4017,
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
		id: 4018,
		name: 'Finish the god wars CL',
		has: async ({ cl }) => {
			return godWarsDungeonCL.every(gs => cl.has(gs));
		}
	},
	{
		id: 4019,
		name: 'Complete 500 Elite clue scrolls',
		has: async ({ clueScores }) => {
			return (clueScores[itemID('Clue scroll (elite)')] ?? 0) >= 500;
		}
	},
	{
		id: 4020,
		name: 'Complete 200 Grandmaster clue scrolls',
		has: async ({ clueScores }) => {
			return (clueScores[itemID('Clue scroll (grandmaster)')] ?? 0) >= 200;
		}
	},
	{
		id: 4021,
		name: 'Complete the Inferno 30 Times',
		has: async ({ activityCounts }) => {
			return (activityCounts.Inferno ?? 0) >= 30;
		}
	},
	{
		id: 4022,
		name: 'Smith 100 Runite bars from scratch',
		has: async ({ cl }) => {
			return cl.amount('Runite ore') >= 100 && cl.amount('Runite bar') >= 100;
		}
	},
	{
		id: 4023,
		name: 'Build a Ancient rejuvenation pool in your PoH',
		has: async ({ poh }) => {
			return poh.pool === 99_950;
		}
	},
	{
		id: 4024,
		name: 'Complete 500 slayer tasks',
		has: async ({ slayerTasksCompleted }) => {
			return slayerTasksCompleted >= 500;
		}
	},
	{
		id: 4025,
		name: 'Do 2000 laps at the Ardougne Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[11] ?? 0) >= 2000;
		}
	},
	{
		id: 4026,
		name: 'Do 1000 laps at the Prifddinas Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[13] ?? 0) >= 1000;
		}
	},
	{
		id: 4027,
		name: 'Do 1000 laps at the Daemonheim Rooftop Course',
		has: async ({ lapScores }) => {
			return (lapScores[30] ?? 0) >= 1000;
		}
	},
	{
		id: 4028,
		name: 'Obtain 5000 Marks of grace',
		has: async ({ cl }) => {
			return cl.amount('Mark of grace') >= 5000;
		}
	},
	{
		id: 4029,
		name: 'Reach combat level 126',
		has: async ({ skillsXP }) => {
			return calcCombatLevel(skillsXP) >= 126;
		}
	},
	{
		id: 4030,
		name: 'Reach total level 2300',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 2300;
		}
	},
	{
		id: 4031,
		name: 'Complete 1000 Gnome restaurant deliveries',
		has: async ({ minigames }) => {
			return minigames.gnome_restaurant >= 1000;
		}
	},
	{
		id: 4032,
		name: 'Defeat Wintertodt 2500 times',
		has: async ({ minigames }) => {
			return minigames.wintertodt >= 2500;
		}
	},
	{
		id: 4033,
		name: 'Mix 1000 Stamina potions.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => cl.amount(i))) >= 1000;
		}
	},
	{
		id: 4034,
		name: 'Mix 5000 Saradomin brews.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => cl.amount(i))) >= 5000;
		}
	},
	{
		id: 4035,
		name: 'Mix 5000 Super restores.',
		has: async ({ cl }) => {
			return sumArr(resolveItems(['Super restore (3)', 'Super restore (4)']).map(i => cl.amount(i))) >= 5000;
		}
	},
	{
		id: 4036,
		name: 'Finish the elite clue CL',
		has: async ({ cl }) => {
			return cluesEliteCL.filter(i => cl.has(i)).length === cluesEliteCL.length;
		}
	},
	{
		id: 4037,
		name: 'Finish the master clue CL',
		has: async ({ cl }) => {
			return cluesMasterCL.filter(i => cl.has(i)).length === cluesMasterCL.length;
		}
	},
	{
		id: 4038,
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
		id: 4039,
		name: 'Receive 10 3rd age items',
		has: async ({ cl }) => {
			return all3rdAgeItems.filter(i => cl.has(i)).length >= 10;
		}
	},
	{
		id: 4040,
		name: 'Complete 1000 games of Monkey Rumble',
		has: async ({ minigames }) => {
			return minigames.monkey_rumble >= 1000;
		}
	},
	{
		id: 4041,
		name: 'Finish the CMB CL',
		has: async ({ cl }) => {
			return cmbClothes.every(i => cl.has(i));
		}
	},
	{
		id: 4042,
		name: 'Create every Gorajan armor piece',
		has: async ({ cl }) => {
			return [...gorajanArcherOutfit, ...gorajanOccultOutfit, ...gorajanWarriorOutfit].every(i => cl.has(i));
		}
	},
	{
		id: 4043,
		name: 'Receive any 30 custom pets',
		has: async ({ cl }) => {
			return customPetsCL.filter(i => cl.has(i)).length >= 30;
		}
	},
	{
		id: 4044,
		name: 'Create a Dwarven warhammer from scratch',
		has: async ({ cl }) => {
			return resolveItems(['Dwarven warhammer', 'Dwarven warhammer (broken)']).every(i => cl.has(i));
		}
	},
	{
		id: 4045,
		name: 'Create every Dwarven item from scratch',
		has: async ({ cl, skillsLevels }) => {
			return Dwarven.every(i => cl.has(i.inputBars) && skillsLevels.smithing >= i.level && cl.has(i.id));
		}
	},
	{
		id: 4046,
		name: 'Finish the Fishing Contest CL',
		has: async ({ cl }) => {
			return fishingContestCL.every(i => cl.has(i));
		}
	},
	{
		id: 4047,
		name: 'Create every invention',
		has: async ({ cl }) => {
			return Inventions.every(i => cl.has(i.item.id));
		}
	},
	{
		id: 4048,
		name: 'Disassemble 500 unique items',
		has: async ({ disassembledItems }) => {
			return disassembledItems.length >= 500;
		}
	},
	{
		id: 4049,
		name: 'Receive 500m Agility',
		has: async ({ skillsXP }) => {
			return skillsXP.agility >= 500_000_000;
		}
	},
	{
		id: 4050,
		name: 'Receive 500m Cooking',
		has: async ({ skillsXP }) => {
			return skillsXP.cooking >= 500_000_000;
		}
	},
	{
		id: 4051,
		name: 'Receive 500m Fishing',
		has: async ({ skillsXP }) => {
			return skillsXP.fishing >= 500_000_000;
		}
	},
	{
		id: 4052,
		name: 'Receive 500m Mining',
		has: async ({ skillsXP }) => {
			return skillsXP.mining >= 500_000_000;
		}
	},
	{
		id: 4053,
		name: 'Receive 500m Smithing',
		has: async ({ skillsXP }) => {
			return skillsXP.smithing >= 500_000_000;
		}
	},
	{
		id: 4054,
		name: 'Receive 500m Woodcutting',
		has: async ({ skillsXP }) => {
			return skillsXP.woodcutting >= 500_000_000;
		}
	},
	{
		id: 4055,
		name: 'Receive 500m Firemaking',
		has: async ({ skillsXP }) => {
			return skillsXP.firemaking >= 500_000_000;
		}
	},
	{
		id: 4056,
		name: 'Receive 500m Runecraft',
		has: async ({ skillsXP }) => {
			return skillsXP.runecraft >= 500_000_000;
		}
	},
	{
		id: 4057,
		name: 'Receive 500m Crafting',
		has: async ({ skillsXP }) => {
			return skillsXP.crafting >= 500_000_000;
		}
	},
	{
		id: 4058,
		name: 'Receive 500m Prayer',
		has: async ({ skillsXP }) => {
			return skillsXP.prayer >= 500_000_000;
		}
	},
	{
		id: 4059,
		name: 'Receive 500m Fleching',
		has: async ({ skillsXP }) => {
			return skillsXP.fletching >= 500_000_000;
		}
	},
	{
		id: 4060,
		name: 'Receive 500m Farming',
		has: async ({ skillsXP }) => {
			return skillsXP.farming >= 500_000_000;
		}
	},
	{
		id: 4061,
		name: 'Receive 500m Herblore',
		has: async ({ skillsXP }) => {
			return skillsXP.herblore >= 500_000_000;
		}
	},
	{
		id: 4062,
		name: 'Receive 500m Herblore',
		has: async ({ skillsXP }) => {
			return skillsXP.herblore >= 500_000_000;
		}
	},
	{
		id: 4063,
		name: 'Receive 500m Thieving',
		has: async ({ skillsXP }) => {
			return skillsXP.thieving >= 500_000_000;
		}
	},
	{
		id: 4064,
		name: 'Receive 500m Hunter',
		has: async ({ skillsXP }) => {
			return skillsXP.hunter >= 500_000_000;
		}
	},
	{
		id: 4065,
		name: 'Receive 500m Construction',
		has: async ({ skillsXP }) => {
			return skillsXP.construction >= 500_000_000;
		}
	},
	{
		id: 4066,
		name: 'Receive 500m Magic',
		has: async ({ skillsXP }) => {
			return skillsXP.magic >= 500_000_000;
		}
	},
	{
		id: 4067,
		name: 'Receive 500m Attack',
		has: async ({ skillsXP }) => {
			return skillsXP.attack >= 500_000_000;
		}
	},
	{
		id: 4068,
		name: 'Receive 500m Strength',
		has: async ({ skillsXP }) => {
			return skillsXP.strength >= 500_000_000;
		}
	},
	{
		id: 4069,
		name: 'Receive 500m Defence',
		has: async ({ skillsXP }) => {
			return skillsXP.defence >= 500_000_000;
		}
	},
	{
		id: 4070,
		name: 'Receive 500m Ranged',
		has: async ({ skillsXP }) => {
			return skillsXP.ranged >= 500_000_000;
		}
	},
	{
		id: 4071,
		name: 'Receive 500m Hitpoints',
		has: async ({ skillsXP }) => {
			return skillsXP.hitpoints >= 500_000_000;
		}
	},
	{
		id: 4072,
		name: 'Receive 500m Dungeoneering',
		has: async ({ skillsXP }) => {
			return skillsXP.dungeoneering >= 500_000_000;
		}
	},
	{
		id: 4073,
		name: 'Receive 500m Slayer',
		has: async ({ skillsXP }) => {
			return skillsXP.slayer >= 500_000_000;
		}
	},
	{
		id: 4074,
		name: 'Receive 500m Invention',
		has: async ({ skillsXP }) => {
			return skillsXP.invention >= 500_000_000;
		}
	},
	{
		id: 4075,
		name: 'Receive 5b Agility',
		has: async ({ skillsXP }) => {
			return skillsXP.agility >= 5_000_000_000;
		}
	},
	{
		id: 4076,
		name: 'Receive 5b Cooking',
		has: async ({ skillsXP }) => {
			return skillsXP.cooking >= 5_000_000_000;
		}
	},
	{
		id: 4077,
		name: 'Receive 5b Fishing',
		has: async ({ skillsXP }) => {
			return skillsXP.fishing >= 5_000_000_000;
		}
	},
	{
		id: 4078,
		name: 'Receive 5b Mining',
		has: async ({ skillsXP }) => {
			return skillsXP.mining >= 5_000_000_000;
		}
	},
	{
		id: 4079,
		name: 'Receive 5b Smithing',
		has: async ({ skillsXP }) => {
			return skillsXP.smithing >= 5_000_000_000;
		}
	},
	{
		id: 4080,
		name: 'Receive 5b Woodcutting',
		has: async ({ skillsXP }) => {
			return skillsXP.woodcutting >= 5_000_000_000;
		}
	},
	{
		id: 4081,
		name: 'Receive 5b Firemaking',
		has: async ({ skillsXP }) => {
			return skillsXP.firemaking >= 5_000_000_000;
		}
	},
	{
		id: 4082,
		name: 'Receive 5b Runecraft',
		has: async ({ skillsXP }) => {
			return skillsXP.runecraft >= 5_000_000_000;
		}
	},
	{
		id: 4083,
		name: 'Receive 5b Crafting',
		has: async ({ skillsXP }) => {
			return skillsXP.crafting >= 5_000_000_000;
		}
	},
	{
		id: 4084,
		name: 'Receive 5b Prayer',
		has: async ({ skillsXP }) => {
			return skillsXP.prayer >= 5_000_000_000;
		}
	},
	{
		id: 4085,
		name: 'Receive 5b Fleching',
		has: async ({ skillsXP }) => {
			return skillsXP.fletching >= 5_000_000_000;
		}
	},
	{
		id: 4086,
		name: 'Receive 5b Farming',
		has: async ({ skillsXP }) => {
			return skillsXP.farming >= 5_000_000_000;
		}
	},
	{
		id: 4087,
		name: 'Receive 5b Herblore',
		has: async ({ skillsXP }) => {
			return skillsXP.herblore >= 5_000_000_000;
		}
	},
	{
		id: 4088,
		name: 'Receive 5b Herblore',
		has: async ({ skillsXP }) => {
			return skillsXP.herblore >= 5_000_000_000;
		}
	},
	{
		id: 4089,
		name: 'Receive 5b Thieving',
		has: async ({ skillsXP }) => {
			return skillsXP.thieving >= 5_000_000_000;
		}
	},
	{
		id: 4090,
		name: 'Receive 5b Hunter',
		has: async ({ skillsXP }) => {
			return skillsXP.hunter >= 5_000_000_000;
		}
	},
	{
		id: 4091,
		name: 'Receive 5b Construction',
		has: async ({ skillsXP }) => {
			return skillsXP.construction >= 5_000_000_000;
		}
	},
	{
		id: 4092,
		name: 'Receive 5b Magic',
		has: async ({ skillsXP }) => {
			return skillsXP.magic >= 5_000_000_000;
		}
	},
	{
		id: 4093,
		name: 'Receive 5b Attack',
		has: async ({ skillsXP }) => {
			return skillsXP.attack >= 5_000_000_000;
		}
	},
	{
		id: 4094,
		name: 'Receive 5b Strength',
		has: async ({ skillsXP }) => {
			return skillsXP.strength >= 5_000_000_000;
		}
	},
	{
		id: 4095,
		name: 'Receive 5b Defence',
		has: async ({ skillsXP }) => {
			return skillsXP.defence >= 5_000_000_000;
		}
	},
	{
		id: 4096,
		name: 'Receive 5b Ranged',
		has: async ({ skillsXP }) => {
			return skillsXP.ranged >= 5_000_000_000;
		}
	},
	{
		id: 4097,
		name: 'Receive 5b Hitpoints',
		has: async ({ skillsXP }) => {
			return skillsXP.hitpoints >= 5_000_000_000;
		}
	},
	{
		id: 4099,
		name: 'Receive 5b Dungeoneering',
		has: async ({ skillsXP }) => {
			return skillsXP.dungeoneering >= 5_000_000_000;
		}
	},
	{
		id: 4100,
		name: 'Receive 5b Slayer',
		has: async ({ skillsXP }) => {
			return skillsXP.slayer >= 5_000_000_000;
		}
	},
	{
		id: 4101,
		name: 'Receive 5b Invention',
		has: async ({ skillsXP }) => {
			return skillsXP.invention >= 5_000_000_000;
		}
	},
	{
		id: 4102,
		name: 'Complete 500 Farming contracts',
		has: async ({ mahojiUser }) => {
			const contract = getFarmingContractOfUser(mahojiUser);
			return contract.contractsCompleted >= 500;
		}
	},
	{
		id: 4103,
		name: 'Unlock every slayer unlock',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_unlocks.length === Object.keys(SlayerTaskUnlocksEnum).length;
		}
	},
	{
		id: 4104,
		name: 'Complete 100 Item Contracts',
		has: async ({ mahojiUser }) => {
			return mahojiUser.total_item_contracts >= 100;
		}
	},
	{
		id: 4105,
		name: 'Achieve an Item Contract streak of 50',
		has: async ({ mahojiUser }) => {
			return mahojiUser.item_contract_streak >= 50;
		}
	},
	{
		id: 4106,
		name: 'Buy every dungeoneering reward',
		has: async ({ cl }) => {
			return dungBuyables.every(i => cl.has(i.item.id));
		}
	},
	{
		id: 4107,
		name: 'Slay 500 superior slayer creatures',
		has: async ({ mahojiUser }) => {
			return mahojiUser.slayer_superior_count >= 500;
		}
	},
	{
		id: 4108,
		name: 'Sacrifice 20b worth of items/GP',
		has: async ({ mahojiUser }) => {
			return mahojiUser.sacrificedValue >= 20_000_000_000;
		}
	},
	{
		id: 4109,
		name: 'Create an Infernal slayer helmet(i)',
		has: async ({ cl }) => {
			return cl.has('Infernal slayer helmet (i)');
		}
	}
];
