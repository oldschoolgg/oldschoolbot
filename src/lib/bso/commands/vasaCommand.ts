import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { BossInstance } from '@/lib/bso/structures/Boss.js';

import { randInt } from '@oldschoolgg/rng';
import { formatDuration, sumArr, Time } from '@oldschoolgg/toolkit';
import { EmbedBuilder, type InteractionReplyOptions } from 'discord.js';
import { Bank } from 'oldschooljs';

import { Gear } from '@/lib/structures/Gear.js';

export const vasaBISGear = new Gear({
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
});

export async function vasaCommand(
	interaction: MInteraction,
	user: MUser,
	channelID: string,
	quantity?: number
): Promise<string | InteractionReplyOptions> {
	const instance = new BossInstance({
		interaction,
		leader: user,
		id: EBSOMonster.VASA_MAGUS,
		baseDuration: Time.Minute * 15,
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
		bisGear: vasaBISGear,
		gearSetup: 'mage',
		itemCost: async data =>
			data.baseFood.multiply(data.kills).add(
				'Elder rune',
				sumArr(
					Array(data.kills)
						.fill(0)
						.map(() => randInt(55, 100))
				)
			),
		mostImportantStat: 'attack_magic',
		ignoreStats: ['attack_ranged', 'attack_crush', 'attack_slash', 'attack_stab'],
		food: () => new Bank(),
		settingsKeys: ['vasa_cost', 'vasa_loot'],
		channelId: channelID,
		activity: 'VasaMagus',
		massText: `${user.usernameOrMention} is assembling a team to fight Vasa Magus! Use the buttons below to join/leave.`,
		minSize: 1,
		solo: true,
		canDie: false,
		allowMoreThan1Solo: true,
		quantity
	});
	try {
		const { bossUsers } = await instance.start();
		const embed = new EmbedBuilder().setDescription(
			`Your team is off to fight ${instance.quantity}x Vasa Magus. The total trip will take ${formatDuration(
				instance.duration
			)}.

${bossUsers.map(u => `**${u.user.usernameOrMention}**: ${u.debugStr}`).join('\n\n')}
`
		);

		return {
			embeds: [embed.data],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.'
		};
	} catch (err: any) {
		console.error(err);
		return `The mass failed to start for this reason: ${err}.`;
	}
}
