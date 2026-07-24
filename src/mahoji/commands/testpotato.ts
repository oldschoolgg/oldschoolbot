import { userMention } from '@oldschoolgg/discord';
import { Items, itemID } from 'oldschooljs';

import { CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { BitFieldData, globalConfig } from '@/lib/constants.js';
import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';
import { MAX_QP } from '@/lib/minions/data/quests.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { farmingPatchNames } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import { slayerMasterChoices } from '@/lib/slayer/constants.js';
import { allSlayerMonsters } from '@/lib/slayer/tasks/index.js';
import { fetchBingosThatUserIsInvolvedIn } from '@/mahoji/commands/bingo.js';
import { BingoManager } from '@/mahoji/lib/bingo/BingoManager.js';
import { handleTestPotatoBingoTools } from '@/mahoji/lib/testPotato/bingoTools.js';
import { handleTestPotatoBitfield } from '@/mahoji/lib/testPotato/bitfield.js';
import { handleTestPotatoConfirmation } from '@/mahoji/lib/testPotato/confirmation.js';
import { handleTestPotatoForceGrow } from '@/mahoji/lib/testPotato/forceGrow.js';
import { handleTestPotatoGear } from '@/mahoji/lib/testPotato/gear.js';
import { getMaxUserValues, giveMaxStats, maxUser } from '@/mahoji/lib/testPotato/max.js';
import { gearPresets, spawnPresets } from '@/mahoji/lib/testPotato/presets.js';
import { thingsToReset, thingsToWipe } from '@/mahoji/lib/testPotato/resetOptions.js';
import { handleTestPotatoSetMonsterKC } from '@/mahoji/lib/testPotato/setMonsterKC.js';
import { handleTestPotatoSetSlayerTask } from '@/mahoji/lib/testPotato/setSlayerTask.js';
import { setMinigameKC, setXP } from '@/mahoji/lib/testPotato/setters.js';
import { handleTestPotatoSpawn } from '@/mahoji/lib/testPotato/spawn.js';
import { handleTestPotatoWipe } from '@/mahoji/lib/testPotato/wipe.js';

export { getMaxUserValues, giveMaxStats };

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
					name: 'ping',
					description: 'Test pinging',
					options: [
						{
							type: 'Boolean',
							name: 'should_ping',
							description: 'should it ping or not',
							required: true
						}
					]
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
							autocomplete: async ({ value }: StringAutoComplete) => {
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
							choices: [
								{ name: 'All skills', value: 'all' },
								...Object.values(Skills).map(s => ({ name: s.name, value: s.id }))
							]
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
							autocomplete: async ({ value }: StringAutoComplete) => {
								return [
									{ name: 'All minigames', value: 'all' },
									...Minigames.filter(i => {
										if (!value) return true;
										return [i.name.toLowerCase(), i.aliases].some(alias =>
											alias.includes(value.toLowerCase())
										);
									}).map(i => ({
										name: i.name,
										value: i.column
									}))
								].filter(i =>
									!value
										? true
										: i.name.toLowerCase().includes(value.toLowerCase()) ||
											i.value.includes(value.toLowerCase())
								);
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
							autocomplete: async ({ value }: StringAutoComplete) => {
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
							autocomplete: async ({ value }: StringAutoComplete) => {
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
							autocomplete: async ({ value }: StringAutoComplete) => {
								return [
									{ name: 'All monsters', value: 'all' },
									...effectiveMonsters
										.filter(i => {
											if (!value) return true;
											return [i.name.toLowerCase(), i.aliases].some(alias =>
												alias.includes(value.toLowerCase())
											);
										})
										.map(i => ({
											name: i.name,
											value: i.name
										}))
								].filter(i =>
									!value
										? true
										: i.name.toLowerCase().includes(value.toLowerCase()) ||
											i.value.toLowerCase().includes(value.toLowerCase())
								);
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
							description: 'The patches you want to force grow.',
							required: true,
							choices: [
								{ name: 'All patches', value: 'all' },
								{ name: 'Birdhouses', value: 'birdhouses' },
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
							autocomplete: async ({ value, userId }: StringAutoComplete) => {
								const bingos = await fetchBingosThatUserIsInvolvedIn(userId);
								return bingos
									.map(i => new BingoManager(i))
									.filter(b => b.creatorID === userId || b.organizers.includes(userId))
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
							autocomplete: async ({ value }: StringAutoComplete) => {
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
			run: async ({ options, user, interaction, rng }) => {
				if (globalConfig.isProduction) {
					Logging.logError('Test command ran in production', { userID: user.id });
					return 'This will never happen...';
				}

				if (options.party) {
					const party = await globalClient.makeParty({
						interaction,
						maxSize: 5,
						minSize: 2,
						message: `Join the party!`,
						leader: user,
						ironmanAllowed: true
					});
					return `The party has now started with the following users: ${party.map(i => i.username).join(', ')}`;
				}
				if (options.ping) {
					return {
						content: `${userMention(user.id)} hi`,
						allowedMentions: { users: options.ping.should_ping ? [user.id] : [] }
					};
				}
				if (options.confirmation) {
					return handleTestPotatoConfirmation(user, interaction, rng, options.confirmation);
				}

				if (options.bitfield) {
					return handleTestPotatoBitfield(user, options.bitfield);
				}
				if (options.bingo_tools) {
					return handleTestPotatoBingoTools(user, options.bingo_tools);
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
					return handleTestPotatoWipe(user, options.wipe.thing);
				}
				if (options.max) {
					return maxUser(user);
				}
				if (options.gear) {
					return handleTestPotatoGear(user, options.gear.thing);
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
					return handleTestPotatoSpawn(user, options.spawn);
				}

				if (options.setmonsterkc) {
					return handleTestPotatoSetMonsterKC(user, options.setmonsterkc);
				}

				if (options.forcegrow) {
					return handleTestPotatoForceGrow(user, options.forcegrow.patch_name);
				}

				if (options.setslayertask) {
					return handleTestPotatoSetSlayerTask(user, options.setslayertask);
				}

				return 'Nothin!';
			}
		});
