/*
import { CommandStore, KlasaMessage } from 'klasa';

import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Ancient from '../../lib/skilling/skills/combat/magic/castables/Ancient';
import Standard from '../../lib/skilling/skills/combat/magic/castables/Standard';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import { Castable } from './../../lib/skilling/types';

export enum CombatsEnum {
	Melee = 'melee',
	Range = 'range',
	Mage = 'mage',
	Auto = 'auto',
	NoCombat = 'nocombat'
}

const dartTier: string[] = [
	'bronze dart',
	'iron dart',
	'steel dart',
	'black dart',
	'mithril dart',
	'adamant dart',
	'rune dart',
	'dragon dart'
];

// No Lunar at this point, vengence etc isn't useful here.
const castables: Castable[] = [...Standard, ...Ancient];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '[melee|mage|range|auto|nocombat] [combatStyle:string] [combatSpell:...string]',
			usageDelim: ' ',
			aliases: ['cs']
		});
	}

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[combatSkill, combatStyle, combatSpell]: [string, string, string]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.channel.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change combat style!`
			);
		}
		const oldCombatSkill = msg.author.settings.get(UserSettings.Minion.CombatSkill);
		if (!combatSkill) {
			return msg.channel.send(
				`${msg.author.minionName} is currently using combat skill ${oldCombatSkill}. To swap skill type \`${msg.cmdPrefix}combatsetup melee/range/mage/auto/nocombat\`.`
			);
		}

		if (!combatStyle) {
			for (const currentEnum of Object.values(CombatsEnum)) {
				if (currentEnum.toLowerCase() === combatSkill.toLowerCase()) {
					await msg.author.settings.update(UserSettings.Minion.CombatSkill, currentEnum);
					break;
				}
			}

			msg.author.log(`Changed combat skill to ${combatSkill}`);

			return msg.channel.send(
				`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill}.`
			);
		}

		if (combatSkill === 'melee') {
			combatStyle = combatStyle.toLowerCase();
			const weapon = msg.author.getGear('melee').equippedWeapon();
			if (weapon === null || weapon.weapon === null) {
				throw 'No weapon is equipped.';
			}
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, CombatsEnum.Melee);

			for (let stance of weapon!.weapon!.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === combatStyle) {
					await msg.author.settings.update(UserSettings.Minion.MeleeCombatStyle, combatStyle);
					await msg.author.settings.update(UserSettings.Minion.MeleeAttackStyle, stance.attack_style);

					return msg.channel.send(
						`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill}, combat style to ${combatStyle} and attack style to ${stance.attack_style}.`
					);
				}
			}

			return msg.channel.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the styles that the current equipped weapon ${
					weapon?.name
				} have. The following combat styles is possible: ${weapon?.weapon?.stances
					.map(styles => styles.combat_style)
					.join(', ')}.`
			);
		}

		if (combatSkill === 'range') {
			combatStyle = combatStyle.toLowerCase();
			const weapon = msg.author.getGear('range').equippedWeapon();
			let changedDartTier = false;
			if (combatSpell && dartTier.includes(combatSpell.toLowerCase())) {
				changedDartTier = true;
				await msg.author.settings.update(UserSettings.Minion.DefaultDartToUse, combatSpell.toLowerCase());
			}
			if (weapon === null || weapon.weapon === null) {
				throw 'No weapon is equipped.';
			}
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, CombatsEnum.Range);

			for (let stance of weapon!.weapon!.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === combatStyle) {
					await msg.author.settings.update(UserSettings.Minion.RangeCombatStyle, combatStyle);
					await msg.author.settings.update(UserSettings.Minion.RangeAttackStyle, combatStyle);

					return msg.channel.send(
						`${
							msg.author.minionName
						} changed main combat skill from ${oldCombatSkill} to ${combatSkill}, combat style to ${combatStyle} and attack style to ${combatStyle}. ${
							changedDartTier ? `And changed default dart to ${combatSpell.toLowerCase()}.` : ''
						}`
					);
				}
			}

			return msg.channel.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the styles that the current equipped weapon ${
					weapon?.name
				} have. The following combat styles is possible: ${weapon?.weapon?.stances
					.map(styles => styles.combat_style)
					.join(', ')}.`
			);
		}

		if (combatSkill === 'mage') {
			combatStyle = combatStyle.toLowerCase();
			const weapon = msg.author.getGear('mage').equippedWeapon();
			await msg.author.settings.update(UserSettings.Minion.CombatSkill, CombatsEnum.Mage);

			if (combatStyle === 'standard' || combatStyle === 'defensive') {
				if (!combatSpell) {
					await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, combatStyle);

					return msg.channel.send(
						`${
							msg.author.minionName
						} changed main combat skill from ${oldCombatSkill} to ${combatSkill} and combat style to ${combatStyle}, your current combat spell is ${msg.author.settings.get(
							UserSettings.Minion.CombatSpell
						)}.`
					);
				}
				combatSpell = combatSpell.toLowerCase();

				console.log(weapon?.name.toLowerCase());

				if (combatSpell === 'iban blast') {
					if (weapon === null || weapon.weapon === null) {
						throw 'No weapon is equipped.';
					}
					if (
						weapon.name.toLowerCase() !== "iban's staff" &&
						weapon.name.toLowerCase() !== "iban's staff (u)"
					) {
						throw "No variation of iban's staff is equipped for spell Iban Blast.";
					}
				}

				const CombatSpells = castables.filter(
					_spell => _spell.category.toLowerCase() === 'combat' && _spell.baseMaxHit
				);

				const Spell = CombatSpells.find(_spell => stringMatches(_spell.name.toLowerCase(), combatSpell));

				if (!Spell) {
					return msg.channel.send(
						`The combat spell \`${combatSpell}\` dosen't match any of the available combat spells. The following combat spells is possible: ${CombatSpells.map(
							spell => spell.name
						).join(', ')}.`
					);
				}

				await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, combatStyle);

				await msg.author.settings.update(UserSettings.Minion.CombatSpell, Spell.name);

				return msg.channel.send(
					`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill}, combat style to ${combatStyle} and combat spell to ${Spell.name}.`
				);
			}

			if (
				weapon?.name.toLowerCase() === 'trident of the seas' ||
				weapon?.name.toLowerCase() === 'trident of the seas (e)' ||
				weapon?.name.toLowerCase() === 'trident of the swamp' ||
				weapon?.name.toLowerCase() === 'trident of the swamp (e)'
			) {
				if (weapon === null || weapon.weapon === null) {
					throw 'No trident seems to be equipped or fetched data is wrong.';
				}
				for (let stance of weapon!.weapon!.stances) {
					if (stance === null) {
						continue;
					}
					if (stance.combat_style.toLowerCase() === combatStyle) {
						await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, combatStyle);
						await msg.author.settings.update(UserSettings.Minion.CombatSpell, 'wind strike');

						return msg.channel.send(
							`${msg.author.minionName} changed main combat skill from ${oldCombatSkill} to ${combatSkill} and combat style to ${combatStyle}.`
						);
					}
				}
				return msg.channel.send(
					`The combatstyle \`${combatStyle}\` dosen't match any of the styles that the current equipped weapon ${
						weapon?.name
					} have. The following combat styles is possible: ${weapon?.weapon?.stances
						.map(styles => styles.combat_style)
						.join(', ')}.`
				);
			}

			return msg.channel.send(
				`The combatstyle \`${combatStyle}\` dosen't match any of the available styles. The following combat styles is possible: Standard, Defensive or if a trident is equipped Accurate or Longrange.`
			);
		}
		return msg.channel.send('Unexpected error');
	}
}
*/