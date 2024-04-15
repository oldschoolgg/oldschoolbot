import { mentionCommand } from '@oldschoolgg/toolkit';
import { Prisma, xp_gains_skill_enum } from '@prisma/client';
import { User } from 'discord.js';
import { noOp, Time, uniqueArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { convertLVLtoXP, itemID, toKMB } from 'oldschooljs/dist/util';

import { production } from '../../config';
import { allStashUnitsFlat, allStashUnitTiers } from '../../lib/clues/stashUnits';
import { CombatAchievements } from '../../lib/combat_achievements/combatAchievements';
import { BitField, MAX_INT_JAVA } from '../../lib/constants';
import { leaguesCreatables } from '../../lib/data/creatables/leagueCreatables';
import { Eatables } from '../../lib/data/eatables';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '../../lib/data/tob';
import killableMonsters, { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import potions from '../../lib/minions/data/potions';
import { mahojiUserSettingsUpdate } from '../../lib/MUser';
import { allOpenables } from '../../lib/openables';
import { tiers } from '../../lib/patreon';
import { Minigames } from '../../lib/settings/minigames';
import { prisma } from '../../lib/settings/prisma';
import { getFarmingInfo } from '../../lib/skilling/functions/getFarmingInfo';
import Skills from '../../lib/skilling/skills';
import Farming from '../../lib/skilling/skills/farming';
import { slayerMasterChoices } from '../../lib/slayer/constants';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { allSlayerMonsters } from '../../lib/slayer/tasks';
import { stringMatches } from '../../lib/util';
import { calcDropRatesFromBankWithoutUniques } from '../../lib/util/calcDropRatesFromBank';
import {
	FarmingPatchName,
	farmingPatchNames,
	getFarmingKeyFromName,
	userGrowingProgressStr
} from '../../lib/util/farmingHelpers';
import getOSItem from '../../lib/util/getOSItem';
import { logError } from '../../lib/util/logError';
import { parseStringBank } from '../../lib/util/parseStringBank';
import { userEventToStr } from '../../lib/util/userEvents';
import { getPOH } from '../lib/abstracted_commands/pohCommand';
import { MAX_QP } from '../lib/abstracted_commands/questCommand';
import { allUsableItems } from '../lib/abstracted_commands/useCommand';
import { BingoManager } from '../lib/bingo/BingoManager';
import { OSBMahojiCommand } from '../lib/util';
import { userStatsUpdate } from '../mahojiSettings';
import { fetchBingosThatUserIsInvolvedIn } from './bingo';

export async function giveMaxStats(user: MUser) {
	let updates: Prisma.UserUpdateArgs['data'] = {};
	for (const skill of Object.values(xp_gains_skill_enum)) {
		updates[`skills_${skill}`] = convertLVLtoXP(99);
	}
	await user.update({
		QP: MAX_QP,
		...updates
	});
}

async function givePatronLevel(user: MUser, tier: number) {
	const tierToGive = tiers[tier];
	const currentBitfield = user.bitfield;
	if (!tier || !tierToGive) {
		await user.update({
			bitfield: currentBitfield.filter(i => !tiers.map(t => t[1]).includes(i))
		});
		return 'Removed patron perks.';
	}
	const newBitField: BitField[] = [...currentBitfield, tierToGive[1]];
	await user.update({
		bitfield: uniqueArr(newBitField)
	});
	return `Gave you tier ${tierToGive[1] - 1} patron.`;
}

const gearPresets = [
	{
		name: 'ToB',
		melee: TOBMaxMeleeGear,
		mage: TOBMaxMageGear,
		range: TOBMaxRangeGear
	}
];

const thingsToReset = [
	{
		name: 'Everything/All',
		run: async (user: MUser) => {
			await prisma.slayerTask.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.commandUsage.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.gearPreset.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.giveaway.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } }).catch(noOp);
			await prisma.minigame.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.newUser.deleteMany({ where: { id: user.id } }).catch(noOp);
			await prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } }).catch(noOp);
			await prisma.user.deleteMany({ where: { id: user.id } }).catch(noOp);
			return 'Reset all your data.';
		}
	},
	{
		name: 'Bank',
		run: async (user: MUser) => {
			await user.update({ bank: {} });
			return 'Reset your bank.';
		}
	}
];

