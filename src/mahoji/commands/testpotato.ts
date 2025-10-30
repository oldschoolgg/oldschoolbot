import { EmbedBuilder } from '@oldschoolgg/discord.js';
import { randInt } from '@oldschoolgg/rng';
import { noOp, stringMatches, Time, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, Items, itemID, MAX_INT_JAVA } from 'oldschooljs';

import { type Prisma, xp_gains_skill_enum } from '@/prisma/main.js';
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
import {
	farmingPatchNames,
	getFarmingKeyFromName,
	userGrowingProgressStr
} from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import { getFarmingInfoFromUser } from '@/lib/skilling/skills/farming/utils/getFarmingInfo.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { slayerMasterChoices } from '@/lib/slayer/constants.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { allSlayerMonsters } from '@/lib/slayer/tasks/index.js';
import { Gear } from '@/lib/structures/Gear.js';
import { parseStringBank } from '@/lib/util/parseStringBank.js';
import { fetchBingosThatUserIsInvolvedIn } from '@/mahoji/commands/bingo.js';
import { gearViewCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';
import { allUsableItems } from '@/mahoji/lib/abstracted_commands/useCommand.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';

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
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					bank: {}
				}
			});
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

const thingsToWipe = ['bank', 'combat_achievements', 'cl', 'quests', 'buypayout', 'kc', 'cooldowns'] as const;

