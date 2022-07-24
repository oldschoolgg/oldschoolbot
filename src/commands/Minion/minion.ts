import { FormattedCustomEmoji } from '@sapphire/discord-utilities';
import { MessageEmbed } from 'discord.js';
import { chunk, sleep } from 'e';
import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Color, Emoji, MIMIC_MONSTER_ID, PerkTier, Time } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import combatCalculator from '../../lib/minions/functions/combatCalculator';
import findMonster from '../../lib/minions/functions/findMonster';
import removeAmmoFromUser from '../../lib/minions/functions/removeAmmoFromUser';
import removePotionsFromUser from '../../lib/minions/functions/removePotionsFromUser';
import removeRunesFromUser from '../../lib/minions/functions/removeRunesFromUser';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randomItemFromArray, round } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import { GearStat } from './../../lib/gear/types';
import { CombatsEnum } from './combatsetup';

const invalidMonster = (prefix: string) =>
	`That isn't a valid monster, the available monsters are: ${killableMonsters
		.map(mon => mon.name)
		.join(', ')}. For example, \`${prefix}minion kill 5 zulrah\``;
import { ClueTiers } from '../../lib/clues/clueTiers';
import { Emoji, lastTripCache } from '../../lib/constants';
import { DynamicButtons } from '../../lib/DynamicButtons';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingContract } from '../../lib/minions/farming/types';
import { blowpipeCommand } from '../../lib/minions/functions/blowpipeCommand';
import { runCommand } from '../../lib/settings/settings';
import { getFarmingInfo } from '../../lib/skilling/functions/getFarmingInfo';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse } from '../../lib/util';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { isUsersDailyReady } from '../../mahoji/lib/abstracted_commands/dailyCommand';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { minionBuyCommand } from '../../mahoji/lib/abstracted_commands/minionBuyCommand';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) => randArrItem(patMessages).replace('{name}', minionName);

