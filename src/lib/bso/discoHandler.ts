import { DISCO_AESTHETICS, type DiscoAesthetic, DiscoItem, isDiscoEventActive } from '@/lib/bso/discoBloodbath.js';

import { createHash } from 'node:crypto';
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

import type { OSInteraction } from '@/lib/structures/OSInteraction.js';
import type { DiscoBloodbathActivityTaskOptions } from '@/lib/types/minions.js';
import type { TripFinishEffectOptions } from '@/lib/util/handleTripFinish.js';
import { gearPresetEquipCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';

type RavePalette = { aesthetics: DiscoAesthetic[]; color: number; slug: string };

const ravePalettes: RavePalette[] = [
	{ aesthetics: ['Futuristic'], color: 0x00e5ff, slug: 'future' },
	{ aesthetics: ['Ragdoll'], color: 0xff4fa3, slug: 'ragdoll' },
	{ aesthetics: ['Anti-Fashion'], color: 0xc4ff00, slug: 'anti' },
	{ aesthetics: ['Futuristic', 'Ragdoll'], color: 0xa855f7, slug: 'future-ragdoll' },
	{ aesthetics: ['Futuristic', 'Anti-Fashion'], color: 0x39ff88, slug: 'future-anti' },
	{ aesthetics: ['Ragdoll', 'Anti-Fashion'], color: 0xff8a3d, slug: 'ragdoll-anti' },
	{ aesthetics: [...DISCO_AESTHETICS], color: 0xffffff, slug: 'all' }
];

const presetForAesthetic: Record<DiscoAesthetic, string> = {
	Futuristic: 'discofuture',
	Ragdoll: 'discoragdoll',
	'Anti-Fashion': 'discoanti'
};

const presetSlots = [
	['two_handed', '2h'],
	['body', 'body'],
	['cape', 'cape'],
	['feet', 'feet'],
	['hands', 'hands'],
	['head', 'head'],
	['legs', 'legs'],
	['neck', 'neck'],
	['ring', 'ring'],
	['shield', 'shield'],
	['weapon', 'weapon'],
	['ammo', 'ammo']
] as const;

function ravePalette(slug: string) {
	return ravePalettes.find(palette => palette.slug === slug);
}

function createRaveId(userId: string) {
	return createHash('sha256')
		.update(`${userId}${Date.now()}`)
		.digest('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.substr(6, 6);
}

export async function discoHandler({ data, user, components, embeds, rng }: TripFinishEffectOptions) {
	if (!isDiscoEventActive() || !user.bloodbathEventStarted || (data.type === 'DiscoBloodbath' && data.isRave)) return;

	const minutes = Math.floor(data.duration / Time.Minute);
	if (minutes < 1 || !Array.from({ length: minutes }).some(() => rng.roll(75))) return;

	const rave = rng.pick(ravePalettes);
	const presets = await prisma.gearPreset.findMany({
		where: { user_id: user.id, name: { in: Object.values(presetForAesthetic) } },
		select: {
			name: true,
			ammo: true,
			ammo_qty: true,
			two_handed: true,
			body: true,
			cape: true,
			feet: true,
			hands: true,
			head: true,
			legs: true,
			neck: true,
			ring: true,
			shield: true,
			weapon: true
		}
	});
	const validPresetNames = new Set<string>();
	const currentPresetNames = new Set<string>();
	const ineligiblePresetNames = new Set<string>();
	const fashion = user.gear.fashion.raw();
	for (const preset of presets) {
		let eligible = false;
		for (const itemID of [
			preset.two_handed,
			preset.body,
			preset.cape,
			preset.feet,
			preset.hands,
			preset.head,
			preset.legs,
			preset.neck,
			preset.ring,
			preset.shield,
			preset.weapon
		]) {
			if (!itemID) continue;
			const item = new DiscoItem(itemID);
			if (DISCO_AESTHETICS.some(aesthetic => item.points[aesthetic] > 0)) {
				eligible = true;
				break;
			}
		}
		if (!eligible) {
			ineligiblePresetNames.add(preset.name);
			continue;
		}
		validPresetNames.add(preset.name);

		let isCurrentFashion = true;
		for (const [presetSlot, fashionSlot] of presetSlots) {
			const expectedItem = preset[presetSlot];
			const equippedItem = fashion[fashionSlot];
			if (
				(equippedItem?.item ?? null) !== expectedItem ||
				(fashionSlot === 'ammo' && expectedItem !== null && (equippedItem?.quantity ?? 1) !== (preset.ammo_qty ?? 1))
			) {
				isCurrentFashion = false;
				break;
			}
		}
		if (isCurrentFashion) currentPresetNames.add(preset.name);
	}
	const raveName = rave.aesthetics.join(' + ');
	const raveId = createRaveId(user.id);
	await Cache.createDiscoRave(user.id, raveId);
	const missingPresetNames = Object.values(presetForAesthetic).filter(
		preset => !presets.some(existingPreset => existingPreset.name === preset)
	);
	const currentPresetLabel = [...currentPresetNames].map(name => name.replace('disco', '')).join(', ');
	const description = [
		`A **${raveName}** rave starts now. It lasts 10 minutes but awards points as a full trip.\n\nChoosing an aesthetic changes your Fashion gear to that gear preset before your minion goes.`,
		currentPresetNames.size > 0
			? `You are already dressed in your ${currentPresetLabel} outfit. Choose **Let's Go! (${currentPresetLabel})** to keep it on.`
			: null,
		...Array.from(ineligiblePresetNames, name =>
			`Your \`${name}\` preset is not ready for a rave; give it an equipable item with a positive Disco score.`
		),
		validPresetNames.size === 0
			? '⚡ **No Disco outfit is ready for an instant switch.** Your Disco presets appear as instant-equip buttons once an eligible outfit is available.'
			: missingPresetNames.length > 0
				? `Tip: restore ${missingPresetNames.map(name => `\`${name}\``).join(', ')} to keep every instant outfit switch ready for the next rave.`
				: null
	].filter((section): section is string => Boolean(section));
	embeds.push(
		new EmbedBuilder()
			.setColor(rave.color)
			.setTitle('Rave invite')
			.setDescription(description.join('\n\n'))
	);

	for (const aesthetic of DISCO_AESTHETICS) {
		const preset = presetForAesthetic[aesthetic];
		if (!validPresetNames.has(preset) || currentPresetNames.has(preset)) continue;
		components.push(
			new ButtonBuilder()
				.setCustomId(`DISCO_RAVE_${user.id}_${raveId}_${preset}_${rave.slug}`)
				.setLabel(`Go in ${aesthetic}`)
				.setStyle(ButtonStyle.Primary)
		);
	}
	components.push(
		new ButtonBuilder()
			.setCustomId(`DISCO_RAVE_${user.id}_${raveId}_current_${rave.slug}`)
			.setLabel(currentPresetLabel ? `Let's Go! (${currentPresetLabel})` : 'Let\'s Go!')
			.setStyle(ButtonStyle.Success)
	);
}

