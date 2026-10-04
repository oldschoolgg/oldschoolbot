import { ButtonBuilder, ButtonStyle, EmbedBuilder } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';

import { DISCO_AESTHETICS, type DiscoAesthetic, isDiscoEventActive } from '@/lib/bso/discoBloodbath.js';
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
	Futuristic: 'disco_future',
	Ragdoll: 'disco_ragdoll',
	'Anti-Fashion': 'disco_anti'
};

function ravePalette(slug: string) {
	return ravePalettes.find(palette => palette.slug === slug);
}

export async function discoHandler({
	data,
	user,
	components,
	embeds,
	rng
}: TripFinishEffectOptions) {
	if (
		!isDiscoEventActive() ||
		!user.bloodbathEventStarted ||
		(data.type === 'DiscoBloodbath' && data.isRave)
	)
		return;

	const minutes = Math.floor(data.duration / Time.Minute);
	if (minutes < 1 || !Array.from({ length: minutes }).some(() => rng.roll(75))) return;

	const rave = rng.pick(ravePalettes);
	const presets = await prisma.gearPreset.findMany({
		where: { user_id: user.id, name: { in: Object.values(presetForAesthetic) } },
		select: { name: true }
	});
	const validPresetNames = new Set(presets.map(preset => preset.name));
	const raveName = rave.aesthetics.join(' + ');
	embeds.push(
		new EmbedBuilder()
			.setColor(rave.color)
			.setTitle('Rave invite')
			.setDescription(
				`A **${raveName}** rave starts now. It lasts 10 minutes but awards points as a full trip.\n\nChoosing an aesthetic changes your Fashion gear to that gear preset before your minion goes.`
			)
	);

	for (const aesthetic of DISCO_AESTHETICS) {
		const preset = presetForAesthetic[aesthetic];
		if (!validPresetNames.has(preset)) continue;
		components.push(
			new ButtonBuilder()
				.setCustomId(`DISCO_RAVE_${user.id}_${preset}_${rave.slug}`)
				.setLabel(`Go in ${aesthetic}`)
				.setStyle(ButtonStyle.Primary)
		);
	}
	components.push(
		new ButtonBuilder()
			.setCustomId(`DISCO_RAVE_${user.id}_current_${rave.slug}`)
			.setLabel('Go as you are')
			.setStyle(ButtonStyle.Success)
	);
}

export async function handleDiscoRaveButton(
	user: MUser,
	id: string,
	interaction: OSInteraction
): Promise<CommandResponse> {
	const [, , invitedUserID, ...choiceAndSlug] = id.split('_');
	const slug = choiceAndSlug.pop();
	const choice = choiceAndSlug.join('_');
	if (!invitedUserID || !choice || !slug || user.id !== invitedUserID) {
		return { content: 'This rave invite is not for you.', ephemeral: true };
	}
	if (!isDiscoEventActive() || !user.bloodbathEventStarted) {
		return { content: 'This rave has ended.', ephemeral: true };
	}
	if (await user.minionIsBusy()) return { content: 'Your minion is busy.', ephemeral: true };
	const rave = ravePalette(slug);
	if (!rave) return { content: 'This rave invite is invalid.', ephemeral: true };

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
		raveAesthetics: [...rave.aesthetics],
		effectiveDuration
	});
	return { content: `${user.minionName} is going to the rave. It ends in 10 minutes.`, ephemeral: true };
}
