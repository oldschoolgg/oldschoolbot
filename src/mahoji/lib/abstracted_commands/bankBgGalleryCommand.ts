import { ButtonBuilder, ButtonStyle, EmbedBuilder, SpecialResponse } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import type { CommandResponse } from '@/discord/commands/commandTypes.js';
import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { BitFieldData, PerkTier } from '@/lib/constants.js';
import type { BankBackground } from '@/lib/minions/data/bankBackgrounds.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { bankBgCommand } from './bankBgCommand.js';
import { getBankBackgroundEligibility } from './bankBgHelpers.js';

const PREVIEW_BANK = new Bank({
	'Twisted bow': 1,
	'Scythe of vitur (uncharged)': 1,
	'Sanguinesti staff (uncharged)': 1,
	'Dragon claws': 1,
	'Elysian spirit shield': 1,
	'Kodai wand': 1,
	'Armadyl chestplate': 1,
	'Armadyl chainskirt': 1,
	'Armadyl helmet': 1,
	'Bandos chestplate': 1,
	'Bandos tassets': 1,
	"Inquisitor's hauberk": 1,
	"Inquisitor's faceguard": 1,
	"Inquisitor's plateskirt": 1,
	'Justiciar chestguard': 1,
	'Justiciar faceguard': 1,
	'Justiciar legguards': 1,
	'Ghrazi rapier': 1,
	'Ancient godsword': 1,
	'Armadyl godsword': 1,
	'Bandos godsword': 1,
	'Saradomin godsword': 1,
	'Zamorak godsword': 1,
	'Elder maul': 1,
	'Toxic blowpipe': 1,
	'Ring of endurance (uncharged)': 1,
	'Pegasian boots': 1,
	'Primordial boots': 1,
	'Eternal boots': 1,
	'Dragon hunter crossbow': 1,
	Coins: 50_000_000,
	'Blood rune': 10_000,
	'Death rune': 8_000,
	'Dragon dart': 500
});

const previewCache = new Map<number, Buffer>();

const BUTTON_TIMEOUT = Time.Minute * 5;

function formatPatronTier(tier: PerkTier | 0) {
	if (tier === 0) return 'None';
	if (tier === PerkTier.One) return 'Booster';
	return `Tier ${tier - 1}`;
}

async function getPreviewImage(background: BankBackground) {
	const cached = previewCache.get(background.id);
	if (cached) return cached;
	const { image } = await bankImageTask.generateBankImage({
		title: `${background.name} Preview`,
		bank: PREVIEW_BANK.clone(),
		flags: { background: background.id, compact: 1, wide: 1 },
		showValue: false
	});
	previewCache.set(background.id, image);
	return image;
}

function buildComponents({
	buttonIds,
	backgroundCount,
	isApplyDisabled
}: {
	buttonIds: Record<'prev' | 'next' | 'apply' | 'close', string>;
	backgroundCount: number;
	isApplyDisabled: boolean;
}) {
	const rows: ButtonBuilder[][] = [];
	if (backgroundCount > 1) {
		rows.push([
			new ButtonBuilder().setCustomId(buttonIds.prev).setEmoji({ name: '◀️' }).setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(buttonIds.next).setEmoji({ name: '▶️' }).setStyle(ButtonStyle.Secondary)
		]);
	}
	rows.push([
		new ButtonBuilder()
			.setCustomId(buttonIds.apply)
			.setLabel('Apply background')
			.setStyle(ButtonStyle.Success)
			.setDisabled(isApplyDisabled),
		new ButtonBuilder().setCustomId(buttonIds.close).setLabel('Close').setStyle(ButtonStyle.Secondary)
	]);
	return rows;
}

function buildCostLine(background: BankBackground) {
	const parts: string[] = [];
	if (background.gpCost) parts.push(`${background.gpCost.toLocaleString()} GP`);
	if (background.itemCost && background.itemCost.length > 0) parts.push(background.itemCost.toString());
	if (parts.length === 0) return 'None';
	return parts.join(' + ');
}

