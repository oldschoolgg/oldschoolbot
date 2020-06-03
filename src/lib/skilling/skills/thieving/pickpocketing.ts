import { Pickpocket, SkillsEnum } from '../../types';

const pickpocket: Pickpocket[] = [
    {
        name: 'Man',
        level: 1,
        xp: 8,
        pickpocketableNPC: 'Man'
    },
    {
        name: 'Woman',
        level: 1,
        xp: 8,
        pickpocketableNPC: 'Woman'
    },
    {
        name: 'Farmer',
        level: 10,
        xp: 14.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Female H.A.M. member',
        level: 15,
        xp: 18.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Male H.A.M. member',
        level: 20,
        xp: 22.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Warrior woman',
        level: 25,
        xp: 26,
        pickpocketableNPC: ''
    },
    {
        name: 'Al-Kharid warrior',
        level: 25,
        xp: 26,
        pickpocketableNPC: ''
    },
    {
        name: 'Rogue',
        level: 32,
        xp: 35.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Cave goblin',
        level: 36,
        xp: 40,
        pickpocketableNPC: ''
    },
    {
        name: 'Master Farmer',
        level: 38,
        xp: 43,
        pickpocketableNPC: ''
    },
    {
        name: 'Guard',
        level: 40,
        xp: 46.8,
        pickpocketableNPC: ''
    },
    {
        name: 'Fremennik Citizen',
        level: 45,
        xp: 65,
        pickpocketableNPC: ''
    },
    {
        name: 'Bearded Pollnivnian Bandit',
        level: 45,
        xp: 65,
        pickpocketableNPC: ''
    },
    {
        name: 'Desert Bandit',
        level: 53,
        xp: 79.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Knight of Ardougne',
        level: 55,
        xp: 79.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Pollnivian Bandit',
        level: 55,
        xp: 84.3,
        pickpocketableNPC: ''
    },
    {
        name: 'Yanille Watchman',
        level: 65,
        xp: 137.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Menaphite Thug',
        level: 65,
        xp: 137.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Paladin',
        level: 70,
        xp: 151.7,
        pickpocketableNPC: ''
    },
    {
        name: 'Gnome',
        level: 75,
        xp: 198.5,
        pickpocketableNPC: ''
    },
    {
        name: 'Hero',
        level: 80,
        xp: 275,
        pickpocketableNPC: ''
    },
    {
        name: 'Elf',
        level: 85,
        xp: 353,
        pickpocketableNPC: ''
    },
    {
        name: 'TzHaar-Hur',
        level: 90,
        xp: 103.4,
        pickpocketableNPC: ''
    },

];

const Pickpocket = {
	aliases: ['thieving', 'thieve'],
    pickpocket,
    pickpocketableNPC,
	id: SkillsEnum.Pickpocketing,
	//emoji: Emoji.Thieve
};

export default Pickpocket;