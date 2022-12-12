import Monster from 'oldschooljs/dist/structures/Monster';

import { effectiveMonsters } from '../minions/data/killableMonsters';
import { getMinigameScore, Minigames } from '../settings/minigames';
import creatures from '../skilling/skills/hunter/creatures';
import { stringMatches } from './cleanString';

export async function getKCByName(user: MUser, kcName: string): Promise<[string, number] | [null, 0]> {
	const mon = effectiveMonsters.find(
		mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (mon) {
		return [mon.name, user.getKC((mon as unknown as Monster).id)];
	}

	const minigame = Minigames.find(
		game => stringMatches(game.name, kcName) || game.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (minigame) {
		return [minigame.name, await getMinigameScore(user.id, minigame.column)];
	}

	const creature = creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));
	if (creature) {
		return [creature.name, user.getCreatureScore(creature.id)];
	}

	const special: [string[], number][] = [
		[['superior', 'superiors', 'superior slayer monster'], user.user.slayer_superior_count],
		[['tithefarm', 'tithe'], user.user.stats_titheFarmsCompleted]
	];
	const res = special.find(s => s[0].includes(kcName));
	if (res) {
		return [res[0][0], res[1]];
	}

	return [null, 0];
}
