
import { Thieve, SkillsEnum } from '../types';
import itemID from 'c:/Users/Stephen Montague/Desktop/GitHub Fork/oldschoolbot/src/lib/util/itemID';

const thieve: Thieve[] = [
    {
        name: 'Man',
        level: 1,
	    xp: 8,
        inputId: itemID('Man')
    },
    {
        name: 'Woman',
        level: 1,
	    xp: 8,
        inputId: itemID('Woman')
    },
    {
        name: 'Farmer',
        level: 10,
	    xp: 14.5,
        inputId: itemID('Farmer')
    },
    {
        name: 'Female H.A.M. member',
        level: 15,
	    xp: 18.5,
        inputId: itemID('Female H.A.M. member')
    },
    {
        name: 'Male H.A.M. member',
        level: 20,
	    xp: 22.5,
        inputId: itemID('Male H.A.M. member')
    },
    {
        name: 'Warrior woman',
        level: 25,
	    xp: 26,
        inputId: itemID('Warrior woman')
    },
    {
        name: 'Al-Kharid warrior',
        level: 25,
	    xp: 26,
        inputId: itemID('')
    },
    {
        name: 'Rogue',
        level: 32,
	    xp: 35.5,
        inputId: itemID('')
    },
    {
        name: 'Cave goblin',
        level: 36,
	    xp: 40,
        inputId: itemID('')
    },
    {
        name: 'Master Farmer',
        level: 38,
	    xp: 43,
        inputId: itemID('')
    },
    {
        name: 'Guard',
        level: 40,
	    xp: 46.8,
        inputId: itemID('')
    },
    {
        name: 'Fremennik Citizen',
        level: 45,
	    xp: 65,
        inputId: itemID('')
    },
    {
        name: 'Bearded Pollnivnian Bandit',
        level: 45,
	    xp: 65,
        inputId: itemID('')
    },
    {
        name: 'Desert Bandit',
        level: 53,
	    xp: 79.5,
        inputId: itemID('')
    },
    {
        name: 'Knight of Ardougne',
        level: 55,
	    xp: 79.5,
        inputId: itemID('')
    },
    {
        name: 'Pollnivian Bandit',
        level: 55,
	    xp: 84.3,
        inputId: itemID('')
    },
    {
        name: 'Yanille Watchman',
        level: 65,
	    xp: 137.5,
        inputId: itemID('')
    },
    {
        name: 'Menaphite Thug',
        level: 65,
	    xp: 137.5,
        inputId: itemID('')
    },
    {
        name: 'Paladin',
        level: 70,
	    xp: 151.7,
        inputId: itemID('')
    },
    {
        name: 'Gnome',
        level: 75,
	    xp: 198.5,
        inputId: itemID('')
    },
    {
        name: 'Hero',
        level: 80,
	    xp: 275,
        inputId: itemID('')
    },
    {
        name: 'Elf',
        level: 85,
	    xp: 353,
        inputId: itemID('')
    },
    {
        name: 'TzHaar-Hur',
        level: 90,
	    xp: 103.4,
        inputId: itemID('')
    },

];

const Thieve = {
	aliases: ['thieving', 'thieve'],
	Thieve: thieve,
	id: SkillsEnum.Thieving,
	//emoji: Emoji.Thieve
};

export default Thieve;