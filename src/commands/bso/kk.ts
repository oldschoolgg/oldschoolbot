import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji } from '../../lib/constants';
import { torvaOutfit } from '../../lib/data/CollectionsExport';
import { GearSetupTypes } from '../../lib/gear';
import { KalphiteKingMonster } from '../../lib/kalphiteking';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BossInstance } from '../../lib/structures/Boss';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[qty:int] [solo]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	async run(msg: KlasaMessage, [qty = NaN, solo = '']: [number, string]) {
		const instance = new BossInstance({
			leader: msg.author,
			id: KalphiteKingMonster.id,
			baseDuration: KalphiteKingMonster.timeToFinish * 0.65,
			baseFoodRequired: KalphiteKingMonster.healAmountNeeded!,
			skillRequirements: {
				prayer: 95,
				attack: 90,
				strength: 90,
				defence: 90
			},
			itemBoosts: [
				['Drygore mace', 14],
				['Offhand drygore mace', 5]
			],
			customDenier: async () => {
				return [false];
			},
			bisGear: new Gear({
				head: 'Torva full helm',
				body: 'Torva platebody',
				legs: 'Torva platelegs',
				hands: 'Torva gloves',
				feet: 'Torva boots',
				cape: 'Abyssal cape',
				ring: 'Ignis ring(i)',
				weapon: 'Drygore mace',
				shield: 'Offhand drygore mace',
				neck: "Brawler's hook necklace"
			}),
			gearSetup: GearSetupTypes.Melee,
			itemCost: async data => {
				const kc = data.user.getKC(KalphiteKingMonster.id);
				let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30))) + 1;
				const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));
				return new Bank()
					.add('Saradomin brew(4)', brewsNeeded)
					.add('Super restore(4)', restoresNeeded)
					.multiply(data.kills);
			},
			mostImportantStat: 'attack_crush',
			food: () => new Bank(),
			settingsKeys: [ClientSettings.EconomyStats.KalphiteKingCost, ClientSettings.EconomyStats.KalphiteKingLoot],
			channel: msg.channel as TextChannel,
			activity: Activity.KalphiteKing,
			massText: `${msg.author.username} is doing a ${KalphiteKingMonster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			minSize: 1,
			solo: solo === 'solo',
			canDie: true,
			customDeathChance: (user, preCalcedDeathChance) => {
				const meleeGear = user.getGear('melee');
				let baseDeathChance = 80;
				for (const torvaPiece of torvaOutfit) {
					if (meleeGear.hasEquipped([torvaPiece])) {
						baseDeathChance -= 5;
					}
				}
				if (meleeGear.stats.attack_crush >= 200) {
					baseDeathChance -= 20;
				}
				const userKc = msg.author.getKC(KalphiteKingMonster.id);
				if (userKc > 1) baseDeathChance -= Math.min(20, userKc / 20);
				baseDeathChance -= (100 - preCalcedDeathChance) / 10;
				return baseDeathChance;
			},
			kcLearningCap: 500,
			quantity: qty,
			allowMoreThan1Solo: true,
			allowMoreThan1Group: true
		});

		try {
			if (msg.flagArgs.s1mulat3) {
				return msg.channel.send({ files: [await instance.simulate()] });
			}
			const { bossUsers } = await instance.start();
			return msg.channel.send(
				`Your team is off to fight ${
					instance.quantity
				}x Kalphite King.\nThe total trip will take ${formatDuration(instance.duration)}.\n\n${bossUsers
					.map(u => `**${u.user.username}**: ${u.debugStr}`)
					.join('\n')}`
			);
		} catch (err) {
			return msg.channel.send(`The mass failed to start for this reason: ${err.message}.`);
		}
	}
}
