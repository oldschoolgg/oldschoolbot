import { randArrItem, randInt } from '@oldschoolgg/rng';
import { noOp, stringMatches, uniqueArr } from '@oldschoolgg/toolkit';
import { type Prisma, xp_gains_skill_enum } from '@prisma/client';
import { ApplicationCommandOptionType, MessageFlags, type User } from 'discord.js';
import { Bank, convertLVLtoXP, Items, itemID, MAX_INT_JAVA } from 'oldschooljs';

import { allStashUnitsFlat, allStashUnitTiers } from '@/lib/clues/stashUnits.js';
import { CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { BitFieldData, globalConfig } from '@/lib/constants.js';
import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '@/lib/data/cox.js';
import { leaguesCreatables } from '@/lib/data/creatables/leagueCreatables.js';
import { Eatables } from '@/lib/data/eatables.js';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '@/lib/data/tob.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { mahojiUserSettingsUpdate } from '@/lib/MUser.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import potions from '@/lib/minions/data/potions.js';
import { MAX_QP, quests } from '@/lib/minions/data/quests.js';
import { allOpenables } from '@/lib/openables.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { slayerMasterChoices } from '@/lib/slayer/constants.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';
import { allSlayerMonsters } from '@/lib/slayer/tasks/index.js';
import { Gear } from '@/lib/structures/Gear.js';
import { logError } from '@/lib/util/logError.js';
import { parseStringBank } from '@/lib/util/parseStringBank.js';
import { userEventToStr } from '@/lib/util/userEvents.js';
import { fetchBingosThatUserIsInvolvedIn } from '@/mahoji/commands/bingo.js';
import { gearViewCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';
import { allUsableItems } from '@/mahoji/lib/abstracted_commands/useCommand.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import { userStatsUpdate } from '@/mahoji/mahojiSettings.js';
import { testBotKvStore } from '@/testing/TestBotStore.js';

export function getMaxUserValues() {
	const updates: Omit<Prisma.UserUpdateArgs['data'], 'id'> = {};
	for (const skill of Object.values(xp_gains_skill_enum)) {
		updates[`skills_${skill}`] = convertLVLtoXP(99);
	}
	return {
		QP: MAX_QP,
		slayer_points: 50_000,
		nmz_points: 50_000,
		volcanic_mine_points: 500_000,
		carpenter_points: 5_000_000,
		zeal_tokens: 500_000,
		lms_points: 500_000,
		...updates
	};
}

export async function giveMaxStats(user: MUser) {
	return user.update(getMaxUserValues());
}

const coloMelee = new Gear();
for (const gear of Items.resolveItems([
	'Torva full helm',
	'Infernal cape',
	'Amulet of blood fury',
	'Torva platebody',
	'Torva platelegs',
	'Primordial boots',
	'Ultor ring',
	'Scythe of vitur'
])) {
	coloMelee.equip(Items.getOrThrow(gear));
}

const coloRange = new Gear();
for (const gear of Items.resolveItems([
	"Dizana's quiver",
	'Masori mask (f)',
	'Necklace of anguish',
	'Masori body (f)',
	'Masori chaps (f)',
	'Pegasian boots',
	'Venator ring',
	'Dragon arrow',
	'Twisted bow'
])) {
	coloRange.equip(Items.getOrThrow(gear));
}

const gearPresets = [
	{
		name: 'Cox',
		melee: COXMaxMeleeGear,
		mage: COXMaxMageGear,
		range: COXMaxRangeGear
	},
	{
		name: 'ToB',
		melee: TOBMaxMeleeGear,
		mage: TOBMaxMageGear,
		range: TOBMaxRangeGear
	},
	{
		name: 'Colosseum',
		melee: coloMelee,
		range: coloRange,
		mage: coloRange
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

export const testPotatoCommand: OSBMahojiCommand | null = globalConfig.isProduction
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
					name: 'bitfield',
					description: 'Manage your bitfields',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'add',
							description: 'The bitfield to add',
							required: false,
							autocomplete: async value => {
								return Object.entries(BitFieldData)
									.filter(bf =>
										!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i[1].name, value: i[0] }));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'remove',
							description: 'The bitfield to remove',
							required: false,
							autocomplete: async value => {
								return Object.entries(BitFieldData)
									.filter(bf =>
										!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i[1].name, value: i[0] }));
							}
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
					name: 'get_code',
					description: 'Get your secret code for the test dashboard',
					options: []
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
				bitfield?: { add?: string; remove?: string };
				gear?: { thing: string };
				reset?: { thing: string };
				setminigamekc?: { minigame: string; kc: number };
				setxp?: { skill: string; xp: number };
				spawn?: { preset?: string; collectionlog?: boolean; item?: string; items?: string };
				setmonsterkc?: { monster: string; kc: string };
				irontoggle?: {};
				wipe?: { thing: (typeof thingsToWipe)[number] };
				set?: { qp?: number; all_ca_tasks?: boolean };
				get_code?: {};
				bingo_tools?: { start_bingo: string };
				setslayertask?: { master: string; monster: string; quantity: number };
				events?: {};
			}>) => {
				if (globalConfig.isProduction) {
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
				if (options.bitfield) {
					const bitInput = options.bitfield.add ?? options.bitfield.remove;
					const bitEntry = Object.entries(BitFieldData).find(i => i[0] === bitInput);
					const action: 'add' | 'remove' = options.bitfield.add ? 'add' : 'remove';
					if (!bitEntry) {
						return Object.entries(BitFieldData)
							.map(entry => `**${entry[0]}:** ${entry[1]?.name}`)
							.join('\n');
					}
					const bit = Number.parseInt(bitEntry[0]);

					if (
						!bit ||
						!(BitFieldData as any)[bit] ||
						[7, 8].includes(bit) ||
						(action !== 'add' && action !== 'remove')
					) {
						return 'Invalid bitfield.';
					}

					let newBits = [...user.bitfield];

					if (action === 'add') {
						if (newBits.includes(bit)) {
							return "Already has this bit, so can't add.";
						}
						newBits.push(bit);
					} else {
						if (!newBits.includes(bit)) {
							return "Doesn't have this bit, so can't remove.";
						}
						newBits = newBits.filter(i => i !== bit);
					}

					await user.update({
						bitfield: uniqueArr(newBits)
					});

					return `${action === 'add' ? 'Added' : 'Removed'} '${(BitFieldData as any)[bit].name}' bit.`;
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

				if (options.get_code) {
					const existingCode = testBotKvStore.get(`user.${user.id}.code`);

					let finalCode = existingCode;
					if (!existingCode) {
						const words = [
							'monkey',
							'chicken',
							'bandos',
							'nex',
							'cow',
							'dragon',
							'bronze',
							'goblin',
							'zamorak',
							'saradomin',
							'armadyl',
							'kraken',
							'swan',
							'wildy',
							'slayer',
							'agility',
							'cooking',
							'fishing',
							'mining',
							'smithing',
							'runecraft',
							'crafting',
							'prayer',
							'fletching',
							'farming',
							'herblore',
							'hunter',
							'magic',
							'attack',
							'strength',
							'defence',
							'ranged',
							'hitpoints',
							'ahrim',
							'guthans',
							'torags',
							'veracs',
							'inferno',
							'jad',
							'crystal',
							'torva',
							'dharoks'
						];
						const newCode = `${randArrItem(words)}${randInt(0, 9)}`;
						testBotKvStore.set(`user.${user.id}.code`, newCode);
						finalCode = newCode;
					}

					return {
						content: `Your secret code for the dashboard is: \`${finalCode}\` - do not share with anyone.

Warning: Visiting a test dashboard may let developers see your IP address. Attempting to abuse a test dashboard may result in a ban.`,
						flags: [MessageFlags.Ephemeral]
					};
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
							completed_ca_task_ids: Object.values(CombatAchievements).flatMap(i =>
								i.tasks.map(t => t.id)
							)
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
					const { thing } = options.wipe;
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
						venator_bow_charges: 10_000,
						gear_mage: TOBMaxMageGear.raw() as any,
						gear_melee: TOBMaxMeleeGear.raw() as any,
						gear_range: TOBMaxRangeGear.raw() as any,
						blowpipe: {
							scales: 100_000,
							dartQuantity: 100_000,
							dartID: itemID('Dragon dart')
						},
						finished_quest_ids: quests.map(q => q.id)
					});
					await giveMaxStats(user);
					return 'Fully maxed your account, stocked your bank, charged all chargeable items.';
				}
				if (options.gear) {
					const gear = gearPresets.find(i => stringMatches(i.name, options.gear?.thing))!;

					for (const type of ['melee', 'range', 'mage'] as const) {
						const currentGear = gear[type];
						if (currentGear.ammo && Items.getItem(currentGear.ammo.item)?.stackable) {
							currentGear.ammo.quantity = 10000;
						}
					}

					await user.update({
						gear_melee: gear.melee.raw() as any,
						gear_range: gear.range.raw() as any,
						gear_mage: gear.mage.raw() as any
					});

					return gearViewCommand(user, 'all', false);
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
							bankToGive.add(Items.getOrThrow(item).id);
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
					const stats = await user.fetchStats({ monster_scores: true });
					await userStatsUpdate(
						user.id,
						{
							monster_scores: {
								...(stats.monster_scores as Record<string, unknown>),
								[monster.id]: options.setmonsterkc?.kc ?? 1
							}
						},
						{}
					);
					return `Set your ${monster.name} KC to ${options.setmonsterkc.kc ?? 1}.`;
				}

				if (options.setslayertask) {
					const usersTask = await getUsersCurrentSlayerInfo(user.id);

					const { monster, master } = options.setslayertask;

					const selectedMonster = allSlayerMonsters.find(m => stringMatches(m.name, monster));
					const selectedMaster = slayerMasters.find(
						sm => stringMatches(master, sm.name) || sm.aliases.some(alias => stringMatches(master, alias))
					);

					// Set quantity to 50 if user doesn't assign a quantity
					const quantity = options.setslayertask?.quantity ?? 50;

					const assignedTask = selectedMaster?.tasks.find(m => m.monster.id === selectedMonster?.id)!;

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