export async function handleDiscoRaveButton(
	user: MUser,
	id: string,
	interaction: OSInteraction
): Promise<CommandResponse> {
	const [, , invitedUserID, raveId, choice, slug] = id.split('_');
	if (!invitedUserID || !raveId || !choice || !slug || user.id !== invitedUserID) {
		return { content: 'This rave invite is not for you.', ephemeral: true };
	}
	if (!isDiscoEventActive() || !user.bloodbathEventStarted) {
		return { content: 'This rave has ended.', ephemeral: true };
	}
	if (await user.minionIsBusy()) return { content: 'Your minion is busy.', ephemeral: true };
	const rave = ravePalette(slug);
	if (!rave) return { content: 'This rave invite is invalid.', ephemeral: true };
	if (!(await Cache.consumeDiscoRave(user.id, raveId))) {
		return { content: 'This rave invite was already used or expired.', ephemeral: true };
	}

	if (choice !== 'current') {
		if (!Object.values(presetForAesthetic).includes(choice)) {
			return { content: 'This rave outfit is invalid.', ephemeral: true };
		}
		const result = await gearPresetEquipCommand(user, 'fashion', choice);
		if (typeof result === 'string') return { content: result, ephemeral: true };
	}

	const effectiveDuration = await user.calcMaxTripLength('DiscoBloodbath');
	const themeAesthetic = rave.aesthetics[0];
	await ActivityManager.startTrip<DiscoBloodbathActivityTaskOptions>({
		userID: user.id,
		channelId: interaction.channelId,
		duration: Time.Minute * 10,
		type: 'DiscoBloodbath',
		club: `${rave.aesthetics.join(' + ')} Rave`,
		popularity: 100,
		theme: { name: `${rave.aesthetics.join(' + ')} Rave`, good: themeAesthetic, bad: themeAesthetic },
		fashion: user.gear.fashion.raw(),
		isRave: true,
		raveId,
		raveAesthetics: [...rave.aesthetics],
		effectiveDuration
	});
	return { content: `${user.minionName} is going to the rave. It ends in 10 minutes.` };
}