function buildCollectionLogLine(background: BankBackground, user: MUser) {
	if (!background.collectionLogItemsNeeded) return null;
	const requiredItems = background.collectionLogItemsNeeded.items();
	const owned = requiredItems.filter(([item, qty]) => user.cl.amount(item.id) >= qty).length;
	return `${owned}/${requiredItems.length} items logged${owned === requiredItems.length ? '' : ' (needs more)'}`;
}

function buildSkillLine(background: BankBackground, user: MUser) {
	if (!background.skillsNeeded) return null;
	const requirementText = formatSkillRequirements(background.skillsNeeded);
	const hasReqs = user.hasSkillReqs(background.skillsNeeded);
	return `${requirementText} (${hasReqs ? 'complete' : 'incomplete'})`;
}

function formatAvailability(background: BankBackground, hasStoreUnlock: boolean) {
	if (background.available) {
		return 'Available now';
	}
	return hasStoreUnlock ? 'Unlocked via store' : 'Unavailable';
}

function buildStatusText({ isCurrent, lockReason }: { isCurrent: boolean; lockReason: string | null }) {
	if (isCurrent) {
		return '🎨 Currently equipped';
	}
	if (lockReason) {
		return `🔒 ${lockReason}`;
	}
	return '✅ Ready to equip';
}

async function sendBankBgResponse(interaction: MInteraction, response: Awaited<CommandResponse>) {
	if (!response) return;
	if (
		response === SpecialResponse.PaginatedMessageResponse ||
		response === SpecialResponse.RespondedManually ||
		response === SpecialResponse.SilentErrorResponse
	) {
		return;
	}
	if (!interaction.deferred && !interaction.replied) {
		await interaction.reply(response);
		return;
	}
	await interaction.followUp(response);
}

async function safeDeferMessageUpdate(interaction: MInteraction) {
	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferredMessageUpdate();
	}
}

async function replyOrFollowUp(interaction: MInteraction, options: BaseReplySendableMessage) {
	if (!interaction.deferred && !interaction.replied) {
		return interaction.reply(options);
	}
	return interaction.followUp(options);
}

