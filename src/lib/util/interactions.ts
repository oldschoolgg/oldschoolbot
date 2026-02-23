import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';

import type { ClueTier } from '@/lib/clues/clueTiers.js';
import { EmojiId } from '@/lib/data/emojis.js';
import { InteractionID } from '@/lib/InteractionID.js';

export function makeOpenCasketButton(tier: ClueTier) {
	const name: Uppercase<ClueTier['name']> = tier.name.toUpperCase() as Uppercase<ClueTier['name']>;
	const id = `OPEN_${name}_CASKET`;
	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(`Open ${tier.name} Casket`)
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Casket });
}

export function makeOpenSeedPackButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Open.SeedPack)
		.setLabel('Open Seed Pack')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Seedpack });
}

export function makeAutoContractButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.AutoFarmingContract)
		.setLabel('Auto Farming Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Seedpack });
}

export function makeAutoFarmButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.AutoFarm)
		.setLabel('Auto Farm')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Farming });
}

export function makeRepeatTripButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.RepeatTrip)
		.setLabel('Repeat Trip')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: '🔁' });
}

export function makeTearsOfGuthixButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.StartTearsOfGuthix)
		.setLabel('Start Tears of Guthix')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: '🐍' });
}

export function makeBirdHouseTripButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.DoBirdHouseRun)
		.setLabel('Birdhouse Run')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.BirdsNest });
}

export function makeAutoSlayButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Slayer.AutoSlay)
		.setLabel('Auto Slay')
		.setEmoji({ id: EmojiId.Slayer })
		.setStyle(ButtonStyle.Secondary);
}

export function makeClaimDailyButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.ClaimDaily)
		.setLabel('Minion Daily')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.MoneyBag });
}

export function makeNewSlayerTaskButton() {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.NewSlayerTask)
		.setLabel('New Slayer Task')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Slayer });
}

export function makeShootingStarButton(size: number) {
	return new ButtonBuilder()
		.setCustomId(InteractionID.Commands.DoShootingStar)
		.setLabel(`Mine Size ${size} Crashed Star`)
		.setEmoji({ name: '⭐' })
		.setStyle(ButtonStyle.Secondary);
}
