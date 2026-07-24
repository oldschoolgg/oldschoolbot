import { EmbedBuilder } from '@oldschoolgg/discord';

interface TestPotatoConfirmationOptions {
	ephemeral?: boolean;
	other_person?: {
		user: {
			id: string;
		};
	};
	another_person?: {
		user: {
			id: string;
		};
	};
}

export async function handleTestPotatoConfirmation(
	user: MUser,
	interaction: OSInteraction,
	rng: RNGProvider,
	options: TestPotatoConfirmationOptions
) {
	const ephemeral = options.ephemeral ?? false;
	const users = [user.id];
	if (options.other_person) users.push(options.other_person.user.id);
	if (options.another_person) users.push(options.another_person.user.id);
	if (ephemeral && users.length > 1) {
		return 'You cannot have multiple people confirm on an ephemeral message.';
	}
	await interaction.confirmation({
		content: `This is a normal confirmation. Users who must confirm: ${users.map(i => `<@${i}>`).join(', ')}`,
		users,
		// @ts-expect-error
		ephemeral
	});
	return interaction.makePaginatedMessage({
		ephemeral: true,
		pages: [
			() => ({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Page 1`)
						.setImage(`https://cdn.oldschool.gg/monkey/${rng.randInt(1, 39)}.webp`)
				]
			}),
			() => ({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Page 2`)
						.setImage(`https://cdn.oldschool.gg/monkey/${rng.randInt(1, 39)}.webp`)
				]
			}),
			() => ({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Page 3`)
						.setImage(`https://cdn.oldschool.gg/monkey/${rng.randInt(1, 39)}.webp`)
				]
			}),
			() => ({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Page 4`)
						.setImage(`https://cdn.oldschool.gg/monkey/${rng.randInt(1, 39)}.webp`)
				]
			})
		]
	});
}