export async function bankBgGalleryCommand(user: MUser, interaction: MInteraction) {
	const userPerkTier = await user.fetchPerkTier();
	const storeUnlocks = new Set(user.user.store_bitfield);
	const backgrounds = bankImageTask.backgroundImages.filter(
		bg => user.isModOrAdmin() || bg.available || (bg.storeBitField ? storeUnlocks.has(bg.storeBitField) : false)
	);
	if (backgrounds.length === 0) {
		return 'There are no bank backgrounds available to browse right now.';
	}
	let currentIndex = 0;
	const prefix = `BANKBG_GALLERY_${interaction.id}`;
	const buttonIds = {
		prev: `${prefix}_PREV`,
		next: `${prefix}_NEXT`,
		apply: `${prefix}_APPLY`,
		close: `${prefix}_CLOSE`
	};

	const buildPage = async (): Promise<BaseSendableMessage> => {
		const background = backgrounds[currentIndex];
		const hasStoreUnlock = background.storeBitField ? storeUnlocks.has(background.storeBitField) : false;
		const eligibility = await getBankBackgroundEligibility({ user, background, perkTier: userPerkTier });
		const lockReason = eligibility.canUse ? null : (eligibility.failure?.ui ?? null);
		const isCurrent = user.user.bankBackground === background.id;
		const previewBuffer = await getPreviewImage(background);
		const fileName = `bankbg_preview_${background.id}.png`;
		const status = buildStatusText({ isCurrent, lockReason });
		const availability = formatAvailability(background, hasStoreUnlock || user.isModOrAdmin());
		const costLine = buildCostLine(background);
		const collectionLine = buildCollectionLogLine(background, user);
		const skillLine = buildSkillLine(background, user);
		const sacrificeLine = background.sacValueRequired
			? `${toKMB(background.sacValueRequired)} required (You: ${toKMB(Number(user.user.sacrificedValue))})`
			: null;
		const storeLine = background.storeBitField
			? hasStoreUnlock
				? 'Unlocked'
				: 'Requires permanent store unlock'
			: null;
		const bitfieldLine = background.bitfield
			? user.bitfield.includes(background.bitfield)
				? 'Unlocked'
				: (BitFieldData[background.bitfield]?.name ?? 'Special unlock required')
			: null;
		const perkTierLine = background.perkTierNeeded
			? `${formatPatronTier(background.perkTierNeeded)} (You: ${formatPatronTier(userPerkTier)})`
			: `None (You: ${formatPatronTier(userPerkTier)})`;
		const instructions =
			'Use ◀️/▶️ to browse backgrounds. Apply a background directly from this menu once it is unlocked.';
		const lines = [
			`**Status:** ${status}`,
			`**Perk Tier Required:** ${perkTierLine}`,
			`**Availability:** ${availability}`,
			`**Cost:** ${costLine}`,
			storeLine ? `**Store Unlock:** ${storeLine}` : null,
			bitfieldLine ? `**Special Unlock:** ${bitfieldLine}` : null,
			sacrificeLine ? `**Sacrificed Value:** ${sacrificeLine}` : null,
			skillLine ? `**Skills:** ${skillLine}` : null,
			collectionLine ? `**Collection Log:** ${collectionLine}` : null,
			background.name === 'Pets'
				? '**Note:** Requires Rocky, Bloodhound, Giant squirrel or Baby chinchompa in your collection log.'
				: null,
			lockReason && !isCurrent ? `**Locked because:** ${lockReason}` : null,
			'',
			instructions,
			'_Previews use a sample bank to showcase each style._'
		].filter(Boolean) as string[];
		const embed = new EmbedBuilder()
			.setTitle(`Bank background: ${background.name}`)
			.setDescription(lines.join('\n'))
			.setFooter({ text: `Background ${currentIndex + 1}/${backgrounds.length}` })
			.setImage(`attachment://${fileName}`)
			.setColor(isCurrent ? 0xf1c40f : lockReason ? 0xe74c3c : 0x2ecc71);
		return {
			embeds: [embed],
			files: [{ name: fileName, buffer: previewBuffer }],
			components: buildComponents({
				buttonIds,
				backgroundCount: backgrounds.length,
				isApplyDisabled: Boolean(lockReason) || isCurrent
			})
		};
	};

	await interaction.defer({ ephemeral: true });
	const initialResponse = await interaction.replyWithResponse(await buildPage());
	if (!initialResponse) {
		return 'Something went wrong while opening the gallery. Please try again.';
	}

	const collector = globalClient.createInteractionCollector({
		interaction,
		messageId: initialResponse.message_id,
		channelId: interaction.channelId,
		users: [interaction.userId],
		filter: btn => Boolean(btn.customId?.startsWith(prefix)),
		maxCollected: Infinity,
		timeoutMs: BUTTON_TIMEOUT
	});

	collector.on('collect', async buttonInteraction => {
		const id = buttonInteraction.customId ?? '';
		if (id === buttonIds.prev) {
			currentIndex = (currentIndex - 1 + backgrounds.length) % backgrounds.length;
			await safeDeferMessageUpdate(buttonInteraction);
			await interaction.reply(await buildPage());
			return;
		}
		if (id === buttonIds.next) {
			currentIndex = (currentIndex + 1) % backgrounds.length;
			await safeDeferMessageUpdate(buttonInteraction);
			await interaction.reply(await buildPage());
			return;
		}
		if (id === buttonIds.close) {
			await safeDeferMessageUpdate(buttonInteraction);
			collector.stop('closed');
			return;
		}
		if (id === buttonIds.apply) {
			const background = backgrounds[currentIndex];
			if (user.user.bankBackground === background.id) {
				await replyOrFollowUp(buttonInteraction, {
					content: 'This is already your bank background.',
					ephemeral: true
				});
				return;
			}
			const eligibility = await getBankBackgroundEligibility({ user, background, perkTier: userPerkTier });
			if (!eligibility.canUse && eligibility.failure) {
				await replyOrFollowUp(buttonInteraction, {
					content: eligibility.failure.response,
					ephemeral: true
				});
				return;
			}
			const response = await bankBgCommand(buttonInteraction, user, background.name);
			await sendBankBgResponse(buttonInteraction, response);
			await user.sync();
			await interaction.reply(await buildPage());
		}
	});

	collector.on('end', async () => {
		await interaction.reply({ components: [] });
	});

	return SpecialResponse.PaginatedMessageResponse;
}
