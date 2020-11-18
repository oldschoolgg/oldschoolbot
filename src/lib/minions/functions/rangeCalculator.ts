import { KlasaUser } from 'klasa';

import { KillableMonster } from '../types';

export default function rangeCalculator(monster: KillableMonster, user: KlasaUser) {
    const mon = monster;
    const u = user;
    return [mon, u];
}