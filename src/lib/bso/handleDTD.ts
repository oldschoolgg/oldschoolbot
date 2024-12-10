import type { Prisma } from '@prisma/client';
import { findBingosWithUserParticipating } from '../../mahoji/lib/bingo/BingoManager';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import type { KillableMonster } from '../minions/types';
import { itemID } from '../util';

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
		await user.update({
			gear_range: rangeSetup as Prisma.InputJsonObject
		});

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

		if ([BSOMonsters.Akumu.id, BSOMonsters.Venatrix.id].includes(monster.id)) {
			return 'This monster is temporarily unable to be killed with a Deathtouched dart.';
		}

		await userStatsUpdate(user.id, {
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
