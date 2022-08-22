import { User } from 'discord.js';
import { Time, uniqueArr } from 'e';
import { Extendable, ExtendableStore, KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Emoji, Events, LEVEL_99_XP, MAX_TOTAL_LEVEL, MAX_XP, skillEmoji } from '../../lib/constants';
import { onMax } from '../../lib/events';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { AttackStyles } from '../../lib/minions/functions';
import { AddXpParams, KillableMonster } from '../../lib/minions/types';
import { prisma } from '../../lib/settings/prisma';
import { getMinigameScore, MinigameName, Minigames } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import Creatures from '../../lib/skilling/skills/hunter/creatures';
import { Creature, SkillsEnum } from '../../lib/skilling/types';
import { convertXPtoLVL, stringMatches, toKMB, toTitleCase } from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { minionStatus } from '../../lib/util/minionStatus';
import { minionName, skillLevel } from '../../lib/util/minionUtils';
import { activity_type_enum } from '.prisma/client';

const suffixes = new SimpleTable<string>()
	.add('🎉', 200)
	.add('🎆', 10)
	.add('🙌', 10)
	.add('🎇', 10)
	.add('🥳', 10)
	.add('🍻', 10)
	.add('🎊', 10)
	.add(Emoji.PeepoNoob, 1)
	.add(Emoji.PeepoRanger, 1)
	.add(Emoji.PeepoSlayer);

