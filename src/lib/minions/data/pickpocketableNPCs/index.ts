import { PickpocketableNPC } from '../../types';
import { Monsters } from 'oldschooljs';
import { Time } from '../../../constants';

const pickpocketableNPC: PickpocketableNPC[] = [
    {
        id: Monsters.Man.id,
        name: Monsters.Man.id,
        aliases: Monsters.Man.aliases,
        timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
    }
];

export default pickpocketableNPC;