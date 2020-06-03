
import { Blackjack, SkillsEnum } from '../../types';
//import itemID from 'c:/Users/Stephen Montague/Desktop/GitHub Fork/oldschoolbot/src/lib/util/itemID';

const thieve: Blackjack[] = [
    {
        name: 'Bearded Pollnivnian Bandit',
        level: 45,
	    xp: 65,
    },
    {
        name: 'Desert Bandit',
        level: 53,
	    xp: 79.5,
    },
    {
        name: 'Pollnivian Bandit',
        level: 55,
	    xp: 84.3,
    },
    {
        name: 'Menaphite Thug',
        level: 65,
	    xp: 137.5,
    }
];

const Blackjack = {
	aliases: ['thieving', 'thieve'],
	Thieve: thieve,
	id: SkillsEnum.Blackjacking,
	//emoji: Emoji.Thieve
};

export default Blackjack;