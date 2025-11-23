import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { BossInstance, gpCostPerKill } from '@/lib/bso/structures/Boss.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import { Gear } from '@/lib/structures/Gear.js';

export async function kgCommand(
	interaction: MInteraction,
	user: MUser,
	channelId: string,
	inputName: string,
	quantity: number | undefined
) {
	if (interaction) await interaction.defer();
	const type = inputName.toLowerCase().includes('mass') ? 'mass' : 'solo';
	const instance = new BossInstance({
		interaction,
		leader: user,
		id: EBSOMonster.KING_GOLDEMAR,
		baseDuration: Time.Minute * 120,
		skillRequirements: {
			attack: 105,
			strength: 105,
			defence: 105
		},
		speedMaxReduction: 45,
		boostMax: 40,
		itemBoosts: [
			['Axe of the high sungod', 20],
			['Drygore longsword', 10],
			['Offhand drygore longsword', 5],
			['Gorajan warrior helmet', 2],
			['Gorajan warrior top', 4],
			['Gorajan warrior legs', 2],
			['Gorajan warrior gloves', 1],
			['Gorajan warrior boots', 1],
			["Brawler's hook necklace", 4],
			['TzKal cape', 6]
		],
		customDenier: async () => {
			return [false];
		},
		bisGear: new Gear({
			head: 'Gorajan warrior helmet',
			body: 'Gorajan warrior top',
			legs: 'Gorajan warrior legs',
			hands: 'Gorajan warrior gloves',
			feet: 'Gorajan warrior boots',
			cape: 'TzKal cape',
			ring: 'Warrior ring(i)',
			'2h': 'Axe of the high sungod',
			neck: "Brawler's hook necklace"
		}),
		gearSetup: 'melee',
		itemCost: async data => data.baseFood.multiply(data.kills).add('Coins', gpCostPerKill(data.user) * data.kills),
		mostImportantStat: 'attack_slash',
		ignoreStats: ['attack_ranged', 'attack_magic'],
		food: () => new Bank(),
		settingsKeys: ['kg_cost', 'kg_loot'],
		channelId: channelId,
		activity: 'KingGoldemar',
		massText: `${user.usernameOrMention} is assembling a team to fight King Goldemar! Use the buttons below to join/leave.`,
		minSize: 1,
		solo: type === 'solo',
		canDie: true,
		kcLearningCap: 50,
		quantity
	});
	const { bossUsers } = await instance.start();
	const embed = new EmbedBuilder()
		.setDescription(
			`${type === 'solo' ? 'You approach' : 'Your group approaches'} the Kings' chambers, and ${
				type === 'solo' ? 'you bribe' : 'each of you bribes'
			} the Kings Guards with a big bag of gold (${toKMB(
				10_000_000
			)} each) to let you into his chambers. The guards accept the offer and let you in, as they run away. The total trip will take ${formatDuration(
				instance.duration
			)}.

${bossUsers.map(u => `**${u.user.usernameOrMention}**: ${u.debugStr}`).join('\n\n')}
`
		)
		.setImage('https://cdn.discordapp.com/attachments/357422607982919680/841789326648016896/Untitled-2.png');

	return {
		embeds: [embed],
		content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.'
	};
}
