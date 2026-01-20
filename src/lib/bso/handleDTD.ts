import { itemID } from 'oldschooljs';

import type { KillableMonster } from '@/lib/minions/types.js';
import { findBingosWithUserParticipating } from '@/mahoji/lib/bingo/BingoManager.js';

export async function handleDTD(monster: KillableMonster, user: MUser) {
	const rangeSetup = { ...user.gear.range.raw() };
	if (rangeSetup.weapon?.item === itemID('Deathtouched dart')) {
		const bingos = await findBingosWithUserParticipating(user.id);
		if (bingos.some(bingo => bingo.isActive())) {
			return 'You cannot use Deathtouched darts while in an active Bingo.';
		}
		if (rangeSetup.weapon.quantity > 1) {
			rangeSetup.weapon.quantity--;
		} else {
			rangeSetup.weapon = null;
		}
		await user.updateGear([
			{
				setup: 'range',
				gear: rangeSetup
			}
		]);

		if (monster.name === 'Koschei the deathless') {
			return (
				'You send your minion off to fight Koschei with a Deathtouched dart, they stand a safe distance and throw the dart - Koschei immediately locks' +
				' eyes with your minion and grabs the dart mid-air, and throws it back, killing your minion instantly.'
			);
		}

		if (monster.name === 'Solis') {
			return 'The dart melts into a crisp dust before coming into contact with Solis.';
		}

		if (monster.name === 'Celestara') {
			return 'Your minion threw the dart at the moon, it did not reach.';
		}

		if (monster.name === 'Yeti') {
			return 'You send your minion off to fight Yeti with a Deathtouched dart, they stand a safe distance and throw the dart - the cold, harsh wind blows it out of the air. Your minion runs back to you in fear.';
		}

		if (monster.name === 'Akumu') {
			return 'You throw your dart into the darkness for it to never return.';
		}

		if (monster.name === 'Venatrix') {
			return `You throw your dart but gets stuck in Venatrix's web.`;
		}

		await user.statsUpdate({
			death_touched_darts_used: {
				increment: 1
			}
		});

		return true;
	}

	if (monster.name === 'Koschei the deathless') {
		return 'You send your minion off to fight Koschei, before they even get close, they feel an immense, powerful fear and return back.';
	}

	return false;
}