async function setMinigameKC(user: MUser, _minigame: string, kc: number) {
	const minigame = Minigames.find(m => m.column === _minigame.toLowerCase());
	if (!minigame) return 'No kc set because invalid minigame.';
	await prisma.minigame.update({
		where: {
			user_id: user.id
		},
		data: {
			[minigame.column]: kc
		}
	});
	return `Set your ${minigame.name} KC to ${kc}.`;
}

async function setXP(user: MUser, skillName: string, xp: number) {
	const skill = Object.values(Skills).find(c => c.id === skillName);
	if (!skill) return 'No xp set because invalid skill.';
	await user.update({
		[`skills_${skill.id}`]: xp
	});
	return `Set ${skill.name} XP to ${xp}.`;
}
const openablesBank = new Bank();
for (const i of allOpenables.values()) {
	openablesBank.add(i.id, 100);
}

const equippablesBank = new Bank();
for (const i of Items.filter(i => Boolean(i.equipment) && Boolean(i.equipable)).values()) {
	equippablesBank.add(i.id);
}

const farmingPreset = new Bank();
for (const plant of Farming.Plants) {
	farmingPreset.add(plant.inputItems.clone().multiply(100));
	if (plant.protectionPayment) {
		farmingPreset.add(plant.protectionPayment.clone().multiply(100));
	}
}
farmingPreset.add('Ultracompost', 10_000);
const usables = new Bank();
for (const usable of allUsableItems) usables.add(usable, 100);

const leaguesPreset = new Bank();
for (const a of leaguesCreatables) leaguesPreset.add(a.outputItems);

const allStashUnitItems = new Bank();
for (const unit of allStashUnitsFlat) {
	for (const i of [unit.items].flat(2)) {
		allStashUnitItems.add(i);
	}
}
for (const tier of allStashUnitTiers) {
	allStashUnitItems.add(tier.cost.clone().multiply(tier.units.length));
}

const potionsPreset = new Bank();
for (const potion of potions) {
	for (const actualPotion of potion.items) {
		potionsPreset.addItem(actualPotion, 100_000);
	}
}

const foodPreset = new Bank();
for (const food of Eatables.map(food => food.id)) {
	foodPreset.addItem(food, 100_000);
}

const runePreset = new Bank()
	.add('Air rune', MAX_INT_JAVA)
	.add('Mind rune', MAX_INT_JAVA)
	.add('Water rune', MAX_INT_JAVA)
	.add('Earth rune', MAX_INT_JAVA)
	.add('Fire rune', MAX_INT_JAVA)
	.add('Body rune', MAX_INT_JAVA)
	.add('Cosmic rune', MAX_INT_JAVA)
	.add('Chaos rune', MAX_INT_JAVA)
	.add('Nature rune', MAX_INT_JAVA)
	.add('Law rune', MAX_INT_JAVA)
	.add('Death rune', MAX_INT_JAVA)
	.add('Astral rune', MAX_INT_JAVA)
	.add('Blood rune', MAX_INT_JAVA)
	.add('Soul rune', MAX_INT_JAVA)
	.add('Dust rune', MAX_INT_JAVA)
	.add('Lava rune', MAX_INT_JAVA)
	.add('Mist rune', MAX_INT_JAVA)
	.add('Mud rune', MAX_INT_JAVA)
	.add('Smoke rune', MAX_INT_JAVA)
	.add('Steam rune', MAX_INT_JAVA);

const spawnPresets = [
	['openables', openablesBank],
	['random', new Bank()],
	['equippables', equippablesBank],
	['farming', farmingPreset],
	['usables', usables],
	['leagues', leaguesPreset],
	['stashunits', allStashUnitItems],
	['potions', potionsPreset],
	['food', foodPreset],
	['runes', runePreset]
] as const;

const thingsToWipe = ['bank', 'combat_achievements', 'cl', 'quests', 'buypayout', 'kc'] as const;