const subCommands = [
	'clues',
	'buy',
	'pat',
	'opens',
	'info',
	'activities',
	'lapcounts',
	'cancel',
	'train',
	'tempcl',
	'blowpipe',
	'bp',
	'charge',
	'data'
];

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			aliases: ['m'],
			usage: `[${subCommands.join('|')}] [quantity:int{1}|name:...string] [name:...string] [name:...string]`,
			usageDelim: ' ',
			subcommands: true,
			requiredPermissionsForBot: ['EMBED_LINKS']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const [birdhouseDetails, mahojiUser, farmingDetails] = await Promise.all([
			calculateBirdhouseDetails(msg.author.id),
			mahojiUsersSettingsFetch(msg.author.id, { minion_farmingContract: true }),
			getFarmingInfo(msg.author.id)
		]);

		const dynamicButtons = new DynamicButtons({ channel: msg.channel, usersWhoCanInteract: [msg.author.id] });

		const cmdOptions = {
			msg,
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member
		};

		dynamicButtons.add({
			name: 'Auto Farm',
			emoji: Emoji.Farming,
			fn: () =>
				runCommand({
					commandName: 'farming',
					args: {
						auto_farm: {}
					},
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: true
		});

		const dailyIsReady = isUsersDailyReady(msg.author);
		if (dailyIsReady.isReady) {
			dynamicButtons.add({
				name: 'Claim Daily',
				emoji: Emoji.MoneyBag,
				fn: () =>
					runCommand({
						commandName: 'minion',
						args: { daily: {} },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: false
			});
		}

		if (msg.author.minionIsBusy) {
			dynamicButtons.add({
				name: 'Cancel Trip',
				emoji: Emoji.Minion,
				fn: () =>
					runCommand({
						commandName: 'minion',
						args: { cancel: {} },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: false
			});
		}

		dynamicButtons.add({
			name: 'Auto-Slay',
			emoji: Emoji.Slayer,
			fn: () =>
				runCommand({
					commandName: 'autoslay',
					args: [],
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: true
		});
		dynamicButtons.add({
			name: 'Check Patches',
			emoji: Emoji.Stopwatch,
			fn: () =>
				runCommand({
					commandName: 'farming',
					args: { check_patches: {} },
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: false
		});
		if (birdhouseDetails.isReady) {
			dynamicButtons.add({
				name: 'Birdhouse Run',
				emoji: '692946556399124520',
				fn: () =>
					runCommand({
						commandName: 'activities',
						args: { birdhouses: { action: 'harvest' } },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: true
			});
		}
		const contract = mahojiUser.minion_farmingContract as FarmingContract | null;
		const contractedPlant = farmingDetails.patchesDetailed.find(p => p.plant?.name === contract?.plantToGrow);
		if (msg.author.skillLevel(SkillsEnum.Farming) > 45 && (!contractedPlant || contractedPlant.ready !== false)) {
			dynamicButtons.add({
				name: 'Auto Farming Contract',
				emoji: '977410792754413668',
				fn: async () => {
					const result = await autoContract(msg.author, BigInt(msg.channel.id), BigInt(msg.author.id));
					return msg.channel.send(convertMahojiResponseToDJSResponse(result));
				},
				cantBeBusy: true
			});
		}

		const lastTrip = lastTripCache.get(msg.author.id);
		if (lastTrip && !msg.author.minionIsBusy) {
			dynamicButtons.add({
				name: `Repeat ${lastTrip.data.type} Trip`,
				fn: () =>
					lastTrip.continue({
						user: msg.author,
						userID: msg.author.id,
						member: msg.member,
						guildID: msg.guild?.id,
						channelID: msg.channel.id
					})
			});
		}

		const bank = msg.author.bank();

		for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
			.reverse()
			.slice(0, 3)) {
			dynamicButtons.add({
				name: `Do ${tier.name} Clue`,
				fn: () => {
					return runCommand({
						commandName: 'clue',
						args: { tier: tier.name },
						bypassInhibitors: true,
						...cmdOptions
					});
				},
				emoji: '365003979840552960',
				cantBeBusy: true
			});
		}

		dynamicButtons.render({
			isBusy: msg.author.minionIsBusy,
			messageOptions: { content: msg.author.minionStatus }
		});
	}

	async train(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion train`');
	}

	async data(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/tools patron stats`');
	}

	async lapcounts(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion stats stat:Personal Agility Stats`');
	}

	async charge(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/minion charge`');
	}

	async bp(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return this.blowpipe(msg, [input]);
	}

	async blowpipe(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return blowpipeCommand(msg, input);
	}

	async info(msg: KlasaMessage) {
		return runCommand({
			commandName: 'rp',
			args: ['c', msg.author],
			bypassInhibitors: true,
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member
		});
	}

	@requiresMinion
	async pat(msg: KlasaMessage) {
		return msg.channel.send(randomPatMessage(msg.author.minionName));
	}

	async clues(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion stats stat:Personal Clue Stats`');
	}

	@requiresMinion
	@minionNotBusy
	async kill(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		let messages: string[] = [];

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (!name) throw invalidMonster(msg.cmdPrefix);

		const monster =
			name === 'random'
				? randomItemFromArray(
						killableMonsters.filter(mon => msg.author.hasMonsterRequirements(mon)[0])
				  )
				: findMonster(name);
		if (!monster) throw invalidMonster(msg.cmdPrefix);

		// Check requirements
		const [hasReqs, reason] = msg.author.hasMonsterRequirements(monster);
		if (!hasReqs) throw reason;

		if (monster.immuneToCombatSkills) {
			for (let cs of monster.immuneToCombatSkills) {
				if (
					cs.toString().toLowerCase() ===
					msg.author.settings.get(UserSettings.Minion.CombatSkill)
				) {
					return msg.send(
						`${monster.name} can not be attacked using ${msg.author.settings.get(
							UserSettings.Minion.CombatSkill
						)}`
					);
				}
			}
		}
		let combatCalcInfo: [number, number, number, number, number, string[]] | undefined;
		combatCalcInfo = await combatCalculator(monster, msg, quantity);

		if (!combatCalcInfo) {
			throw `Something went wrong with the combatCalculator`;
		}
		let [combatDuration, hits, DPS, monsterKillSpeed, calcQuantity, potsUsed] = combatCalcInfo;

		let baseDuration = monster.noneCombatCalcTimeToFinish * calcQuantity;
		let noneCombat = false;
		if (
			baseDuration * 2 < combatDuration ||
			msg.author.settings.get(UserSettings.Minion.CombatSkill) === CombatsEnum.NoCombat
		) {
			noneCombat = true;
			combatDuration = baseDuration;
		} else if (combatDuration > msg.author.maxTripLength * 1.5) {
			return msg.send(
				`${msg.author.minionName} can't go on PvM trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${
					monster.name
				} is around ${Math.floor(msg.author.maxTripLength / (monsterKillSpeed * 1.3))}.`
			);
		}

		if (!noneCombat) {
			if (
				msg.author.settings.get(UserSettings.Minion.CombatSkill) === CombatsEnum.Range ||
				(msg.author.settings.get(UserSettings.Minion.CombatSkill) === CombatsEnum.Auto &&
					monster.defaultStyleToUse === GearStat.AttackRanged)
			) {
				messages.push(`Removed ${await removeAmmoFromUser(this.client, msg.author, hits)}`);
			}
			if (
				msg.author.settings.get(UserSettings.Minion.CombatSkill) === CombatsEnum.Mage ||
				(msg.author.settings.get(UserSettings.Minion.CombatSkill) === CombatsEnum.Auto &&
					monster.defaultStyleToUse === GearStat.AttackMagic)
			) {
				messages.push(
					`Removed ${await removeRunesFromUser(this.client, msg.author, hits)}`
				);
			}
			const potionStr = await removePotionsFromUser(
				this.client,
				msg.author,
				potsUsed,
				combatDuration
			);
			if (potionStr.includes('x')) {
				messages.push(
					`Removed ${await removePotionsFromUser(
						this.client,
						msg.author,
						potsUsed,
						combatDuration
					)}`
				);
			}
		}

		await addSubTaskToActivityTask<MonsterActivityTaskOptions>(this.client, {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			noneCombat,
			quantity: calcQuantity,
			duration: combatDuration,
			hits,
			type: Activity.MonsterKilling
		});

		let response = `${msg.author.minionName} is now killing ${calcQuantity}x ${
			monster.name
		}, it'll take around ${formatDuration(combatDuration)} to finish. Your DPS is ${round(
			DPS,
			2
		)}. The average kill time is ${formatDuration(monsterKillSpeed)} (Without banking/mechanics/respawn).`;

		if (noneCombat) {
			response += `\nNONE COMBAT TRIP due to bad gear/stats or minion none combat setting activated.`;
		}
		if (messages.length > 0) {
			response += `\n**Messages:** ${messages.join('\n')}.`;
		}

		return msg.send(response);
	}
	async buy(msg: KlasaMessage) {
		return msg.channel.send(
			convertMahojiResponseToDJSResponse(
				await minionBuyCommand(await mahojiUsersSettingsFetch(msg.author.id), false)
			)
		);
	}

	async opens(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion stats stat:Personal Open Stats`');
	}
}
