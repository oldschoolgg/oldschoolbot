import { Castable } from '../../../types';
import itemID from '../../../../util/itemID';
import { resolveNameBank } from '../../../../util';

const Standard: Castable[] = [
    {
        name: 'Wind strike',
        level: 1,
        xp: 5.5,
        baseMaxHit: 2,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Mind rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Confuse',
        level: 3,
        xp: 13,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 2, 'Water rune': 3, 'Body rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Confuse',
        level: 3,
        xp: 13,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 2, 'Water rune': 3, 'Body rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Enchant crossbow bolt (Opal)',
        id: itemID('Opal bolts (e)'),
        level: 4,
        xp: 9,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Opal bolts': 10, 'Air rune': 2, 'Cosmic rune': 1 }),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Water strike',
        level: 5,
        xp: 7.5,
        baseMaxHit: 4,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Water rune': 1, 'Mind rune': 1 }),
        tickRate: 5
    },
    { //Hmm id?
        name: 'Lvl-1 enchant',
        id: itemID('Jeweleryssss'),
        level: 7,
        xp: 17.5,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Water rune': 1, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Sapphire)',
        id: itemID('Sapphire bolts (e)'),
        level: 7,
        xp: 17.5,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Sapphire bolts': 10, 'Water rune': 1, 'Cosmic rune': 1, 'Mind rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Earth strike',
        level: 9,
        xp: 9.5,
        baseMaxHit: 6,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Earth rune': 2, 'Mind rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Weaken',
        level: 11,
        xp: 21,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 2, 'Water rune': 3, 'Body rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Fire strike',
        level: 13,
        xp: 11.5,
        baseMaxHit: 8,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 2, 'Fire rune': 3, 'Mind rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Enchant crossbow bolt (Jade)',
        id: itemID('Jade bolts (e)'),
        level: 14,
        xp: 19,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jade bolts': 10, 'Earth rune': 2, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Bones to bananas',
        id: itemID('Banana'),
        level: 15,
        xp: 25,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Bones': 28, 'Earth rune': 2, 'Water rune': 2, 'Nature rune': 1}),
        tickRate: 1,
        outputMultiple: 28
    },
    {
        name: 'Wind bolt',
        level: 17,
        xp: 13.5,
        baseMaxHit: 9,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 2, 'Chaos rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Curse',
        level: 19,
        xp: 29,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 3, 'Water rune': 2, 'Body rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Bind',
        level: 20,
        xp: 30,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 3, 'Water rune': 3, 'Nature rune': 1 }),
        tickRate: 5
    },
    { // ItemID and inputitems??
        name: 'Low level alchemy',
        id: itemID('AlchableITEMSSSS'),
        level: 21,
        xp: 31,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'AlchableITEMSS': 1, 'Fire rune': 3, 'Nature rune': 1 }),
        tickRate: 3
    },
    {
        name: 'Water bolt',
        level: 23,
        xp: 16.5,
        baseMaxHit: 10,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 2, 'Water rune': 2, 'Chaos rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Enchant crossbow bolt (Pearl)',
        id: itemID('Pearl bolts (e)'),
        level: 24,
        xp: 29,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Pearl bolts': 10, 'Water rune': 2, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Varrock teleport',
        level: 25,
        xp: 35,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Fire rune': 1, 'Law rune': 1}),
        tickRate: 4
    },
    { //Hmm id?
        name: 'Lvl-2 enchant',
        id: itemID('Jeweleryssss'),
        level: 27,
        xp: 37,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Air rune': 3, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Emerald)',
        id: itemID('Emerald bolts (e)'),
        level: 27,
        xp: 37,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Emerald bolts': 10, 'Nature rune': 1, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Earth bolt',
        level: 29,
        xp: 19.5,
        baseMaxHit: 11,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 2, 'Earth rune': 3, 'Chaos rune': 1 }),
        tickRate: 5
    },
    {   /// Check if correct
        name: 'Enchant crossbow bolt (Red topaz)',
        id: itemID('Topaz bolts (e)'),
        level: 29,
        xp: 33,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Topaz bolts': 10, 'Fire rune': 2, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Lumbridge teleport',
        level: 31,
        xp: 41,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Earth rune': 1, 'Law rune': 1}),
        tickRate: 4
    },
    {
        name: 'Telekinetic grab',
        level: 33,
        xp: 43,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Law rune': 1}),
        tickRate: 5
    },
    {
        name: 'Fire bolt',
        level: 35,
        xp: 22.5,
        baseMaxHit: 12,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Fire rune': 4, 'Chaos rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Falador teleport',
        level: 37,
        xp: 48,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Water rune': 1, 'Law rune': 1}),
        tickRate: 4
    },
    {
        name: 'Crumble undead',
        level: 39,
        xp: 24.5,
        baseMaxHit: 15,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 2, 'Earth rune': 2, 'Chaos rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Teleport to house',
        level: 40,
        xp: 30,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Earth rune': 1, 'Law rune': 1}),
        tickRate: 4
    },
    {
        name: 'Wind blast',
        level: 41,
        xp: 25.5,
        baseMaxHit: 13,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Death rune': 1 }),
        tickRate: 5
    },
    { // ItemID and inputitems??
        name: 'Superheat item',
        id: itemID('SmeltedBAR'),
        level: 43,
        xp: 53,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'ORESSSS': 1, 'Fire rune': 4, 'Nature rune': 1 }),
        tickRate: 3
    },
    {
        name: 'Camelot teleport',
        level: 45,
        xp: 55.5,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Air rune': 5, 'Law rune': 1}),
        tickRate: 4
    },
    {
        name: 'Water blast',
        level: 47,
        xp: 28.5,
        baseMaxHit: 14,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Water rune': 3, 'Death rune': 1 }),
        tickRate: 5
    },
    { //Hmm id?
        name: 'Lvl-3 enchant',
        id: itemID('Jeweleryssss'),
        level: 49,
        xp: 59,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Fire rune': 5, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Ruby)',
        id: itemID('Ruby bolts (e)'),
        level: 49,
        xp: 59,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Ruby bolts': 10, 'Fire rune': 5, 'Blood rune': 1, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Iban blast',
        level: 50,
        xp: 30,
        baseMaxHit: 25,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Fire rune': 5, 'Death rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Snare',
        level: 50,
        xp: 60,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 4, 'Water rune': 4, 'Nature rune': 3 }),
        tickRate: 5
    },
    {
        name: 'Magic Dart',
        level: 50,
        xp: 30,
        baseMaxHit: 15,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Mind rune': 4, 'Death rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Ardougne teleport',
        level: 51,
        xp: 61,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Water rune': 2, 'Law rune': 2}),
        tickRate: 4
    },
    {
        name: 'Earth blast',
        level: 53,
        xp: 31.5,
        baseMaxHit: 15,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Earth rune': 4, 'Death rune': 1 }),
        tickRate: 5
    },
    { // ItemID and inputitems??
        name: 'High level alchemy',
        id: itemID('AlchableITEMSSSS'),
        level: 55,
        xp: 65,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'AlchableITEMSS': 1, 'Fire rune': 5, 'Nature rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Charge water orb',
        id: itemID('Water orb'),
        level: 56,
        xp: 66,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Unpowered orb': 1, 'Water rune': 30, 'Cosmic rune': 3}),
        tickRate: 3,
    },
    { //Hmm id?
        name: 'Lvl-4 enchant',
        id: itemID('Jeweleryssss'),
        level: 57,
        xp: 67,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Earth rune': 10, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Diamond)',
        id: itemID('Diamond bolts (e)'),
        level: 57,
        xp: 67,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Diamond bolts': 10, 'Earth rune': 10, 'Law rune': 2, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Watchtower teleport',
        level: 58,
        xp: 68,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Earth rune': 2, 'Law rune': 2}),
        tickRate: 4
    },
    {
        name: 'Fire blast',
        level: 59,
        xp: 34.5,
        baseMaxHit: 16,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 4, 'Fire rune': 5, 'Death rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Charge earth orb',
        id: itemID('Earth orb'),
        level: 60,
        xp: 70,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Unpowered orb': 1, 'Earth rune': 30, 'Cosmic rune': 3}),
        tickRate: 3,
    },
    { //Double check xp gains
        name: 'Bones to peaches',
        id: itemID('Peach'),
        level: 60,
        xp: 35.5,
        category: 'Skilling',
        inputItems: resolveNameBank({ 'Bones': 28, 'Earth rune': 4, 'Water rune': 4, 'Nature rune': 2}),
        tickRate: 1,
        outputMultiple: 28
    },
    {
        name: 'Saradomin strike',
        level: 60,
        xp: 61,
        baseMaxHit: 20,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 4, 'Fire rune': 2, 'Blood rune': 2}),
        tickRate: 5
    },
    {
        name: 'Claws of guthix',
        level: 60,
        xp: 61,
        baseMaxHit: 20,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 4, 'Fire rune': 1, 'Blood rune': 2}),
        tickRate: 5
    },
    {
        name: 'Flames of zamorak',
        level: 60,
        xp: 61,
        baseMaxHit: 20,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 1, 'Fire rune': 4, 'Blood rune': 2}),
        tickRate: 5
    },
    {
        name: 'Trollheim teleport',
        level: 61,
        xp: 68,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Fire rune': 2, 'Law rune': 2}),
        tickRate: 4
    },
    {
        name: 'Wind wave',
        level: 62,
        xp: 36,
        baseMaxHit: 17,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 5, 'Blood rune': 1}),
        tickRate: 5
    },
    {
        name: 'Charge fire orb',
        id: itemID('Fire orb'),
        level: 63,
        xp: 73,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Unpowered orb': 1, 'Fire rune': 30, 'Cosmic rune': 3}),
        tickRate: 3,
    },
    {
        name: 'Aple atoll teleport',
        level: 64,
        xp: 74,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Fire rune': 2, 'Water rune': 2, 'Law rune': 2, 'Banana': 1}),
        tickRate: 4
    },
    {
        name: 'Water wave',
        level: 65,
        xp: 37.5,
        baseMaxHit: 18,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 5, 'Water rune': 7, 'Blood rune': 1}),
        tickRate: 5
    },
    {
        name: 'Charge airorb',
        id: itemID('Air orb'),
        level: 66,
        xp: 76,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Unpowered orb': 1, 'Air rune': 30, 'Cosmic rune': 3}),
        tickRate: 3,
    },
    {
        name: 'Vulnerability',
        level: 66,
        xp: 76,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 5, 'Water rune': 5, 'Soul rune': 1 }),
        tickRate: 5
    },
    { //Hmm id?
        name: 'Lvl-5 enchant',
        id: itemID('Jeweleryssss'),
        level: 68,
        xp: 78,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Earth rune': 15,'Water rune': 15, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Dragonstone)',
        id: itemID('Dragonstone bolts (e)'),
        level: 68,
        xp: 78,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Dragonstone bolts': 10, 'Earth rune': 15, 'Soul rune': 1, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Kourend Castle teleport',
        level: 69,
        xp: 82,
        category: 'Teleport',
        inputItems: resolveNameBank({ 'Fire rune': 5, 'Water rune': 4, 'Law rune': 2, 'Soul rune': 2}),
        tickRate: 4
    },
    {
        name: 'Earth wave',
        level: 70,
        xp: 40,
        baseMaxHit: 19,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 5, 'Earth rune': 7, 'Blood rune': 1}),
        tickRate: 5
    },
    {
        name: 'Enfeeble',
        level: 73,
        xp: 83,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 8, 'Water rune': 8, 'Soul rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Teleother lumbridge',
        level: 74,
        xp: 84,
        category: 'Teleport',
        inputItems: resolveNameBank({'Earth rune': 1, 'Law rune': 1, 'Soul rune': 1}),
        tickRate: 10
    },
    {
        name: 'Fire wave',
        level: 75,
        xp: 42.5,
        baseMaxHit: 20,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 5, 'Fire rune': 7, 'Blood rune': 1}),
        tickRate: 5
    },
    {
        name: 'Entangle',
        level: 79,
        xp: 70,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 5, 'Water rune': 5, 'Nature rune': 4 }),
        tickRate: 5
    },
    {
        name: 'Stun',
        level: 80,
        xp: 90,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Earth rune': 12, 'Water rune': 12, 'Soul rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Charge',
        level: 80,
        xp: 180,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 3, 'Fire rune': 3, 'Blood rune': 3}),
        tickRate: 175
    },
    {
        name: 'Wind surge',
        level: 81,
        xp: 44.5,
        baseMaxHit: 21,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 7, 'Wrath rune': 1}),
        tickRate: 5
    },
    {
        name: 'Teleother falador',
        level: 82,
        xp: 92,
        category: 'Teleport',
        inputItems: resolveNameBank({'Water rune': 1, 'Law rune': 1, 'Soul rune': 1}),
        tickRate: 10
    },
    {
        name: 'Water surge',
        level: 85,
        xp: 46.5,
        baseMaxHit: 22,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 7, 'Water rune': 10, 'Wrath rune': 1}),
        tickRate: 5
    },
    {
        name: 'Tele block',
        level: 85,
        xp: 90,
        category: 'Curse',
        inputItems: resolveNameBank({ 'Chaos rune': 1, 'Death rune': 1, 'Law rune': 1 }),
        tickRate: 5
    },
    {
        name: 'Teleport to bounty target',
        level: 85,
        xp: 45,
        category: 'Teleport',
        inputItems: resolveNameBank({'Chaos rune': 1, 'Death rune': 1, 'Law rune': 1}),
        tickRate: 4
    },
    { //Hmm id?
        name: 'Lvl-6 enchant',
        id: itemID('Jeweleryssss'),
        level: 87,
        xp: 97,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Earth rune': 20, 'Fire rune': 20, 'Cosmic rune': 1 }),
        tickRate: 3,
    },
    {
        name: 'Enchant crossbow bolt (Onyx)',
        id: itemID('Onyx bolts (e)'),
        level: 87,
        xp: 97,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Onyx bolts': 10, 'Fire rune': 20, 'Death rune': 1, 'Cosmic rune': 1}),
        tickRate: 1,
        outputMultiple: 10
    },
    {
        name: 'Teleother camelot',
        level: 90,
        xp: 100,
        category: 'Teleport',
        inputItems: resolveNameBank({'Law rune': 1, 'Soul rune': 2}),
        tickRate: 10
    },
    {
        name: 'Earth surge',
        level: 90,
        xp: 48.5,
        baseMaxHit: 23,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 7, 'Earth rune': 10, 'Wrath rune': 1}),
        tickRate: 5
    },
    { //Hmm id?
        name: 'Lvl-7 enchant',
        id: itemID('Jeweleryssss'),
        level: 93,
        xp: 110,
        category: 'Enchantment',
        inputItems: resolveNameBank({ 'Jewelerysss': 1, 'Blood rune': 20, 'Cosmic rune': 1, 'Soul rune': 20 }),
        tickRate: 3,
    },
    {
        name: 'Fire surge',
        level: 95,
        xp: 50.5,
        baseMaxHit: 24,
        category: 'Combat',
        inputItems: resolveNameBank({ 'Air rune': 7, 'Fire rune': 10, 'Wrath rune': 1}),
        tickRate: 5
    },
];

export default Standard;