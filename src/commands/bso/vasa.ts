import { MessageEmbed, TextChannel } from 'discord.js';
import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji, Time } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear/types';
import { VasaMagus } from '../../lib/minions/data/killableMonsters/custom/VasaMagus';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BossInstance } from '../../lib/structures/Boss';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			aliases: ['kg']
		});
	}

	async run(msg: KlasaMessage) {
		const instance = new BossInstance({
			leader: msg.author,
			id: VasaMagus.id,
			baseDuration: Time.Minute * 15,
			baseFoodRequired: 400,
			skillRequirements: {
				magic: 110
			},
			itemBoosts: [
				['Virtus wand', 10],
				['Virtus book', 5],
				['Gorajan occult helmet', 2],
				['Gorajan occult top', 3],
				['Gorajan occult legs', 2],
				['Gorajan occult gloves', 1],
				['Gorajan occult boots', 1],
				['Arcane blast necklace', 3],
				['Vasa cloak', 7]
			],
			customDenier: async () => {
				return [false];
			},
			bisGear: new Gear({
				head: 'Gorajan occult helmet',
				body: 'Gorajan occult top',
				legs: 'Gorajan occult legs',
				hands: 'Gorajan occult gloves',
				feet: 'Gorajan occult boots',
				cape: 'Vasa cloak',
				ring: 'Seers ring(i)',
				weapon: 'Virtus wand',
				shield: 'Virtus book',
				neck: 'Arcane blast necklace'
			}),
			gearSetup: GearSetupTypes.Mage,
			itemCost: async () => new Bank().add('Elder rune', randInt(55, 100)),
			mostImportantStat: 'attack_magic',
			food: () => new Bank(),
			settingsKeys: [
				ClientSettings.EconomyStats.VasaCost,
				ClientSettings.EconomyStats.VasaLoot
			],
			channel: msg.channel as TextChannel,
			activity: Activity.VasaMagus,
			massText: `${msg.author.username} is assembling a team to fight Vasa Magus! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			minSize: 1,
			solo: true,
			canDie: false
		});
		try {
			if (msg.flagArgs.s1mulat3) {
				return msg.channel.send(await instance.simulate());
			}
			const { bossUsers } = await instance.start();
			const embed = new MessageEmbed().setDescription(
				`Your team is off to fight Vasa Magus. The total trip will take ${formatDuration(
					instance.duration
				)}.

${bossUsers.map(u => `**${u.user.username}**: ${u.debugStr}`).join('\n\n')}
`
			);

			return msg.channel.send(embed);
		} catch (err) {
			return msg.channel.send(`The mass failed to start for this reason: ${err.message}.`);
		}
	}
}
