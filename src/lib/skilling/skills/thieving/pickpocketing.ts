import { Thieve, SkillsEnum } from '../../types';

const pickpocket: Thieve[] = [
    {
        name: 'Man',
        level: 1,
        xp: 8,
        NPC: 'Man'
    },
    {
        name: 'Woman',
        level: 1,
        xp: 8,
        NPC: 'Woman'
    },
    {
        name: 'Farmer',
        level: 10,
        xp: 14.5,
        NPC: ''
    },
    {
        name: 'Female H.A.M. member',
        level: 15,
        xp: 18.5,
        NPC: ''
    },
    {
        name: 'Male H.A.M. member',
        level: 20,
        xp: 22.5,
        NPC: ''
    },
    {
        name: 'Warrior woman',
        level: 25,
        xp: 26,
        NPC: ''
    },
    {
        name: 'Al-Kharid warrior',
        level: 25,
        xp: 26,
        NPC: ''
    },
    {
        name: 'Rogue',
        level: 32,
        xp: 35.5,
        NPC: ''
    },
    {
        name: 'Cave goblin',
        level: 36,
        xp: 40,
        NPC: ''
    },
    {
        name: 'Master Farmer',
        level: 38,
        xp: 43,
        NPC: ''
    },
    {
        name: 'Guard',
        level: 40,
        xp: 46.8,
        NPC: ''
    },
    {
        name: 'Fremennik Citizen',
        level: 45,
        xp: 65,
        NPC: ''
    },
    {
        name: 'Bearded Pollnivnian Bandit',
        level: 45,
        xp: 65,
        NPC: ''
    },
    {
        name: 'Desert Bandit',
        level: 53,
        xp: 79.5,
        NPC: ''
    },
    {
        name: 'Knight of Ardougne',
        level: 55,
        xp: 79.5,
        NPC: ''
    },
    {
        name: 'Pollnivian Bandit',
        level: 55,
        xp: 84.3,
        NPC: ''
    },
    {
        name: 'Yanille Watchman',
        level: 65,
        xp: 137.5,
        NPC: ''
    },
    {
        name: 'Menaphite Thug',
        level: 65,
        xp: 137.5,
        NPC: ''
    },
    {
        name: 'Paladin',
        level: 70,
        xp: 151.7,
        NPC: ''
    },
    {
        name: 'Gnome',
        level: 75,
        xp: 198.5,
        NPC: ''
    },
    {
        name: 'Hero',
        level: 80,
        xp: 275,
        NPC: ''
    },
    {
        name: 'Elf',
        level: 85,
        xp: 353,
        NPC: ''
    },
    {
        name: 'TzHaar-Hur',
        level: 90,
        xp: 103.4,
        NPC: ''
    },

];

const Pickpocket = {
	aliases: ['pickpocket', 'steal'],
    NPC: pickpocket,
    id: SkillsEnum.Thieving,
    level: pickpocket
	//emoji: Emoji.Thieve
};

export default Pickpocket;