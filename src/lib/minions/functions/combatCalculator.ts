
import { KlasaUser } from 'klasa';
import { O } from 'ts-toolbelt';
import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';

export default function combatCalculator(monster: O.Readonly<KillableMonster>, user: O.Readonly<KlasaUser>,) {
    const currentMonster = monster;
    const currentUser = user;
    const combatStyle = user.settings.get(UserSettings.Minion.CombatStyle);
    const monsterKillTime = 0;
    const attackCount = 0;

	return [monsterKillTime, attackCount];
}
