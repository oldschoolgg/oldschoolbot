import { roll } from '@oldschoolgg/rng';
import { Events, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { newChatHeadImage } from '@/lib/canvas/chatHeadImage.js';
import { petMessage } from '@/lib/util/displayCluesAndPets.js';

export async function capeGambleStatsCommand(user: MUser) {
	const stats = await user.fetchStats();

	return `You can gamble Fire capes, Infernal capes and Quivers like this: ${globalClient.mentionCommand('gamble', 'item')}.

**Fire Capes Gambled:** ${stats.firecapes_sacrificed}
**Infernal Capes Gambled:** ${stats.infernal_cape_sacrifices}
**Quivers Gambled:** ${stats.quivers_sacrificed}`;
}

const itemGambles = [
	{
		type: 'fire',
		item: Items.getOrThrow('Fire cape'),
		trackerKey: 'firecapes_sacrificed',
		chatHead: 'mejJal',
		chance: 200,
		success: {
			loot: Items.getOrThrow('Tzrek-Jad'),
			message: 'You lucky. Better train him good else TzTok-Jad find you, JalYt.'
		},
		failMessage: (newSacrificedCount: number) =>
			`You not lucky. Maybe next time, JalYt. This is the ${formatOrdinal(
				newSacrificedCount
			)} time you gamble cape.`
	},
	{
		type: 'infernal',
		item: Items.getOrThrow('Infernal cape'),
		trackerKey: 'infernal_cape_sacrifices',
		chatHead: 'ketKeh',
		chance: 100,
		success: {
			loot: Items.getOrThrow('Jal-nib-rek'),
			message: 'Luck be a TzHaar tonight. Jal-Nib-Rek is yours.'
		},
		failMessage: (newSacrificedCount: number) =>
			`No Jal-Nib-Rek for you. This is the ${formatOrdinal(newSacrificedCount)} time you gamble cape.`
	},
	{
		type: 'quiver',
		item: Items.getOrThrow("Dizana's quiver (uncharged)"),
		trackerKey: 'quivers_sacrificed',
		chatHead: 'minimus',
		chance: 200,
		success: {
			loot: Items.getOrThrow('Smol heredit'),
			message: 'He seems to like you. Smol heredit is yours.'
		},
		failMessage: (newSacrificedCount: number) =>
			`He doesn't want to go with you. Sorry. This is the ${formatOrdinal(
				newSacrificedCount
			)} time you gambled a quiver.`
	}
] as const;

export async function capeGambleCommand(user: MUser, type: string, interaction: MInteraction, autoconfirm = false) {
	const src = itemGambles.find(i => i.type === type);
	if (!src) return 'Invalid type. You can only gamble fire capes, infernal capes, or quivers.';
	const { item } = src;
	const key = src.trackerKey;
	const capesOwned = user.bank.amount(item.id);

	if (capesOwned < 1) return `You have no ${item.name}'s to gamble!`;

	if (!autoconfirm) {
		await interaction.confirmation(`Are you sure you want to gamble a ${item.name}?`);
	}

	// Double check after confirmation dialogue:
	await user.sync();
	if (user.bank.amount(item.id) < 1) return `You have no ${item.name}'s to gamble!`;

	await user.statsUpdate({
		[key]: {
			increment: 1
		}
	});
	const newSacrificedCount: number = await user.fetchUserStat(key);

	const { chance } = src;
	const pet = src.success.loot;
	const gotPet = roll(chance);
	const loot = gotPet ? new Bank().add(pet.id) : undefined;

	await user.transactItems({ itemsToAdd: loot, itemsToRemove: new Bank().add(item.id), collectionLog: true });
	let str = '';
	if (gotPet) {
		str += petMessage(loot);
		globalClient.emit(
			Events.ServerNotification,
			`**${user.badgedUsername}'s** just received their ${formatOrdinal(
				user.cl.amount(pet.id)
			)} ${pet.name} pet by sacrificing a ${item.name} for the ${formatOrdinal(newSacrificedCount)} time!`
		);
		return {
			content: str,
			files: [
				{
					name: 'image.jpg',
					buffer: await newChatHeadImage({
						content: src.success.message,
						head: src.chatHead
					})
				}
			]
		};
	}

	return {
		files: [
			{
				name: 'image.jpg',
				buffer: await newChatHeadImage({
					content: src.failMessage(newSacrificedCount),
					head: src.chatHead
				})
			}
		]
	};
}
