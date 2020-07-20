import { Castable } from '../../../types';
import itemID from '../../../../util/itemID';
import { resolveNameBank } from '../../../../util';

const Lunar: Castable[] = [
    { //Different pies
        name: 'Bake pie',
        id: itemID('DIFFERENTPIE'),
        level: 65,
        xp: 60,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'PIESSSS': 1, 'Fire rune': 5, 'Water rune': 4, 'Astral rune': 1}),
        tickRate: 3
    },
    { //Gives farming information, same as Andres current command. 
        name: 'Geomancy',
        level: 65,
        xp: 60,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Earth rune': 8, 'Nature rune': 3, 'Astral rune': 3}),
        tickRate: 100
    },
    { //Cure a plant // farming xp?
        name: 'Cure plant',
        level: 66,
        xp: 60,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Earth rune': 8, 'Astral rune': 1}),
        tickRate: 100
    },
    { //Gives monster info similar to +monster monstername
        name: 'Monster examine',
        level: 66,
        xp: 61,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Cosmic rune': 1, 'Mind rune': 1, 'Astral rune': 1}),
        tickRate: 100
    },
    { //Contacts NPC
        name: 'Npc contact',
        level: 67,
        xp: 63,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Cosmic rune': 1, 'Air rune': 2, 'Astral rune': 1}),
        tickRate: 100
    },
    { //Different water containers
        name: 'Humidify',
        id: itemID('DIFFERENTWatercontainters'),
        level: 68,
        xp: 65,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'emptycontainer': 28, 'Fire rune': 1, 'Water rune': 3, 'Astral rune': 1}),
        tickRate: 3,
        outputMultiple: 28
    },
    { //Hunter kit spell
        name: 'Hunter kit',
        id: itemID('Hunter kit'),
        level: 71,
        xp: 70,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Earth rune': 2, 'Astral rune': 2}),
        tickRate: 100
    },
    { //Shows target persons stats
        name: 'Stat spy',
        level: 75,
        xp: 76,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Body rune': 5, 'Cosmic rune': 2, 'Astral rune': 2}),
        tickRate: 100
    },
    {
        name: 'Spin flax',
        id: itemID('Bow string'),
        level: 76,
        xp: 75,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Flax': 5, 'Air rune': 5, 'Astral rune': 1, 'Nature rune': 2}),
        tickRate: 5
    },
    { //Look over tickrate and items
        name: 'Superglass make',
        id: itemID('Molten glass'),
        level: 77,
        xp: 78,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'MoltenGLASSITEMS': 28, 'Air rune': 10, 'Fire rune': 6, 'Astral rune': 2}),
        tickRate: 100,
        outputMultiple: 28
    },
    { //Look over hideinput and outputs
        name: 'Tan leather',
        id: itemID('LeatherNAME'),
        level: 78,
        xp: 81,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'hideNAME': 5, 'Nature rune': 1, 'Fire rune': 5, 'Astral rune': 2}),
        tickRate: 3,
        outputMultiple: 5
    },
    { //Look over tickrate
        name: 'Dream',
        level: 79,
        xp: 82,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Body rune': 5, 'Cosmic rune': 1, 'Astral rune': 2}),
        tickRate: 100,
    },
    { //Jewellerys?
        name: 'String jewellery',
        id: itemID('JEWELLERY'),
        level: 80,
        xp: 83,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Jewelleries': 1, 'Earth rune': 10, 'Astral rune': 1, 'Water rune': 5}),
        tickRate: 3
    },
    { //Combine runes?
        name: 'Magic Imbue',
        id: itemID('CombinedRUNE'),
        level: 82,
        xp: 86,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'CombineRUNES': 1, 'Fire rune': 7, 'Astral rune': 2, 'Water rune': 7}),
        tickRate: 21
    },
    {
        name: 'Fertile soil',
        level: 83,
        xp: 87,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Earth rune': 15, 'Astral rune': 3, 'Nature rune': 2}),
        tickRate: 100
    },
    { //Plank make
        name: 'Plank make',
        id: itemID('PlankName'),
        level: 86,
        xp: 90,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'PlankLog': 1, 'Earth rune': 15, 'Astral rune': 2, 'Nature rune': 1}),
        tickRate: 3
    },
    { //Jewelleries? tickrate?
        name: 'Recharge dragonstone',
        id: itemID('ChargedDragonjewellerys'),
        level: 89,
        xp: 97.5,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'UnchargedDragonjewl': 28, 'Water rune': 4, 'Astral rune': 1, 'Soul rune': 1}),
        tickRate: 100,
        outputMultiple: 28
    },
    {
        name: 'Spellbook swap',
        level: 96,
        xp: 130,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Cosmic rune': 2, 'Astral rune': 3, 'Law rune': 1}),
        tickRate: 100
    },
    // Reminder Support spells tommorow
];

export default Lunar;