export const testPotatoCommand: OSBMahojiCommand | null = production
	? null
	: {
			name: 'testpotato',
			description: 'Commands for making testing easier and faster.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'wipe',
					description: 'Wipe/reset a part of your account.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'thing',
							description: 'The thing you want to wipe.',
							required: true,
							choices: thingsToWipe.map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'spawn',
					description: 'Spawn stuff.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'preset',
							description: 'Choose from some preset things to spawn.',
							choices: spawnPresets.map(i => ({ name: i[0], value: i[0] }))
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'collectionlog',
							description: 'Add these items to your collection log?'
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'Spawn a specific item',
							autocomplete: async value => {
								if (!value)
									return [{ name: 'Type something!', value: itemID('Twisted bow').toString() }];
								return Items.filter(item => item.name.toLowerCase().includes(value.toLowerCase())).map(
									i => ({
										name: `${i.name} (ID: ${i.id})`,
										value: i.id.toString()
									})
								);
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'items',
							description: 'Spawn many items at once using a bank string.'
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setxp',
					description: 'Set skill kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'skill',
							description: 'The skill.',
							required: true,
							choices: Object.values(Skills).map(s => ({ name: s.name, value: s.id }))
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'xp',
							description: 'The xp you want.',
							required: true,
							min_value: 1,
							max_value: 200_000_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setminigamekc',
					description: 'Set minigame kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'minigame',
							description: 'The minigame you want to set your KC for.',
							required: true,
							autocomplete: async value => {
								return Minigames.filter(i => {
									if (!value) return true;
									return [i.name.toLowerCase(), i.aliases].some(i => i.includes(value.toLowerCase()));
								}).map(i => ({
									name: i.name,
									value: i.column
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'kc',
							description: 'The minigame KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'reset',
					description: 'Reset things',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'thing',
							description: 'The thing to reset.',
							required: true,
							choices: thingsToReset.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'gear',
					description: 'Spawn and equip gear for a particular thing',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'thing',
							description: 'The thing to spawn gear for.',
							required: true,
							choices: gearPresets.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'max',
					description: 'Set all your stats to the maximum level, and get max QP.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'patron',
					description: 'Set your patron perk level.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The patron tier to give yourself.',
							required: true,
							choices: [
								{
									name: 'Non-patron',
									value: '0'
								},
								{
									name: 'Tier 1',
									value: '1'
								},
								{
									name: 'Tier 2',
									value: '2'
								},
								{
									name: 'Tier 3',
									value: '3'
								},
								{
									name: 'Tier 4',
									value: '4'
								},
								{
									name: 'Tier 5',
									value: '5'
								}
							]
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setmonsterkc',
					description: 'Set monster kc.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster',
							description: 'The monster you want to set your KC for.',
							required: true,
							autocomplete: async value => {
								return effectiveMonsters
									.filter(i => {
										if (!value) return true;
										return [i.name.toLowerCase(), i.aliases].some(i =>
											i.includes(value.toLowerCase())
										);
									})
									.map(i => ({
										name: i.name,
										value: i.name
									}));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'kc',
							description: 'The monster KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'irontoggle',
					description: 'Toggle being an ironman on/off.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'forcegrow',
					description: 'Force a plant to grow.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'patch_name',
							description: 'The patches you want to harvest.',
							required: true,
							choices: farmingPatchNames.map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'set',
					description: 'Set something',
					options: [
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'qp',
							description: 'Set your quest points.',
							required: false,
							min_value: 0,
							max_value: MAX_QP
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'all_ca_tasks',
							description: 'Finish all CA tasks.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'check',
					description: 'Check something',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster_droprates',
							description: 'Simulation to check droprates on a monster.',
							required: false,
							autocomplete: async value => {
								return killableMonsters
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({
										name: i.name,
										value: i.name
									}));
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'bingo_tools',
					description: 'Bingo tools',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'start_bingo',
							description: 'Make your bingo start now.',
							required: true,
							autocomplete: async (value: string, user: User) => {
								const bingos = await fetchBingosThatUserIsInvolvedIn(user.id);
								return bingos
									.map(i => new BingoManager(i))
									.filter(b => b.creatorID === user.id || b.organizers.includes(user.id))
									.filter(bingo => (!value ? true : bingo.id.toString() === value))
									.map(bingo => ({ name: bingo.title, value: bingo.id.toString() }));
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'setslayertask',
					description: 'Set slayer task.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'master',
							description: 'The master you wish to set your task.',
							required: true,
							choices: slayerMasterChoices
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster',
							description: 'The monster you want to set your task as.',
							required: true,
							autocomplete: async value => {
								const filteredMonsters = [...new Set(allSlayerMonsters)].filter(monster => {
									if (!value) return true;
									return [monster.name.toLowerCase(), ...monster.aliases].some(aliases =>
										aliases.includes(value.toLowerCase())
									);
								});
								return filteredMonsters.map(monster => ({
									name: monster.name,
									value: monster.name
								}));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The task quantity you want to assign.',
							required: false,
							min_value: 0,
							max_value: 1000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'events',
					description: 'See events',
					options: []
				}
			],
			run: async ({
				options,
				userID
			}: CommandRunOptions<{
				max?: {};
				patron?: { tier: string };
				gear?: { thing: string };
				reset?: { thing: string };
				setminigamekc?: { minigame: string; kc: number };
				setxp?: { skill: string; xp: number };
				spawn?: { preset?: string; collectionlog?: boolean; item?: string; items?: string };
				setmonsterkc?: { monster: string; kc: string };
				irontoggle?: {};
				forcegrow?: { patch_name: FarmingPatchName };
				wipe?: { thing: (typeof thingsToWipe)[number] };
				set?: { qp?: number; all_ca_tasks?: boolean };
				check?: { monster_droprates?: string };
				bingo_tools?: { start_bingo: string };
				setslayertask?: { master: string; monster: string; quantity: number };
				events?: {};
			}>) => {
				if (production) {
					logError('Test command ran in production', { userID: userID.toString() });
					return 'This will never happen...';
				}
				const user = await mUserFetch(userID.toString());
				if (options.events) {
					const events = await prisma.userEvent.findMany({
						where: {
							user_id: user.id
						},
						orderBy: {
							date: 'desc'
						}
					});
					return events.map(userEventToStr).join('\n');
				}
				if (options.bingo_tools) {
					if (options.bingo_tools.start_bingo) {
						const bingo = await prisma.bingo.findFirst({
							where: {
								id: Number(options.bingo_tools.start_bingo),
								creator_id: user.id
							}
						});
						if (!bingo) return 'Invalid bingo.';
						await prisma.bingo.update({
							where: {
								id: bingo.id
							},
							data: {
								start_date: new Date()
							}
						});
						return 'Your bingo start date has been set to this moment, so it has just started.';
					}
				}

				if (options.check) {
					if (options.check.monster_droprates) {
						const monster = killableMonsters.find(m =>
							stringMatches(m.name, options.check!.monster_droprates)
						);
						if (!monster) return 'Invalid monster';
						const qty = 1_000_000;
						const loot = monster.table.kill(qty, {});
						const droprates = calcDropRatesFromBankWithoutUniques(loot, qty);
						return {
							files: [
								{
									attachment: Buffer.from(`Total Kills: ${qty}
Total Value of Loot: ${loot.value()}
GP/hr(roughly): ${toKMB(loot.value() / (monster.timeToFinish * qty))}

Droprates:
${droprates.join('\n')}`),
									name: 'monsterinfo.txt'
								}
							]
						};
					}
				}

				if (options.set) {
					const { qp } = options.set;
					if (qp) {
						await user.update({
							QP: qp
						});
						return `Set your QP to ${qp}.`;
					}
					if (options.set.all_ca_tasks) {
						await user.update({
							completed_ca_task_ids: Object.values(CombatAchievements)
								.map(i => i.tasks.map(t => t.id))
								.flat()
						});
						return 'Finished all CA tasks.';
					}
				}
				if (options.irontoggle) {
					const current = user.isIronman;
					await user.update({
						minion_ironman: !current
					});
					return `You now ${!current ? 'ARE' : 'ARE NOT'} an ironman.`;
				}
				if (options.wipe) {
					let { thing } = options.wipe;
					if (thing === 'kc') {
						await userStatsUpdate(user.id, {
							monster_scores: {}
						});
						return 'Reset all your KCs.';
					}
					if (thing === 'buypayout') {
						await prisma.botItemSell.deleteMany({
							where: {
								user_id: user.id
							}
						});
						return 'Deleted all your buy payout records, so you have no tax rate accumulated.';
					}
					if (thing === 'bank') {
						await mahojiUserSettingsUpdate(user.id, {
							bank: {}
						});
						return 'Reset your bank.';
					}
					if (thing === 'cl') {
						await mahojiUserSettingsUpdate(user.id, {
							collectionLogBank: {},
							temp_cl: {}
						});
						await prisma.userStats.update({
							where: {
								user_id: BigInt(user.id)
							},
							data: {
								cl_array: [],
								cl_array_length: 0
							}
						});
						return 'Reset your collection log.';
					}
					if (thing === 'combat_achievements') {
						await user.update({
							completed_ca_task_ids: []
						});
						return 'Reset your combat achievements.';
					}
					if (thing === 'quests') {
						await user.update({
							finished_quest_ids: [],
							collectionLogBank: {}
						});
						return `Your QP, and completed quests, have been reset. You can set your QP to a certain number using ${mentionCommand(
							globalClient,
							'testpotato',
							'set'
						)}.`;
					}
					return 'Invalid thing to reset.';
				}
				if (options.max) {
					await getPOH(user.id);
					await prisma.playerOwnedHouse.update({
						where: {
							user_id: user.id
						},
						data: {
							pool: 29_241
						}
					});
					await roboChimpClient.user.upsert({
						where: {
							id: BigInt(user.id)
						},
						create: {
							id: BigInt(user.id),
							leagues_points_balance_osb: 25_000
						},
						update: {
							leagues_points_balance_osb: {
								increment: 25_000
							}
						}
					});
					await user.addItemsToBank({
						items: new Bank()
							.add('Rune pouch')
							.add('Blood rune', 100_000_000)
							.add('Death rune', 100_000_000)
							.add('Blood rune', 100_000_000)
							.add('Water rune', 100_000_000)
							.add('Saradomin brew(4)', 100_000_000)
							.add('Super restore(4)', 100_000_000)
							.add('Stamina potion(4)', 100_000_000)
							.add('Super combat potion(4)', 100_000_000)
							.add('Cooked karambwan', 100_000_000)
							.add('Ranging potion(4)', 100_000_000)
							.add('Coins', 100_000_000)
							.add('Shark', 100_000_000)
							.add('Vial of blood', 100_000_000)
							.add('Rune pouch')
							.add('Zamorakian spear')
							.add('Dragon warhammer')
							.add('Bandos godsword')
							.add('Toxic blowpipe')
							.add(runePreset)
							.add(foodPreset)
							.add(potionsPreset)
							.add(usables)
					});
					await user.update({
						GP: 5_000_000_000,
						slayer_points: 100_000,
						tentacle_charges: 10_000,
						sang_charges: 10_000,
						trident_charges: 10_000,
						serp_helm_charges: 10_000,
						blood_fury_charges: 10_000,
						tum_shadow_charges: 10_000,
						blood_essence_charges: 10_000,
						ash_sanctifier_charges: 10_000,
						celestial_ring_charges: 10_000,
						scythe_of_vitur_charges: 10_000,
						gear_mage: TOBMaxMageGear.raw() as any,
						gear_melee: TOBMaxMeleeGear.raw() as any,
						gear_range: TOBMaxRangeGear.raw() as any,
						blowpipe: {
							scales: 100_000,
							dartQuantity: 100_000,
							dartID: itemID('Dragon dart')
						}
					});
					await giveMaxStats(user);
					return 'Fully maxed your account, stocked your bank, charged all chargeable items.';
				}
				if (options.patron) {
					return givePatronLevel(user, Number(options.patron.tier));
				}
				if (options.gear) {
					const gear = gearPresets.find(i => stringMatches(i.name, options.gear?.thing))!;
					await user.update({
						gear_melee: gear.melee.raw() as any,
						gear_range: gear.range.raw() as any,
						gear_mage: gear.mage.raw() as any
					});
					return `Set your gear for ${gear.name}.`;
				}
				if (options.reset) {
					const resettable = thingsToReset.find(i => i.name === options.reset?.thing);
					if (!resettable) return 'Invalid thing to reset.';
					return resettable.run(user);
				}
				if (options.setminigamekc) {
					return setMinigameKC(user, options.setminigamekc.minigame, options.setminigamekc.kc);
				}
				if (options.setxp) {
					return setXP(user, options.setxp.skill, options.setxp.xp);
				}
				if (options.spawn) {
					const { preset, collectionlog, item, items } = options.spawn;
					const bankToGive = new Bank();
					if (preset) {
						const actualPreset = spawnPresets.find(i => i[0] === preset);
						if (!actualPreset) return 'Invalid preset';
						let b = actualPreset[1];
						if (actualPreset[0] === 'random') {
							b = new Bank();
							for (let i = 0; i < 1000; i++) {
								b.add(Items.random().id);
							}
						}
						bankToGive.add(b);
					}
					if (item) {
						try {
							bankToGive.add(getOSItem(item).id);
						} catch (err) {
							return err as string;
						}
					}
					if (items) {
						for (const [i, qty] of parseStringBank(items, undefined, true)) {
							bankToGive.add(i.id, qty || 1);
						}
					}

					await user.addItemsToBank({ items: bankToGive, collectionLog: Boolean(collectionlog) });
					return `Spawned: ${bankToGive.toString().slice(0, 500)}.`;
				}

				if (options.setmonsterkc) {
					const monster = effectiveMonsters.find(m =>
						stringMatches(m.name, options.setmonsterkc?.monster ?? '')
					);
					if (!monster) return 'Invalid monster';
					await userStatsUpdate(
						user.id,
						({ monster_scores }) => ({
							monster_scores: {
								...(monster_scores as Record<string, unknown>),
								[monster.id]: options.setmonsterkc?.kc ?? 1
							}
						}),
						{}
					);
					return `Set your ${monster.name} KC to ${options.setmonsterkc.kc ?? 1}.`;
				}
				if (options.forcegrow) {
					const farmingDetails = await getFarmingInfo(userID);
					const thisPlant = farmingDetails.patchesDetailed.find(
						p => p.plant?.seedType === options.forcegrow?.patch_name
					);
					if (!thisPlant || !thisPlant.plant) return 'You have nothing planted there.';
					const rawPlant = farmingDetails.patches[thisPlant.plant.seedType];

					await user.update({
						[getFarmingKeyFromName(thisPlant.plant.seedType)]: {
							...rawPlant,
							plantTime: Date.now() - Time.Month
						}
					});
					return userGrowingProgressStr((await getFarmingInfo(userID)).patchesDetailed);
				}

				if (options.setslayertask) {
					const user = await mUserFetch(userID);
					const usersTask = await getUsersCurrentSlayerInfo(user.id);

					const { monster, master } = options.setslayertask;

					const selectedMonster = allSlayerMonsters.find(m => stringMatches(m.name, monster));
					const selectedMaster = slayerMasters.find(
						sm => stringMatches(master, sm.name) || sm.aliases.some(alias => stringMatches(master, alias))
					);

					// Set quantity to 50 if user doesn't assign a quantity
					const quantity = options.setslayertask?.quantity ?? 50;

					const assignedTask = selectedMaster!.tasks.find(m => m.monster.id === selectedMonster?.id)!;

					if (!selectedMaster) return 'Invalid slayer master.';
					if (!selectedMonster) return 'Invalid monster.';
					if (!assignedTask) return `${selectedMaster.name} can not assign ${selectedMonster.name}.`;

					// Update an existing slayer task for the user
					if (usersTask.currentTask?.id) {
						await prisma.slayerTask.update({
							where: {
								id: usersTask.currentTask?.id
							},
							data: {
								quantity,
								quantity_remaining: quantity,
								slayer_master_id: selectedMaster.id,
								monster_id: selectedMonster.id,
								skipped: false
							}
						});
					} else {
						// Create a new slayer task for the user
						await prisma.slayerTask.create({
							data: {
								user_id: user.id,
								quantity,
								quantity_remaining: quantity,
								slayer_master_id: selectedMaster.id,
								monster_id: selectedMonster.id,
								skipped: false
							}
						});
					}

					await user.update({
						slayer_last_task: selectedMonster.id
					});

					return `You set your slayer task to ${selectedMonster.name} using ${selectedMaster.name}.`;
				}

				return 'Nothin!';
			}
	  };