export const testPotatoCommand = globalConfig.isProduction
	? null
	: defineCommand({
			name: 'testpotato',
			description: 'Commands for making testing easier and faster.',
			options: [
				{
					type: 'Subcommand',
					name: 'party',
					description: 'Test party'
				},
				{
					type: 'Subcommand',
					name: 'confirmation',
					description: 'Test confirmations',
					options: [
						{
							type: 'Boolean',
							name: 'ephemeral',
							description: 'Only you can see the response (default false)',
							required: false
						},
						{
							type: 'User',
							name: 'other_person',
							description: 'Other person who must confirm too (optional',
							required: false
						},
						{
							type: 'User',
							name: 'another_person',
							description: 'Another person who must confirm too (optional',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'wipe',
					description: 'Wipe/reset a part of your account.',
					options: [
						{
							type: 'String',
							name: 'thing',
							description: 'The thing you want to wipe.',
							required: true,
							autocomplete: async () => {
								return thingsToWipe.map(i => ({ name: i, value: i }));
							}
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'spawn',
					description: 'Spawn stuff.',
					options: [
						{
							type: 'String',
							name: 'preset',
							description: 'Choose from some preset things to spawn.',
							choices: spawnPresets.map(i => ({ name: i[0], value: i[0] }))
						},
						{
							type: 'Boolean',
							name: 'collectionlog',
							description: 'Add these items to your collection log?'
						},
						{
							type: 'String',
							name: 'item',
							description: 'Spawn a specific item',
							autocomplete: async (value: string) => {
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
							type: 'String',
							name: 'items',
							description: 'Spawn many items at once using a bank string.'
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'setxp',
					description: 'Set skill kc.',
					options: [
						{
							type: 'String',
							name: 'skill',
							description: 'The skill.',
							required: true,
							choices: Object.values(Skills).map(s => ({ name: s.name, value: s.id }))
						},
						{
							type: 'Integer',
							name: 'xp',
							description: 'The xp you want.',
							required: true,
							min_value: 1,
							max_value: 200_000_000
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'setminigamekc',
					description: 'Set minigame kc.',
					options: [
						{
							type: 'String',
							name: 'minigame',
							description: 'The minigame you want to set your KC for.',
							required: true,
							autocomplete: async (value: string) => {
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
							type: 'Integer',
							name: 'kc',
							description: 'The minigame KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'reset',
					description: 'Reset things',
					options: [
						{
							type: 'String',
							name: 'thing',
							description: 'The thing to reset.',
							required: true,
							choices: thingsToReset.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'gear',
					description: 'Spawn and equip gear for a particular thing',
					options: [
						{
							type: 'String',
							name: 'thing',
							description: 'The thing to spawn gear for.',
							required: true,
							choices: gearPresets.map(i => ({ name: i.name, value: i.name }))
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'max',
					description: 'Set all your stats to the maximum level, and get max QP.'
				},
				{
					type: 'Subcommand',
					name: 'bitfield',
					description: 'Manage your bitfields',
					options: [
						{
							type: 'String',
							name: 'add',
							description: 'The bitfield to add',
							required: false,
							autocomplete: async (value: string) => {
								return Object.entries(BitFieldData)
									.filter(bf =>
										!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i[1].name, value: i[0] }));
							}
						},
						{
							type: 'String',
							name: 'remove',
							description: 'The bitfield to remove',
							required: false,
							autocomplete: async (value: string) => {
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
					type: 'Subcommand',
					name: 'setmonsterkc',
					description: 'Set monster kc.',
					options: [
						{
							type: 'String',
							name: 'monster',
							description: 'The monster you want to set your KC for.',
							required: true,
							autocomplete: async (value: string) => {
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
							type: 'Integer',
							name: 'kc',
							description: 'The monster KC you want.',
							required: true,
							min_value: 0,
							max_value: 10_000
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'irontoggle',
					description: 'Toggle being an ironman on/off.'
				},
				{
					type: 'Subcommand',
					name: 'forcegrow',
					description: 'Force a plant to grow.',
					options: [
						{
							type: 'String',
							name: 'patch_name',
							description: 'The patches you want to harvest.',
							required: true,
							choices: [
								{ name: 'All patches', value: 'all' },
								...farmingPatchNames.map(i => ({ name: i, value: i }))
							]
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'set',
					description: 'Set something',
					options: [
						{
							type: 'Integer',
							name: 'qp',
							description: 'Set your quest points.',
							required: false,
							min_value: 0,
							max_value: MAX_QP
						},
						{
							type: 'Boolean',
							name: 'all_ca_tasks',
							description: 'Finish all CA tasks.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'get_code',
					description: 'Get your secret code for the test dashboard',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'bingo_tools',
					description: 'Bingo tools',
					options: [
						{
							type: 'String',
							name: 'start_bingo',
							description: 'Make your bingo start now.',
							required: true,
							autocomplete: async (value: string, user: MUser) => {
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
					type: 'Subcommand',
					name: 'setslayertask',
					description: 'Set slayer task.',
					options: [
						{
							type: 'String',
							name: 'master',
							description: 'The master you wish to set your task.',
							required: true,
							choices: slayerMasterChoices
						},
						{
							type: 'String',
							name: 'monster',
							description: 'The monster you want to set your task as.',
							required: true,
							autocomplete: async (value: string) => {
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
							type: 'Integer',
							name: 'quantity',
							description: 'The task quantity you want to assign.',
							required: false,
							min_value: 0,
							max_value: 1000
						}
					]
				}
			],
			run: async ({ options, user, interaction }) => {
				if (globalConfig.isProduction) {
					Logging.logError('Test command ran in production', { userID: user.id });
					return 'This will never happen...';
				}

				if (options.party) {
					const party = await interaction.makeParty({
						maxSize: 5,
						minSize: 2,
						message: `Join the party!`,
						leader: user,
						ironmanAllowed: true
					});
					return `The party has now started with the following users: ${party.map(i => i.username).join(', ')}`;
				}
				if (options.confirmation) {
					const ephemeral = options.confirmation.ephemeral ?? false;
					const users = [user.id];
					if (options.confirmation.other_person) users.push(options.confirmation.other_person.user.id);
					if (options.confirmation.another_person) users.push(options.confirmation.another_person.user.id);
					if (ephemeral && users.length > 1) {
						return 'You cannot have multiple people confirm on an ephemeral message.';
					}
					await interaction.confirmation({
						content: `This is a normal confirmation. Users who must confirm: ${users.map(i => `<@${i}>`).join(', ')}`,
						users,
						// @ts-expect-error ddd
						ephemeral
					});
					return interaction.makePaginatedMessage({
						ephemeral: true,
						pages: [
							() => ({
								embeds: [
									new EmbedBuilder()
										.setTitle(`Page 1`)
										.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
								]
							}),
							() => ({
								embeds: [
									new EmbedBuilder()
										.setTitle(`Page 2`)
										.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
								]
							}),
							() => ({
								embeds: [
									new EmbedBuilder()
										.setTitle(`Page 3`)
										.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
								]
							}),
							() => ({
								embeds: [
									new EmbedBuilder()
										.setTitle(`Page 4`)
										.setImage(`https://cdn.oldschool.gg/monkey/${randInt(1, 39)}.webp`)
								]
							})
						]
					});
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
					if (thing === 'cooldowns') {
						await prisma.userStats.update({
							where: {
								user_id: BigInt(user.id)
							},
							data: {
								last_daily_timestamp: Date.now() - Time.Day
							}
						});
						return 'Reset all your KCs.';
					}
					if (thing === 'kc') {
						await user.statsUpdate({
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
						await prisma.user.update({
							where: {
								id: user.id
							},
							data: {
								finished_quest_ids: [],
								collectionLogBank: {}
							}
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
					const stats = await user.fetchStats();
					await user.statsUpdate({
						monster_scores: {
							...(stats.monster_scores as Record<string, unknown>),
							[monster.id]: options.setmonsterkc?.kc ?? 1
						}
					});
					return `Set your ${monster.name} KC to ${options.setmonsterkc.kc ?? 1}.`;
				}

				if (options.forcegrow) {
					const farmingDetails = await getFarmingInfoFromUser(user);
					const { patch_name } = options.forcegrow;
					const patchesToGrow =
						patch_name === 'all'
							? farmingDetails.patchesDetailed.filter(patch => patch.plant)
							: farmingDetails.patchesDetailed.filter(
									patch => patch.patchName === patch_name && patch.plant
								);
					if (patchesToGrow.length === 0) {
						return patch_name === 'all'
							? 'You have nothing planted in any patches.'
							: 'You have nothing planted there.';
					}
					const now = Date.now();
					const updates = Object.fromEntries(
						patchesToGrow.map(patch => [
							getFarmingKeyFromName(patch.patchName),
							{
								...farmingDetails.patches[patch.patchName],
								plantTime: now - Time.Month
							}
						])
					) as Prisma.UserUncheckedUpdateInput;

					await user.update(updates);
					return userGrowingProgressStr((await getFarmingInfoFromUser(user)).patchesDetailed);
				}

				if (options.setslayertask) {
					const usersTask = await user.fetchSlayerInfo();

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
		});
