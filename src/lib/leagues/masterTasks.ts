import { sumArr } from 'e';
import { Bank } from 'oldschooljs';
import { LuckyImpling } from 'oldschooljs/dist/simulation/openables/Implings';

import { BitField } from '../constants';
import {
	all3rdAgeItems,
	chambersOfXericCL,
	cmbClothes,
	customPetsCL,
	fishingContestCL,
	godWarsDungeonCL,
	gorajanArcherOutfit,
	gorajanOccultOutfit,
	gorajanWarriorOutfit,
	naxxusCL
} from '../data/CollectionsExport';
import { slayerMaskHelms } from '../data/slayerMaskHelms';
import { implings } from '../implings';
import { Inventions } from '../invention/inventions';
import { MysteryImpling } from '../simulation/customImplings';
import { dungBuyables } from '../skilling/skills/dung/dungData';
import { ashes } from '../skilling/skills/prayer';
import Dwarven from '../skilling/skills/smithing/smithables/dwarven';
import { slayerUnlockableRewards } from '../slayer/slayerUnlocks';
import { getTameSpecies } from '../tames';
import { ItemBank } from '../types';
import { calcTotalLevel } from '../util';
import resolveItems from '../util/resolveItems';
import { Task } from './leaguesUtils';

export const masterTasks: Task[] = [
	{
		id: 4000,
		name: 'Build a Demonic Throne',
		has: async ({ poh }) => {
			return poh.throne === 13_671;
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
		name: 'Create every nightmare staff from scratch',
		has: async ({ cl }) => {
			return resolveItems([
				'Volatile nightmare staff',
				'Harmonised nightmare staff',
				'Eldritch nightmare staff',
				'Volatile orb',
				'Harmonised orb',
				'Eldritch orb'
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
		id: 4021,
		name: 'Complete the Inferno 30 Times',
		has: async ({ activityCounts }) => {
			return (activityCounts.Inferno ?? 0) >= 30;
		}
	},
	{
		id: 4022,
		name: 'Smelt 2000 Runite bars from scratch',
		has: async ({ smeltingStats }) => {
			return smeltingStats.amount('Runite bar') >= 2000;
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
		id: 4030,
		name: 'Reach total level 3000',
		has: async ({ skillsLevels }) => {
			return calcTotalLevel(skillsLevels) >= 3000;
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
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Stamina potion (3)', 'Stamina potion (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 1000
			);
		}
	},
	{
		id: 4034,
		name: 'Mix 5000 Saradomin brews.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Saradomin brew (3)', 'Saradomin brew (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 5000
			);
		}
	},
	{
		id: 4035,
		name: 'Mix 5000 Super restores.',
		has: async ({ herbloreStats }) => {
			return (
				sumArr(
					resolveItems(['Super restore (3)', 'Super restore (4)']).map(i => herbloreStats.pots.amount(i))
				) >= 5000
			);
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
			return resolveItems(['Dwarven warhammer', 'Broken dwarven warhammer']).every(i => cl.has(i));
		}
	},
	{
		id: 4045,
		name: 'Create every Dwarven item from scratch',
		has: async ({ cl, skillsLevels }) => {
			let totalInput = new Bank();
			for (const item of Dwarven) {
				if (skillsLevels.smithing < item.level) return false;
				if (!cl.has(item.id)) return false;
				totalInput.add(item.inputBars);
			}
			totalInput.add('Dwarven ore', totalInput.amount('Dwarven bar'));
			return cl.has(totalInput);
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
		name: 'Receive 500m Fletching',
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
		name: 'Receive 1b Agility',
		has: async ({ skillsXP }) => {
			return skillsXP.agility >= 1_000_000_000;
		}
	},
	{
		id: 4076,
		name: 'Receive 1b Cooking',
		has: async ({ skillsXP }) => {
			return skillsXP.cooking >= 1_000_000_000;
		}
	},
	{
		id: 4077,
		name: 'Receive 1b Fishing',
		has: async ({ skillsXP }) => {
			return skillsXP.fishing >= 1_000_000_000;
		}
	},
	{
		id: 4078,
		name: 'Receive 1b Mining',
		has: async ({ skillsXP }) => {
			return skillsXP.mining >= 1_000_000_000;
		}
	},
	{
		id: 4079,
		name: 'Receive 1b Smithing',
		has: async ({ skillsXP }) => {
			return skillsXP.smithing >= 1_000_000_000;
		}
	},
	{
		id: 4080,
		name: 'Receive 1b Woodcutting',
		has: async ({ skillsXP }) => {
			return skillsXP.woodcutting >= 1_000_000_000;
		}
	},
	{
		id: 4081,
		name: 'Receive 1b Firemaking',
		has: async ({ skillsXP }) => {
			return skillsXP.firemaking >= 1_000_000_000;
		}
	},
	{
		id: 4082,
		name: 'Receive 1b Runecraft',
		has: async ({ skillsXP }) => {
			return skillsXP.runecraft >= 1_000_000_000;
		}
	},
	{
		id: 4083,
		name: 'Receive 1b Crafting',
		has: async ({ skillsXP }) => {
			return skillsXP.crafting >= 1_000_000_000;
		}
	},
	{
		id: 4084,
		name: 'Receive 1b Prayer',
		has: async ({ skillsXP }) => {
			return skillsXP.prayer >= 1_000_000_000;
		}
	},
	{
		id: 4085,
		name: 'Receive 1b Fletching',
		has: async ({ skillsXP }) => {
			return skillsXP.fletching >= 1_000_000_000;
		}
	},
	{
		id: 4086,
		name: 'Receive 1b Farming',
		has: async ({ skillsXP }) => {
			return skillsXP.farming >= 1_000_000_000;
		}
	},
	{
		id: 4087,
		name: 'Receive 1b Herblore',
		has: async ({ skillsXP }) => {
			return skillsXP.herblore >= 1_000_000_000;
		}
	},
	{
		id: 4089,
		name: 'Receive 1b Thieving',
		has: async ({ skillsXP }) => {
			return skillsXP.thieving >= 1_000_000_000;
		}
	},
	{
		id: 4090,
		name: 'Receive 1b Hunter',
		has: async ({ skillsXP }) => {
			return skillsXP.hunter >= 1_000_000_000;
		}
	},
	{
		id: 4091,
		name: 'Receive 1b Construction',
		has: async ({ skillsXP }) => {
			return skillsXP.construction >= 1_000_000_000;
		}
	},
	{
		id: 4092,
		name: 'Receive 1b Magic',
		has: async ({ skillsXP }) => {
			return skillsXP.magic >= 1_000_000_000;
		}
	},
	{
		id: 4093,
		name: 'Receive 1b Attack',
		has: async ({ skillsXP }) => {
			return skillsXP.attack >= 1_000_000_000;
		}
	},
	{
		id: 4094,
		name: 'Receive 1b Strength',
		has: async ({ skillsXP }) => {
			return skillsXP.strength >= 1_000_000_000;
		}
	},
	{
		id: 4095,
		name: 'Receive 1b Defence',
		has: async ({ skillsXP }) => {
			return skillsXP.defence >= 1_000_000_000;
		}
	},
	{
		id: 4096,
		name: 'Receive 1b Ranged',
		has: async ({ skillsXP }) => {
			return skillsXP.ranged >= 1_000_000_000;
		}
	},
	{
		id: 4097,
		name: 'Receive 1b Hitpoints',
		has: async ({ skillsXP }) => {
			return skillsXP.hitpoints >= 1_000_000_000;
		}
	},
	{
		id: 4099,
		name: 'Receive 1b Dungeoneering',
		has: async ({ skillsXP }) => {
			return skillsXP.dungeoneering >= 1_000_000_000;
		}
	},
	{
		id: 4100,
		name: 'Receive 1b Slayer',
		has: async ({ skillsXP }) => {
			return skillsXP.slayer >= 1_000_000_000;
		}
	},
	{
		id: 4101,
		name: 'Receive 1b Invention',
		has: async ({ skillsXP }) => {
			return skillsXP.invention >= 1_000_000_000;
		}
	},
	{
		id: 4102,
		name: 'Complete 500 Farming contracts',
		has: async ({ user }) => {
			const contract = user.farmingContract();
			return contract.contract.contractsCompleted >= 500;
		}
	},
	{
		id: 4103,
		name: 'Unlock every slayer unlock',
		has: async ({ mahojiUser, user }) => {
			return (
				mahojiUser.slayer_unlocks.length >= slayerUnlockableRewards.length ||
				user.bitfield.includes(BitField.HadAllSlayerUnlocks)
			);
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
		has: async ({ userStats }) => {
			return userStats.slayer_superior_count >= 500;
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
	},
	{
		id: 4110,
		name: "Buy a Combatant's cape",
		has: async ({ cl }) => {
			return cl.has("Combatant's cape");
		}
	},
	{
		id: 4111,
		name: "Buy a Artisan's cape",
		has: async ({ cl }) => {
			return cl.has("Artisan's cape");
		}
	},
	{
		id: 4112,
		name: 'Buy a Support cape',
		has: async ({ cl }) => {
			return cl.has('Support cape');
		}
	},
	{
		id: 4113,
		name: "Buy a Gatherer's cape",
		has: async ({ cl }) => {
			return cl.has("Gatherer's cape");
		}
	},
	{
		id: 4114,
		name: 'Open 5000x TMB',
		has: async ({ opens }) => {
			return opens.amount('Tradeable mystery box') >= 5000;
		}
	},
	{
		id: 4115,
		name: 'Open 5000x UMB',
		has: async ({ opens }) => {
			return opens.amount('Untradeable mystery box') >= 5000;
		}
	},
	{
		id: 4116,
		name: 'Open 500x EMB',
		has: async ({ opens }) => {
			return opens.amount('Equippable mystery box') >= 500;
		}
	},
	{
		id: 4117,
		name: 'Open 500x CMB',
		has: async ({ opens }) => {
			return opens.amount('Clothing mystery box') >= 500;
		}
	},
	{
		id: 4118,
		name: 'Open 500x HMB',
		has: async ({ opens }) => {
			return opens.amount('Holiday mystery box') >= 500;
		}
	},
	{
		id: 4119,
		name: 'Open 500x PMB',
		has: async ({ opens }) => {
			return opens.amount('Pet mystery box') >= 500;
		}
	},
	{
		id: 4120,
		name: 'Sacrifice 10b GP',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.amount('Coins') >= 10_000_000_000;
		}
	},
	{
		id: 4121,
		name: 'Sacrifice 1000 different items',
		has: async ({ sacrificedBank }) => {
			return sacrificedBank.length >= 1000;
		}
	},
	{
		id: 4122,
		name: 'Hatch a tame which is atleast level 90',
		has: async ({ tames }) => {
			return tames.some(i => {
				const species = getTameSpecies(i);
				const level = i[`max_${species.relevantLevelCategory}_level`];
				return level >= 90;
			});
		}
	},
	{
		id: 4123,
		name: 'Reach 90% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 90;
		}
	},
	{
		id: 4124,
		name: 'Construct 100,000 objects',
		has: async ({ conStats }) => {
			return sumArr(conStats.items().map(i => i[1])) >= 100_000;
		}
	},
	{
		id: 4125,
		name: 'Chop 100,000 of any logs',
		has: async ({ woodcuttingStats }) => {
			return sumArr(woodcuttingStats.items().map(i => i[1])) >= 100_000;
		}
	},
	{
		id: 4126,
		name: 'Alch 10,000 of any item',
		has: async ({ alchingStats }) => {
			return sumArr(alchingStats.items().map(i => i[1])) >= 10_000;
		}
	},
	{
		id: 4127,
		name: 'Clean 100,000 herbs',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.herbs.items().map(i => i[1])) >= 100_000;
		}
	},
	{
		id: 4128,
		name: 'Mix 100,000 unf potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.unfPots.items().map(i => i[1])) >= 100_000;
		}
	},
	{
		id: 4129,
		name: 'Mix 100,000 potions',
		has: async ({ herbloreStats }) => {
			return sumArr(herbloreStats.pots.items().map(i => i[1])) >= 100_000;
		}
	},
	{
		id: 4130,
		name: 'Mine 50,000 ores',
		has: async ({ miningStats }) => {
			return sumArr(miningStats.items().map(i => i[1])) >= 50_000;
		}
	},
	{
		id: 4131,
		name: 'Burn 15,000 logs',
		has: async ({ firemakingStats }) => {
			return sumArr(firemakingStats.items().map(i => i[1])) >= 15_000;
		}
	},
	{
		id: 4132,
		name: 'Smith items from 90,000 Adamantite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Adamantite bar') >= 90_000;
		}
	},
	{
		id: 4133,
		name: 'Smith items from 50,000 Runite bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Runite bar') >= 50_000;
		}
	},
	{
		id: 4134,
		name: 'Cast 50,000 spells',
		has: async ({ spellCastingStats }) => {
			return sumArr(spellCastingStats.map(i => i.qty)) >= 50_000;
		}
	},
	{
		id: 4135,
		name: 'Acquire, complete and open 1000 Beginner clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (beginner)') >= 1000;
		}
	},
	{
		id: 4136,
		name: 'Acquire, complete and open 1000 Easy clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (easy)') >= 1000;
		}
	},
	{
		id: 4137,
		name: 'Acquire, complete and open 1000 Medium clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (medium)') >= 1000;
		}
	},
	{
		id: 4138,
		name: 'Acquire, complete and open 1000 Hard clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (hard)') >= 1000;
		}
	},
	{
		id: 4139,
		name: 'Acquire, complete and open 1000 Elite clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (elite)') >= 1000;
		}
	},
	{
		id: 4140,
		name: 'Acquire, complete and open 750 Master clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (master)') >= 750;
		}
	},
	{
		id: 4141,
		name: 'Acquire, complete and open 500 Grandmaster clues/caskets',
		has: async ({ actualClues }) => {
			return actualClues.amount('Clue scroll (grandmaster)') >= 500;
		}
	},
	{
		id: 4142,
		name: 'Reach 92% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 92;
		}
	},
	{
		id: 4143,
		name: 'Reach 93% CL completion',
		has: async ({ clPercent }) => {
			return clPercent >= 93;
		}
	},
	{
		id: 4144,
		name: 'Smith items from 200,000 Mithril bars',
		has: async ({ smithingSuppliesUsed }) => {
			return smithingSuppliesUsed.amount('Mithril bar') >= 200_000;
		}
	},
	{
		id: 4145,
		name: 'Create Gorajan igne claws',
		has: async ({ cl }) => {
			return cl.has('Gorajan igne claws');
		}
	},
	{
		id: 4146,
		name: 'Receive 5,000,000 XP from silverhawk boots',
		has: async ({ userStats }) => {
			return userStats.silverhawk_boots_passive_xp >= 5_000_000;
		}
	},
	{
		id: 4147,
		name: 'Upgrade 2000 clues with the clue upgrader',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.clue_upgrader_bank as ItemBank)) >= 2000;
		}
	},
	{
		id: 4148,
		name: 'Tan 70,000 hides with the portable tanner',
		has: async ({ userStats }) => {
			return sumArr(Object.values(userStats.portable_tanner_bank as ItemBank)) >= 70_000;
		}
	},
	{
		id: 4149,
		name: 'Finish the Naxxus CL',
		has: async ({ cl }) => {
			return naxxusCL.every(i => cl.has(i));
		}
	},
	{
		id: 4150,
		name: 'Scatter 5000 of every ashes',
		has: async ({ userStats }) => {
			let vals = Object.values(userStats.scattered_ashes_bank as ItemBank);
			return vals.length === ashes.length && vals.every(i => i >= 5000);
		}
	},
	{
		id: 4151,
		name: 'Catch 50 mystery impling and 100 of every other imping passively (excluding Lucky implings)',
		has: async ({ userStats }) => {
			let loot = new Bank(userStats.passive_implings_bank as ItemBank);
			const excludedImplings = [LuckyImpling.id, MysteryImpling.id];
			for (const implingId of Object.keys(implings)) {
				if (
					loot.amount(Number(MysteryImpling.id)) < 50 ||
					(!excludedImplings.includes(Number(implingId)) && loot.amount(Number(implingId)) < 100)
				) {
					return false;
				}
			}
			return true;
		}
	},
	{
		id: 4152,
		name: 'Open the Crystal chest 3000 times',
		has: async ({ opens }) => {
			return opens.amount('Crystal key') >= 3000;
		}
	},
	{
		id: 4153,
		name: 'Fletch 50,000 dragon darts',
		has: async ({ fletchedItems }) => {
			return fletchedItems.amount('Dragon dart') >= 50_000;
		}
	},
	{
		id: 4154,
		name: 'Obtain all Custom Slayer helms',
		has: async ({ user }) => {
			return slayerMaskHelms.every(mask => user.cl.has(mask.helm.id));
		}
	},
	{
		id: 4155,
		name: 'Fletch 100,000 Elder bows from scratch',
		has: async ({ user }) => {
			return ['Elder bow (u)', 'Elder bow', 'Flax', 'Elder logs', 'Bow string'].every(
				i => user.cl.amount(i) >= 100_000
			);
		}
	}
];