function levelUpSuffix() {
	return suffixes.roll().item;
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get minionStatus(this: User) {
		return minionStatus(this);
	}

	public async getKCByName(this: KlasaUser, kcName: string) {
		const mon = effectiveMonsters.find(
			mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName))
		);
		if (mon) {
			return [mon.name, this.getKC((mon as unknown as Monster).id)];
		}

		const minigame = Minigames.find(
			game => stringMatches(game.name, kcName) || game.aliases.some(alias => stringMatches(alias, kcName))
		);
		if (minigame) {
			return [minigame.name, await this.getMinigameScore(minigame.column)];
		}

		const creature = Creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));
		if (creature) {
			return [creature.name, this.getCreatureScore(creature)];
		}

		const special = [
			[['superior', 'superiors', 'superior slayer monster'], UserSettings.Slayer.SuperiorCount],
			[['tithefarm', 'tithe'], UserSettings.Stats.TitheFarmsCompleted]
		].find(s => s[0].includes(kcName));
		if (special) {
			return [special[0][0], await this.settings.get(special![1] as string)];
		}

		return [null, 0];
	}

	getCreatureScore(this: KlasaUser, creature: Creature) {
		return this.settings.get(UserSettings.CreatureScores)[creature.id] ?? 0;
	}

	// @ts-ignore 2784
	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	// @ts-ignore 2784
	public maxTripLength(this: User, activity?: activity_type_enum) {
		return calcMaxTripLength(this, activity);
	}

	// @ts-ignore 2784
	public get minionIsBusy(this: User): boolean {
		return minionIsBusy(this.id);
	}

	// @ts-ignore 2784
	public get minionName(this: User): string {
		return minionName(this);
	}

	public async addXP(this: User, params: AddXpParams): Promise<string> {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${params.skillName}`) as number;
		const currentLevel = this.skillLevel(params.skillName);
		const currentTotalLevel = this.totalLevel();

		const name = toTitleCase(params.skillName);

		const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;

		const newXP = Math.min(MAX_XP, currentXP + params.amount);
		const totalXPAdded = newXP - currentXP;
		const newLevel = convertXPtoLVL(Math.floor(newXP));

		// Pre-MAX_XP
		let preMax = -1;
		if (totalXPAdded > 0) {
			preMax = totalXPAdded;
			await prisma.xPGain.create({
				data: {
					user_id: BigInt(this.id),
					skill: params.skillName,
					xp: Math.floor(totalXPAdded),
					artificial: params.artificial ? true : null
				}
			});
		}

		// Post-MAX_XP
		if (params.amount - totalXPAdded > 0) {
			await prisma.xPGain.create({
				data: {
					user_id: BigInt(this.id),
					skill: params.skillName,
					xp: Math.floor(params.amount - totalXPAdded),
					artificial: params.artificial ? true : null,
					post_max: true
				}
			});
		}

		// If they reached a XP milestone, send a server notification.
		if (preMax !== -1) {
			for (const XPMilestone of [50_000_000, 100_000_000, 150_000_000, MAX_XP]) {
				if (newXP < XPMilestone) break;

				if (currentXP < XPMilestone && newXP >= XPMilestone) {
					this.client.emit(
						Events.ServerNotification,
						`${skill.emoji} **${this.username}'s** minion, ${
							this.minionName
						}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(params.skillName)}!`
					);
					break;
				}
			}
		}

		// If they just reached 99, send a server notification.
		if (currentLevel < 99 && newLevel >= 99) {
			const skillNameCased = toTitleCase(params.skillName);
			const [usersWith] = await prisma.$queryRawUnsafe<
				{
					count: string;
				}[]
			>(`SELECT COUNT(*) FROM users WHERE "skills.${params.skillName}" >= ${LEVEL_99_XP};`);

			let str = `${skill.emoji} **${this.username}'s** minion, ${
				this.minionName
			}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
				parseInt(usersWith.count) + 1
			)} to get 99 ${skillNameCased}.`;

			if (this.isIronman) {
				const [ironmenWith] = await prisma.$queryRawUnsafe<
					{
						count: string;
					}[]
				>(
					`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${LEVEL_99_XP};`
				);
				str += ` They are the ${formatOrdinal(parseInt(ironmenWith.count) + 1)} Ironman to get 99.`;
			}
			this.client.emit(Events.ServerNotification, str);
		}

		await this.settings.update(`skills.${params.skillName}`, Math.floor(newXP));

		let str = '';
		if (preMax !== -1) {
			str += params.minimal
				? `+${Math.ceil(preMax).toLocaleString()} ${skillEmoji[params.skillName]}`
				: `You received ${Math.ceil(preMax).toLocaleString()} ${skillEmoji[params.skillName]} XP`;
			if (params.duration && !params.minimal) {
				let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
				rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
				str += ` (${toKMB(rawXPHr)}/Hr)`;
			}

			if (currentTotalLevel < MAX_TOTAL_LEVEL && this.totalLevel() >= MAX_TOTAL_LEVEL) {
				str += '\n\n**Congratulations, your minion has reached the maximum total level!**\n\n';
				onMax(this);
			} else if (currentLevel !== newLevel) {
				str += params.minimal
					? `(Levelled up to ${newLevel})`
					: `\n**Congratulations! Your ${name} level is now ${newLevel}** ${levelUpSuffix()}`;
			}
		}
		return str;
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return skillLevel(this, skillName);
	}

	public totalLevel(this: User, returnXP = false) {
		const userXPs = Object.values(this.rawSkills) as number[];
		let totalLevel = 0;
		for (const xp of userXPs) {
			totalLevel += returnXP ? xp : convertXPtoLVL(xp);
		}
		return totalLevel;
	}

	// @ts-ignore 2784
	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id);
	}

	/**
	 * Toggle whether this user is busy or not, this adds another layer of locking the user
	 * from economy actions.
	 *
	 * @param busy boolean Whether the new toggled state will be busy or not busy.
	 */
	public toggleBusy(this: User, busy: boolean) {
		const client = this.client as KlasaClient;

		if (busy) {
			client.secondaryUserBusyCache.add(this.id);
		} else {
			client.secondaryUserBusyCache.delete(this.id);
		}
	}

	// @ts-ignore 2784
	public get isIronman(this: User) {
		return this.settings.get(UserSettings.Minion.Ironman);
	}

	public async setAttackStyle(this: User, newStyles: AttackStyles[]) {
		await this.settings.update(UserSettings.AttackStyle, uniqueArr(newStyles), {
			arrayAction: 'overwrite'
		});
	}

	public resolveAvailableItemBoosts(this: User, monster: KillableMonster) {
		const boosts = new Bank();
		if (monster.itemInBankBoosts) {
			for (const boostSet of monster.itemInBankBoosts) {
				let highestBoostAmount = 0;
				let highestBoostItem = 0;

				// find the highest boost that the player has
				for (const [itemID, boostAmount] of Object.entries(boostSet)) {
					const parsedId = parseInt(itemID);
					if (
						monster.wildy
							? !this.hasItemEquippedAnywhere(parsedId)
							: !this.hasItemEquippedOrInBank(parsedId)
					) {
						continue;
					}
					if (boostAmount > highestBoostAmount) {
						highestBoostAmount = boostAmount;
						highestBoostItem = parsedId;
					}
				}

				if (highestBoostAmount && highestBoostItem) {
					boosts.add(highestBoostItem, highestBoostAmount);
				}
			}
		}
		return boosts.bank;
	}

	getMinigameScore(this: User, id: MinigameName): Promise<number> {
		return getMinigameScore(this.id, id);
	}
}
